from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row


class Database:
    def __init__(self, database_url: str):
        self.database_url = database_url

    @contextmanager
    def connect(self):
        with psycopg.connect(self.database_url, row_factory=dict_row) as connection:
            yield connection

    def ensure_face_schema(self) -> None:
        with self.connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    create table if not exists public.face_embeddings (
                      id text primary key,
                      student_id text not null references public.app_users(id) on delete cascade,
                      embedding text,
                      embedding_json jsonb,
                      image_quality_score float,
                      image_url text,
                      created_at timestamptz not null default now(),
                      is_active boolean not null default true
                    );
                    """
                )
                cursor.execute("alter table public.face_embeddings add column if not exists embedding text;")
                cursor.execute("alter table public.face_embeddings add column if not exists embedding_json jsonb;")
                cursor.execute("alter table public.face_embeddings add column if not exists image_quality_score float;")
                cursor.execute("alter table public.face_embeddings add column if not exists image_url text;")
                cursor.execute("alter table public.face_embeddings add column if not exists is_active boolean not null default true;")
                cursor.execute("alter table public.face_embeddings alter column embedding drop not null;")
                cursor.execute("create index if not exists face_embeddings_student_id_idx on public.face_embeddings (student_id);")
                cursor.execute(
                    """
                    create index if not exists face_embeddings_active_idx
                    on public.face_embeddings (student_id)
                    where is_active = true;
                    """
                )
                cursor.execute("alter table public.attendance_records add column if not exists method text not null default 'face';")
                cursor.execute("alter table public.attendance_records add column if not exists confidence float;")
                cursor.execute("alter table public.attendance_records add column if not exists liveness_score float;")
            connection.commit()
