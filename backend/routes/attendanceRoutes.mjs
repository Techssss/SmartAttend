import { handleApiError } from '../lib/apiErrors.mjs';
import { readJson, sendError, sendSuccess } from '../lib/http.mjs';
import { validateManualAttendanceInput } from '../services/attendanceRecordService.mjs';
import { validateOpenSessionInput } from '../services/attendanceSessionService.mjs';

function getAttendanceSessionRoute(url) {
  if (url.pathname === '/api/attendance/sessions') {
    return { collection: true, sessionId: '', action: '' };
  }

  const match = url.pathname.match(/^\/api\/attendance\/sessions\/([^/]+)(?:\/(close|cancel|manual|records))?$/);
  if (!match) return null;
  return {
    collection: false,
    sessionId: decodeURIComponent(match[1]),
    action: match[2] || '',
  };
}

function getCourseAttendanceSessionRoute(url) {
  const match = url.pathname.match(/^\/api\/courses\/([^/]+)\/attendance\/sessions$/);
  if (!match) return null;
  return { courseId: decodeURIComponent(match[1]) };
}

function getCourseAttendanceRoute(url) {
  const match = url.pathname.match(/^\/api\/courses\/([^/]+)\/attendance$/);
  if (!match) return null;
  return { courseId: decodeURIComponent(match[1]) };
}

export function createAttendanceRoutes({ attendanceRecords, attendanceSessions, requireTeacher }) {
  return async function handleAttendanceRoutes(req, res, { url }) {
    const attendanceSessionRoute = getAttendanceSessionRoute(url);
    const courseAttendanceRoute = getCourseAttendanceRoute(url);
    const courseAttendanceSessionRoute = getCourseAttendanceSessionRoute(url);

    if (attendanceSessionRoute?.collection && req.method === 'POST') {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      const body = await readJson(req);
      const { data, errors } = validateOpenSessionInput(body);
      if (errors.length) {
        sendError(res, 400, errors.join(' '));
        return true;
      }

      try {
        const session = await attendanceSessions.openSession(user.id, data);
        sendSuccess(res, 201, session);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (courseAttendanceSessionRoute && req.method === 'GET') {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const data = await attendanceSessions.listCourseSessions(user.id, courseAttendanceSessionRoute.courseId);
        sendSuccess(res, 200, data);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (attendanceSessionRoute && !attendanceSessionRoute.collection && req.method === 'GET' && !attendanceSessionRoute.action) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const session = await attendanceSessions.getSession(user.id, attendanceSessionRoute.sessionId);
        if (!session) {
          sendError(res, 404, 'Khong tim thay phien diem danh.');
          return true;
        }
        sendSuccess(res, 200, session);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (attendanceSessionRoute && req.method === 'POST' && attendanceSessionRoute.action === 'close') {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const session = await attendanceSessions.closeSession(user.id, attendanceSessionRoute.sessionId);
        if (!session) {
          sendError(res, 404, 'Khong tim thay phien diem danh.');
          return true;
        }
        sendSuccess(res, 200, session);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (attendanceSessionRoute && req.method === 'POST' && attendanceSessionRoute.action === 'cancel') {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const session = await attendanceSessions.cancelSession(user.id, attendanceSessionRoute.sessionId);
        if (!session) {
          sendError(res, 404, 'Khong tim thay phien diem danh.');
          return true;
        }
        sendSuccess(res, 200, session);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (attendanceSessionRoute && req.method === 'POST' && attendanceSessionRoute.action === 'manual') {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      const body = await readJson(req);
      const { data, errors } = validateManualAttendanceInput(body);
      if (errors.length) {
        sendError(res, 400, errors.join(' '));
        return true;
      }

      try {
        const record = await attendanceRecords.markManualAttendance(user.id, attendanceSessionRoute.sessionId, data);
        sendSuccess(res, 200, record);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (attendanceSessionRoute && req.method === 'GET' && attendanceSessionRoute.action === 'records') {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const data = await attendanceRecords.listSessionRecords(user.id, attendanceSessionRoute.sessionId);
        sendSuccess(res, 200, data);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (courseAttendanceRoute && req.method === 'GET') {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const data = await attendanceRecords.listCourseAttendance(user.id, courseAttendanceRoute.courseId);
        sendSuccess(res, 200, data);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    return false;
  };
}
