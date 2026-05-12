create table if not exists public.app_users (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'teacher', 'student')),
  class text,
  department text,
  avatar text,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  teacher_id text not null references public.app_users(id) on delete cascade,
  code text not null unique,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  room text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  check (start_date <= end_date)
);

create table if not exists public.course_schedules (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  room text,
  check (start_time < end_time)
);

create table if not exists public.course_invitations (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  invited_email text not null,
  invited_student_id text references public.app_users(id) on delete set null,
  invited_by text not null references public.app_users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  accepted_at timestamptz,
  declined_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.course_enrollments (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  student_id text not null references public.app_users(id) on delete cascade,
  invitation_id text references public.course_invitations(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'removed', 'completed')),
  enrolled_at timestamptz not null default now()
);

create table if not exists public.attendance_sessions (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  teacher_id text not null references public.app_users(id) on delete cascade,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled'))
);

create table if not exists public.attendance_records (
  id text primary key,
  session_id text not null references public.attendance_sessions(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  student_id text not null references public.app_users(id) on delete cascade,
  scan_time timestamptz not null default now(),
  status text not null check (status in ('present', 'late', 'absent', 'manual')),
  method text not null default 'face' check (method in ('face', 'manual')),
  confidence float,
  liveness_score float
);

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

create index if not exists app_users_role_idx on public.app_users (role);
create index if not exists courses_teacher_idx on public.courses (teacher_id);
create index if not exists course_schedules_course_idx on public.course_schedules (course_id);
create index if not exists course_invitations_email_idx on public.course_invitations (lower(invited_email));
create index if not exists course_invitations_course_idx on public.course_invitations (course_id);
create index if not exists course_enrollments_student_idx on public.course_enrollments (student_id);
create index if not exists course_enrollments_course_idx on public.course_enrollments (course_id);
create index if not exists attendance_sessions_course_idx on public.attendance_sessions (course_id);
create index if not exists attendance_records_session_idx on public.attendance_records (session_id);
create index if not exists attendance_records_student_idx on public.attendance_records (student_id);
create index if not exists face_embeddings_student_idx on public.face_embeddings (student_id);
create index if not exists face_embeddings_active_idx on public.face_embeddings (student_id) where is_active = true;

create unique index if not exists course_invitations_pending_unique
  on public.course_invitations (course_id, lower(invited_email))
  where status = 'pending';

create unique index if not exists course_invitations_open_unique
  on public.course_invitations (course_id, lower(invited_email))
  where status in ('pending', 'accepted');

create unique index if not exists course_enrollments_active_unique
  on public.course_enrollments (course_id, student_id)
  where status = 'active';

create unique index if not exists attendance_records_session_student_unique
  on public.attendance_records (session_id, student_id);

-- Demo accounts use password: demo123.
-- Backend currently seeds demo accounts through services/userService.mjs.
