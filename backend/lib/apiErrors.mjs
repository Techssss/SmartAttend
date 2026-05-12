import { sendError } from './http.mjs';

export function handleApiError(res, error) {
  const message = error instanceof Error ? error.message : String(error);

  if (error?.code === '23505') {
    const constraint = String(error.constraint || '');
    if (constraint.includes('one_open_session_per_course')) {
      sendError(res, 409, 'Khoa hoc nay da co mot phien diem danh dang open.');
      return;
    }
    if (constraint.includes('course_invitations')) {
      sendError(res, 409, 'Loi moi cho email nay da ton tai trong khoa hoc.');
      return;
    }
    if (constraint.includes('course_enrollments')) {
      sendError(res, 409, 'Hoc sinh da duoc ghi danh vao khoa hoc nay.');
      return;
    }
    if (constraint.includes('courses')) {
      sendError(res, 409, 'Ma khoa hoc da ton tai voi giao vien nay.');
      return;
    }
    if (constraint.includes('attendance_records')) {
      sendError(res, 409, 'Hoc sinh da co record diem danh trong phien nay.');
      return;
    }

    sendError(res, 409, 'Du lieu da ton tai.');
    return;
  }

  if (error?.code === '23503') {
    sendError(res, 400, 'Du lieu lien ket khong hop le.');
    return;
  }

  sendError(res, error?.statusCode || 500, message || 'Loi server.', error?.data);
}
