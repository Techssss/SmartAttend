import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';

const { Pool } = pg;

export async function loadEnv(projectRoot) {
  try {
    const raw = await readFile(join(projectRoot, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // .env is optional; JSON storage remains available for local demos.
  }
}

export function createDbPool() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return null;

  return new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  });
}

export async function ensureDatabase(pool) {
  if (!pool) return;

  await pool.query(`
    create table if not exists public.app_users (
      id text primary key,
      name text not null,
      email text not null unique,
      role text not null check (role in ('admin', 'teacher', 'student')),
      class_name text,
      department text,
      avatar text,
      password_hash text not null,
      created_at timestamptz not null default now()
    );
  `);
  await pool.query('alter table public.app_users add column if not exists class_name text;');
  await pool.query('create index if not exists app_users_role_idx on public.app_users (role);');
  await pool.query(`
    create table if not exists public.courses (
      id text primary key,
      teacher_id text not null references public.app_users(id) on delete restrict,
      code text not null,
      name text not null,
      description text,
      start_date date not null,
      end_date date not null,
      room text,
      status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (teacher_id, code),
      check (start_date <= end_date)
    );
  `);
  await pool.query('create index if not exists courses_teacher_id_idx on public.courses (teacher_id);');
  await pool.query(`
    create table if not exists public.course_invitations (
      id text primary key,
      course_id text not null references public.courses(id) on delete restrict,
      invited_email text not null,
      invited_student_id text references public.app_users(id) on delete restrict,
      invited_by text not null references public.app_users(id) on delete restrict,
      status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
      accepted_at timestamptz,
      declined_at timestamptz,
      expires_at timestamptz,
      created_at timestamptz not null default now(),
      constraint course_invitations_status_check check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired'))
    );
  `);
  await pool.query('alter table public.course_invitations drop constraint if exists course_invitations_course_id_invited_email_key;');
  await pool.query('create index if not exists course_invitations_course_id_idx on public.course_invitations (course_id);');
  await pool.query('create index if not exists course_invitations_invited_email_idx on public.course_invitations (invited_email);');
  await pool.query(`
    create unique index if not exists course_invitations_open_unique
    on public.course_invitations (course_id, lower(invited_email))
    where status in ('pending', 'accepted');
  `);
  await pool.query(`
    create table if not exists public.course_enrollments (
      id text primary key,
      course_id text not null references public.courses(id) on delete restrict,
      student_id text not null references public.app_users(id) on delete restrict,
      invitation_id text references public.course_invitations(id) on delete restrict,
      status text not null default 'active' check (status in ('active', 'removed', 'completed')),
      enrolled_at timestamptz not null default now(),
      removed_at timestamptz,
      completed_at timestamptz,
      unique (course_id, student_id)
    );
  `);
  await pool.query('create index if not exists course_enrollments_course_id_idx on public.course_enrollments (course_id);');
  await pool.query('create index if not exists course_enrollments_student_id_idx on public.course_enrollments (student_id);');
  await pool.query(`
    create table if not exists public.course_schedules (
      id text primary key,
      course_id text not null references public.courses(id) on delete restrict,
      day_of_week int not null check (day_of_week between 1 and 7),
      start_time time not null,
      end_time time not null,
      room text,
      created_at timestamptz not null default now(),
      check (start_time < end_time)
    );
  `);
  await pool.query('create index if not exists course_schedules_course_id_idx on public.course_schedules (course_id);');
  await pool.query(`
    create table if not exists public.attendance_sessions (
      id text primary key,
      course_id text not null references public.courses(id) on delete restrict,
      schedule_id text references public.course_schedules(id) on delete restrict,
      teacher_id text not null references public.app_users(id) on delete restrict,
      session_date date not null,
      opened_at timestamptz not null default now(),
      closed_at timestamptz,
      status text not null default 'open' check (status in ('open', 'closed', 'cancelled'))
    );
  `);
  await pool.query('create index if not exists attendance_sessions_course_id_idx on public.attendance_sessions (course_id);');
  await pool.query(`
    create unique index if not exists one_open_session_per_course
    on public.attendance_sessions(course_id)
    where status = 'open';
  `);
  await pool.query(`
    create table if not exists public.attendance_records (
      id text primary key,
      session_id text not null references public.attendance_sessions(id) on delete restrict,
      course_id text not null references public.courses(id) on delete restrict,
      student_id text not null references public.app_users(id) on delete restrict,
      scan_time timestamptz not null default now(),
      status text not null check (status in ('present', 'late', 'rejected')),
      method text not null default 'manual' check (method in ('face', 'manual')),
      confidence float,
      liveness_score float,
      unique (session_id, student_id)
    );
  `);
  await pool.query('create index if not exists attendance_records_session_id_idx on public.attendance_records (session_id);');
  await pool.query('create index if not exists attendance_records_student_id_idx on public.attendance_records (student_id);');
  await pool.query(`
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
  `);
  await pool.query('alter table public.face_embeddings add column if not exists embedding text;');
  await pool.query('alter table public.face_embeddings add column if not exists embedding_json jsonb;');
  await pool.query('alter table public.face_embeddings add column if not exists image_quality_score float;');
  await pool.query('alter table public.face_embeddings add column if not exists image_url text;');
  await pool.query('alter table public.face_embeddings add column if not exists is_active boolean not null default true;');
  await pool.query('alter table public.face_embeddings alter column embedding drop not null;');
  await pool.query('create index if not exists face_embeddings_student_id_idx on public.face_embeddings (student_id);');
  await pool.query('create index if not exists face_embeddings_active_idx on public.face_embeddings (student_id) where is_active = true;');
}
