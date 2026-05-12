from typing import Any
from uuid import uuid4

from app.core.database import Database


class AttendanceRepository:
    def __init__(self, database: Database):
        self.database = database

    def get_open_session(self, session_id: str) -> dict[str, Any] | None:
        with self.database.connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select id, course_id, status
                    from public.attendance_sessions
                    where id = %s
                    limit 1
                    """,
                    (session_id,),
                )
                return cursor.fetchone()

    def has_active_enrollment(self, course_id: str, student_id: str) -> bool:
        with self.database.connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select id
                    from public.course_enrollments
                    where course_id = %s
                      and student_id = %s
                      and status = 'active'
                    limit 1
                    """,
                    (course_id, student_id),
                )
                return cursor.fetchone() is not None

    def get_record(self, session_id: str, student_id: str) -> dict[str, Any] | None:
        with self.database.connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select *
                    from public.attendance_records
                    where session_id = %s
                      and student_id = %s
                    limit 1
                    """,
                    (session_id, student_id),
                )
                return cursor.fetchone()

    def create_face_check_in(self, session_id: str, course_id: str, student_id: str, confidence: float) -> dict[str, Any]:
        record_id = str(uuid4())
        with self.database.connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    insert into public.attendance_records
                      (id, session_id, course_id, student_id, status, method, confidence, scan_time)
                    values (%s, %s, %s, %s, 'present', 'face', %s, now())
                    returning *
                    """,
                    (record_id, session_id, course_id, student_id, confidence),
                )
                row = cursor.fetchone()
            connection.commit()
        return row

    def list_open_sessions_for_student(self, student_id: str) -> list[dict[str, Any]]:
        with self.database.connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select
                      s.id,
                      s.course_id,
                      s.schedule_id,
                      s.session_date,
                      s.opened_at,
                      s.status,
                      c.code as course_code,
                      c.name as course_name
                    from public.attendance_sessions s
                    join public.course_enrollments e
                      on e.course_id = s.course_id
                     and e.status = 'active'
                    join public.courses c on c.id = s.course_id
                    where e.student_id = %s
                      and s.status = 'open'
                    order by s.opened_at desc
                    """,
                    (student_id,),
                )
                return cursor.fetchall()
