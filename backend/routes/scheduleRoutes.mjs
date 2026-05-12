import { handleApiError } from '../lib/apiErrors.mjs';
import { readJson, sendError, sendSuccess } from '../lib/http.mjs';
import { validateScheduleInput } from '../services/scheduleService.mjs';

function getScheduleRoute(url) {
  const match = url.pathname.match(/^\/api\/courses\/([^/]+)\/schedules(?:\/([^/]+))?$/);
  if (!match) return null;
  return {
    courseId: decodeURIComponent(match[1]),
    scheduleId: match[2] ? decodeURIComponent(match[2]) : '',
  };
}

export function createScheduleRoutes({ schedules, requireTeacher }) {
  return async function handleScheduleRoutes(req, res, { url }) {
    const scheduleRoute = getScheduleRoute(url);
    if (!scheduleRoute) return false;

    if (req.method === 'POST' && !scheduleRoute.scheduleId) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      const body = await readJson(req);
      const { data, errors } = validateScheduleInput(body);
      if (errors.length) {
        sendError(res, 400, errors.join(' '));
        return true;
      }

      try {
        const schedule = await schedules.createSchedule(user.id, scheduleRoute.courseId, data);
        sendSuccess(res, 201, schedule);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (req.method === 'GET' && !scheduleRoute.scheduleId) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const data = await schedules.listSchedules(user.id, scheduleRoute.courseId);
        sendSuccess(res, 200, data);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (req.method === 'PATCH' && scheduleRoute.scheduleId) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const body = await readJson(req);
        const schedule = await schedules.updateSchedule(user.id, scheduleRoute.courseId, scheduleRoute.scheduleId, body);
        if (!schedule) {
          sendError(res, 404, 'Khong tim thay lich hoc.');
          return true;
        }
        sendSuccess(res, 200, schedule);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (req.method === 'DELETE' && scheduleRoute.scheduleId) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const schedule = await schedules.deleteSchedule(user.id, scheduleRoute.courseId, scheduleRoute.scheduleId);
        if (!schedule) {
          sendError(res, 404, 'Khong tim thay lich hoc.');
          return true;
        }
        sendSuccess(res, 200, schedule);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    return false;
  };
}
