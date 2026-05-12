-- SmartAttend FACEID - Phase 1 core database schema.
-- Scope: auth users, courses, schedules, invitations, enrollments, attendance sessions, attendance records.
-- Not included in this phase: face_embeddings, audit_logs, notifications.

create table if not exists public.app_users (
  id text primary key,
  name text not null,
  email text not null,
  role text not null,
  class_name text,
  department text,
  avatar text,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.app_users
  add column if not exists class_name text;

create unique index if not exists app_users_email_unique
  on public.app_users (email);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'app_users_role_check'
      and conrelid = 'public.app_users'::regclass
  ) then
    alter table public.app_users
      add constraint app_users_role_check
      check (role in ('admin', 'teacher', 'student'));
  end if;
end $$;

create table if not exists public.courses (
  id text primary key,
  teacher_id text not null,
  code text not null,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  room text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_teacher_id_fkey
    foreign key (teacher_id)
    references public.app_users(id)
    on delete restrict,
  constraint courses_teacher_code_unique
    unique (teacher_id, code),
  constraint courses_date_range_check
    check (start_date <= end_date),
  constraint courses_status_check
    check (status in ('draft', 'active', 'archived'))
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_courses_updated_at on public.courses;

create trigger set_courses_updated_at
before update on public.courses
for each row
execute function public.set_updated_at();

create table if not exists public.course_schedules (
  id text primary key,
  course_id text not null,
  day_of_week int not null,
  start_time time not null,
  end_time time not null,
  room text,
  created_at timestamptz not null default now(),
  constraint course_schedules_course_id_fkey
    foreign key (course_id)
    references public.courses(id)
    on delete restrict,
  constraint course_schedules_day_of_week_check
    check (day_of_week between 1 and 7),
  constraint course_schedules_time_range_check
    check (start_time < end_time)
);

create table if not exists public.course_invitations (
  id text primary key,
  course_id text not null,
  invited_email text not null,
  invited_student_id text,
  invited_by text not null,
  status text not null default 'pending',
  accepted_at timestamptz,
  declined_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint course_invitations_course_id_fkey
    foreign key (course_id)
    references public.courses(id)
    on delete restrict,
  constraint course_invitations_invited_student_id_fkey
    foreign key (invited_student_id)
    references public.app_users(id)
    on delete restrict,
  constraint course_invitations_invited_by_fkey
    foreign key (invited_by)
    references public.app_users(id)
    on delete restrict,
  constraint course_invitations_course_email_unique
    unique (course_id, invited_email),
  constraint course_invitations_status_check
    check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired'))
);

create table if not exists public.course_enrollments (
  id text primary key,
  course_id text not null,
  student_id text not null,
  invitation_id text,
  status text not null default 'active',
  enrolled_at timestamptz not null default now(),
  removed_at timestamptz,
  completed_at timestamptz,
  constraint course_enrollments_course_id_fkey
    foreign key (course_id)
    references public.courses(id)
    on delete restrict,
  constraint course_enrollments_student_id_fkey
    foreign key (student_id)
    references public.app_users(id)
    on delete restrict,
  constraint course_enrollments_invitation_id_fkey
    foreign key (invitation_id)
    references public.course_invitations(id)
    on delete restrict,
  constraint course_enrollments_course_student_unique
    unique (course_id, student_id),
  constraint course_enrollments_status_check
    check (status in ('active', 'removed', 'completed'))
);

create table if not exists public.attendance_sessions (
  id text primary key,
  course_id text not null,
  schedule_id text,
  teacher_id text not null,
  session_date date not null,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  status text not null default 'open',
  constraint attendance_sessions_course_id_fkey
    foreign key (course_id)
    references public.courses(id)
    on delete restrict,
  constraint attendance_sessions_schedule_id_fkey
    foreign key (schedule_id)
    references public.course_schedules(id)
    on delete restrict,
  constraint attendance_sessions_teacher_id_fkey
    foreign key (teacher_id)
    references public.app_users(id)
    on delete restrict,
  constraint attendance_sessions_status_check
    check (status in ('open', 'closed', 'cancelled'))
);

create unique index if not exists one_open_session_per_course
  on public.attendance_sessions (course_id)
  where status = 'open';

create table if not exists public.attendance_records (
  id text primary key,
  session_id text not null,
  course_id text not null,
  student_id text not null,
  scan_time timestamptz not null default now(),
  status text not null,
  method text not null default 'face',
  confidence float,
  liveness_score float,
  constraint attendance_records_session_id_fkey
    foreign key (session_id)
    references public.attendance_sessions(id)
    on delete restrict,
  constraint attendance_records_course_id_fkey
    foreign key (course_id)
    references public.courses(id)
    on delete restrict,
  constraint attendance_records_student_id_fkey
    foreign key (student_id)
    references public.app_users(id)
    on delete restrict,
  constraint attendance_records_session_student_unique
    unique (session_id, student_id),
  constraint attendance_records_status_check
    check (status in ('present', 'late', 'rejected')),
  constraint attendance_records_method_check
    check (method in ('face', 'manual'))
);

create index if not exists courses_teacher_id_idx
  on public.courses (teacher_id);

create index if not exists course_schedules_course_id_idx
  on public.course_schedules (course_id);

create index if not exists course_invitations_course_id_idx
  on public.course_invitations (course_id);

create index if not exists course_invitations_invited_email_idx
  on public.course_invitations (invited_email);

create index if not exists course_invitations_invited_student_id_idx
  on public.course_invitations (invited_student_id);

create index if not exists course_enrollments_course_id_idx
  on public.course_enrollments (course_id);

create index if not exists course_enrollments_student_id_idx
  on public.course_enrollments (student_id);

create index if not exists attendance_sessions_course_id_idx
  on public.attendance_sessions (course_id);

create index if not exists attendance_sessions_schedule_id_idx
  on public.attendance_sessions (schedule_id);

create index if not exists attendance_records_session_id_idx
  on public.attendance_records (session_id);

create index if not exists attendance_records_student_id_idx
  on public.attendance_records (student_id);
