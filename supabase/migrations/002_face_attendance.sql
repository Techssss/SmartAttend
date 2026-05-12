-- SmartAttend FACEID - InsightFace embeddings and face check-in support.
-- Embeddings are stored in JSONB for the MVP. If pgvector is enabled later,
-- migrate embedding_json to vector(512) and move similarity search into SQL.

create table if not exists public.face_embeddings (
  id text primary key,
  student_id text not null,
  embedding text,
  embedding_json jsonb,
  image_quality_score float,
  image_url text,
  created_at timestamptz not null default now(),
  is_active boolean not null default true,
  constraint face_embeddings_student_id_fkey
    foreign key (student_id)
    references public.app_users(id)
    on delete cascade
);

alter table public.face_embeddings
  add column if not exists embedding text,
  add column if not exists embedding_json jsonb,
  add column if not exists image_quality_score float,
  add column if not exists image_url text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists is_active boolean not null default true;

alter table public.face_embeddings
  alter column embedding drop not null;

create index if not exists face_embeddings_student_id_idx
  on public.face_embeddings (student_id);

create index if not exists face_embeddings_active_idx
  on public.face_embeddings (student_id)
  where is_active = true;

alter table public.attendance_records
  add column if not exists method text not null default 'face',
  add column if not exists confidence float,
  add column if not exists liveness_score float;

create unique index if not exists attendance_records_session_student_unique
  on public.attendance_records (session_id, student_id);
