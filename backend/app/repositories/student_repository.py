from typing import Any

from app.core.database import Database


class StudentRepository:
    def __init__(self, database: Database):
        self.database = database

    def get_student(self, student_id: str) -> dict[str, Any] | None:
        with self.database.connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select id, name, email, role
                    from public.app_users
                    where id = %s and role = 'student'
                    limit 1
                    """,
                    (student_id,),
                )
                return cursor.fetchone()
