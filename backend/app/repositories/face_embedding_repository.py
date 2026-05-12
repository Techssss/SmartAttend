import json
import time
from typing import Any
from uuid import uuid4

from psycopg.types.json import Jsonb

from app.core.database import Database


class FaceEmbeddingRepository:
    def __init__(self, database: Database):
        self.database = database
        self._cache: list[dict[str, Any]] = []
        self._cache_loaded_at = 0.0
        self._cache_ttl_seconds = 30.0

    def save_embedding(self, student_id: str, embedding: list[float], image_quality_score: float | None = None) -> dict[str, Any]:
        embedding_id = str(uuid4())
        with self.database.connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    insert into public.face_embeddings
                      (id, student_id, embedding, embedding_json, image_quality_score, is_active)
                    values (%s, %s, %s, %s, %s, true)
                    returning id, student_id, image_quality_score, created_at, is_active
                    """,
                    (embedding_id, student_id, json.dumps(embedding), Jsonb(embedding), image_quality_score),
                )
                row = cursor.fetchone()
            connection.commit()
        self.invalidate_cache()
        return row

    def list_active_embeddings(self) -> list[dict[str, Any]]:
        now = time.monotonic()
        if self._cache and now - self._cache_loaded_at < self._cache_ttl_seconds:
            return self._cache

        with self.database.connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select
                      f.id,
                      f.student_id,
                      f.embedding,
                      f.embedding_json,
                      u.id as user_id,
                      u.name as user_name,
                      u.email as user_email
                    from public.face_embeddings f
                    join public.app_users u on u.id = f.student_id
                    where coalesce(f.is_active, true) = true
                      and u.role = 'student'
                    """
                )
                rows = cursor.fetchall()

        embeddings: list[dict[str, Any]] = []
        for row in rows:
            values = row.get("embedding_json")
            if values is None and row.get("embedding"):
                values = json.loads(row["embedding"])
            if values:
                embeddings.append({
                    **row,
                    "embedding_values": values,
                    "student": {
                        "id": row["user_id"],
                        "name": row["user_name"],
                        "email": row["user_email"],
                    },
                })
        self._cache = embeddings
        self._cache_loaded_at = now
        return embeddings

    def invalidate_cache(self) -> None:
        self._cache = []
        self._cache_loaded_at = 0.0
