import { sendJson } from './lib/http.mjs';
import { createAttendanceRoutes } from './routes/attendanceRoutes.mjs';
import { createAuthRoutes } from './routes/authRoutes.mjs';
import { createCourseRoutes } from './routes/courseRoutes.mjs';
import { createInvitationRoutes } from './routes/invitationRoutes.mjs';
import { createScheduleRoutes } from './routes/scheduleRoutes.mjs';
import { createTimetableRoutes } from './routes/timetableRoutes.mjs';

export function createRouter(deps) {
  const routeHandlers = [
    createHealthRoutes(deps),
    createAuthRoutes(deps),
    createAttendanceRoutes(deps),
    createInvitationRoutes(deps),
    createTimetableRoutes(deps),
    createScheduleRoutes(deps),
    createCourseRoutes(deps),
  ];

  return async function handleRequest(req, res) {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    try {
      for (const handleRoutes of routeHandlers) {
        if (await handleRoutes(req, res, { url })) return;
      }

      sendJson(res, 404, { message: 'Khong tim thay API.' });
    } catch (error) {
      sendJson(res, 500, { message: 'Loi server.', detail: error instanceof Error ? error.message : String(error) });
    }
  };
}

function createHealthRoutes({ getStorage, getDatabaseStatus, getDatabaseError }) {
  return async function handleHealthRoutes(req, res, { url }) {
    if (url.pathname !== '/api/health' || req.method !== 'GET') {
      return false;
    }

    sendJson(res, 200, {
      ok: true,
      service: 'smartattend-api',
      storage: getStorage(),
      databaseStatus: getDatabaseStatus(),
      databaseError: getDatabaseError(),
    });
    return true;
  };
}
