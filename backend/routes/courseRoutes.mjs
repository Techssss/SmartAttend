import { handleApiError } from '../lib/apiErrors.mjs';
import { readJson, sendError, sendSuccess } from '../lib/http.mjs';
import { validateCourseInput } from '../services/courseService.mjs';

function getCourseRoute(url) {
  const match = url.pathname.match(/^\/api\/courses(?:\/([^/]+))?(?:\/(archive))?\/?$/);
  if (!match) return null;
  return {
    id: match[1] ? decodeURIComponent(match[1]) : '',
    action: match[2] || '',
  };
}

export function createCourseRoutes({ courses, requireTeacher }) {
  return async function handleCourseRoutes(req, res, { url }) {
    const courseRoute = getCourseRoute(url);
    if (!courseRoute) return false;

    if (req.method === 'POST' && !courseRoute.id) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      const body = await readJson(req);
      const { data, errors } = validateCourseInput(body);
      if (errors.length) {
        sendError(res, 400, errors.join(' '));
        return true;
      }

      try {
        const course = await courses.createCourse(user.id, data);
        sendSuccess(res, 201, course);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (req.method === 'GET' && !courseRoute.id) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const data = await courses.listCourses(user.id);
        sendSuccess(res, 200, data);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (req.method === 'GET' && courseRoute.id && !courseRoute.action) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const course = await courses.getCourseById(user.id, courseRoute.id);
        if (!course) {
          sendError(res, 404, 'Khong tim thay khoa hoc.');
          return true;
        }
        sendSuccess(res, 200, course);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (req.method === 'PATCH' && courseRoute.id && !courseRoute.action) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const body = await readJson(req);
        const course = await courses.updateCourse(user.id, courseRoute.id, body);
        if (!course) {
          sendError(res, 404, 'Khong tim thay khoa hoc.');
          return true;
        }
        sendSuccess(res, 200, course);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (req.method === 'PATCH' && courseRoute.id && courseRoute.action === 'archive') {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const course = await courses.archiveCourse(user.id, courseRoute.id);
        if (!course) {
          sendError(res, 404, 'Khong tim thay khoa hoc.');
          return true;
        }
        sendSuccess(res, 200, course);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    return false;
  };
}
