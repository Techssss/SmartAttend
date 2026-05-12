from app.repositories.attendance_repository import AttendanceRepository


class AttendanceService:
    def __init__(self, attendance_repository: AttendanceRepository):
        self.attendance_repository = attendance_repository

    def check_in(self, student_id: str, session_id: str, method: str, confidence: float) -> dict:
        if method != "face":
            raise ValueError("Only face check-in is supported by this endpoint.")

        session = self.attendance_repository.get_open_session(session_id)
        if not session:
            raise LookupError("Attendance session not found.")
        if session["status"] != "open":
            raise ValueError("Attendance session is not open.")

        if not self.attendance_repository.has_active_enrollment(session["course_id"], student_id):
            raise PermissionError("Student is not actively enrolled in this course.")

        existing = self.attendance_repository.get_record(session_id, student_id)
        if existing:
            return {
                "status": "already_checked_in",
                "record": existing,
            }

        record = self.attendance_repository.create_face_check_in(
            session_id=session_id,
            course_id=session["course_id"],
            student_id=student_id,
            confidence=confidence,
        )
        return {
            "status": "checked_in",
            "record": record,
        }

    def list_open_sessions_for_student(self, student_id: str) -> list[dict]:
        if not student_id:
            raise ValueError("student_id is required.")
        return self.attendance_repository.list_open_sessions_for_student(student_id)
