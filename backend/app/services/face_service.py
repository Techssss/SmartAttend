import logging
from dataclasses import dataclass
from typing import Any

import cv2
import numpy as np

from app.core.config import Settings
from app.repositories.face_embedding_repository import FaceEmbeddingRepository
from app.repositories.student_repository import StudentRepository
from app.services.embedding_service import as_embedding_array, cosine_similarity, normalize_embedding

logger = logging.getLogger(__name__)


@dataclass
class FaceEmbeddingResult:
    embedding: np.ndarray
    quality_score: float | None


class FaceRecognitionService:
    def __init__(
        self,
        settings: Settings,
        student_repository: StudentRepository,
        face_embedding_repository: FaceEmbeddingRepository,
    ):
        self.settings = settings
        self.student_repository = student_repository
        self.face_embedding_repository = face_embedding_repository
        self.model = None

    def load_model(self) -> None:
        from insightface.app import FaceAnalysis

        self.model = FaceAnalysis(
            name=self.settings.face_model_pack,
            providers=self.settings.face_providers,
        )
        self.model.prepare(ctx_id=-1, det_size=self.settings.face_detection_size)
        logger.info("InsightFace model loaded: pack=%s detector=SCRFD recognizer=ArcFace", self.settings.face_model_pack)

    def get_face_embedding(self, image: np.ndarray) -> FaceEmbeddingResult:
        if self.model is None:
            raise RuntimeError("Face recognition model is not loaded.")

        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        faces = self.model.get(rgb_image)

        if not faces:
            logger.info("No face detected")
            raise LookupError("NO_FACE")
        if len(faces) > 1:
            logger.info("Multiple faces detected: count=%s", len(faces))
            raise ValueError("MULTIPLE_FACES")

        face = faces[0]
        embedding = normalize_embedding(np.asarray(face.embedding, dtype=np.float32))
        if embedding.shape[0] != 512:
            raise RuntimeError(f"Unexpected embedding size: {embedding.shape[0]}")

        quality_score = float(getattr(face, "det_score", 0.0)) if getattr(face, "det_score", None) is not None else None
        return FaceEmbeddingResult(embedding=embedding, quality_score=quality_score)

    def register_face(self, student_id: str, image: np.ndarray) -> dict[str, Any]:
        student = self.student_repository.get_student(student_id)
        if not student:
            raise LookupError("STUDENT_NOT_FOUND")

        result = self.get_face_embedding(image)
        row = self.face_embedding_repository.save_embedding(
            student_id=student_id,
            embedding=result.embedding.tolist(),
            image_quality_score=result.quality_score,
        )
        return {
            "student_id": student_id,
            "student_name": student["name"],
            "embedding_id": row["id"],
            "embedding_dim": int(result.embedding.shape[0]),
            "image_quality_score": result.quality_score,
        }

    def recognize_face(self, image: np.ndarray) -> dict[str, Any]:
        try:
            result = self.get_face_embedding(image)
        except LookupError:
            return {"matched": False, "confidence": 0.0, "reason": "NO_FACE"}
        except ValueError:
            return {"matched": False, "confidence": 0.0, "reason": "MULTIPLE_FACES"}

        stored_embeddings = self.face_embedding_repository.list_active_embeddings()
        best = self.compare_embeddings(result.embedding, stored_embeddings)
        if best is None:
            return {"matched": False, "confidence": 0.0, "reason": "NO_REGISTERED_FACE"}

        threshold = self.settings.face_match_threshold
        confidence = best["confidence"]
        if confidence < threshold:
            return {"matched": False, "confidence": confidence, "reason": "LOW_CONFIDENCE"}

        student = best.get("student") or {}
        logger.info("Matched student=%s confidence=%.4f", best["student_id"], confidence)
        return {
            "matched": True,
            "student_id": best["student_id"],
            "student_name": student.get("name") or best["student_id"],
            "confidence": confidence,
            "reason": "MATCHED",
        }

    def compare_embeddings(self, query_embedding: np.ndarray, stored_embeddings: list[dict[str, Any]]) -> dict[str, Any] | None:
        best: dict[str, Any] | None = None
        for row in stored_embeddings:
            stored = as_embedding_array(row["embedding_values"])
            score = cosine_similarity(query_embedding, stored)
            if best is None or score > best["confidence"]:
                best = {**row, "confidence": score}
        return best
