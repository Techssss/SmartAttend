import { handleApiError } from '../lib/apiErrors.mjs';
import { sendJson } from '../lib/http.mjs';

export function createTimetableRoutes({ timetable, requireStudent }) {
  return async function handleTimetableRoutes(req, res, { url }) {
    if (url.pathname !== '/api/me/timetable' || req.method !== 'GET') {
      return false;
    }

    const user = await requireStudent(req, res);
    if (!user) return true;

    try {
      const data = await timetable.getStudentTimetable(user);
      sendJson(res, 200, data);
    } catch (error) {
      handleApiError(res, error);
    }
    return true;
  };
}
