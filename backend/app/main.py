import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import attendance, face
from app.core.database import Database
from app.core.config import get_settings
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.face_embedding_repository import FaceEmbeddingRepository
from app.repositories.student_repository import StudentRepository
from app.services.attendance_service import AttendanceService
from app.services.face_service import FaceRecognitionService

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()
attendance_service: AttendanceService


@asynccontextmanager
async def lifespan(app: FastAPI):
    global attendance_service

    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is required for the FastAPI face service.")

    database = Database(settings.database_url)
    database.ensure_face_schema()

    student_repository = StudentRepository(database)
    face_embedding_repository = FaceEmbeddingRepository(database)
    attendance_repository = AttendanceRepository(database)
    attendance_service = AttendanceService(attendance_repository)

    face_service = FaceRecognitionService(settings, student_repository, face_embedding_repository)
    face_service.load_model()
    app.state.face_service = face_service
    app.state.attendance_service = attendance_service
    logger.info("Face match threshold configured at %.3f. Tune this with real webcam tests.", settings.face_match_threshold)
    yield


app = FastAPI(title="SmartAttend Face API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(face.router)
app.include_router(attendance.router)


@app.get("/api/health")
async def health():
    return {
        "ok": True,
        "service": "smartattend-face-api",
        "model_pack": settings.face_model_pack,
        "embedding_dim": 512,
        "threshold": settings.face_match_threshold,
    }
