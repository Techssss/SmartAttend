import { handleApiError } from '../lib/apiErrors.mjs';
import { readJson, sendError, sendSuccess } from '../lib/http.mjs';
import { validateInvitationInput } from '../services/invitationService.mjs';

function getCourseInvitationRoute(url) {
  const match = url.pathname.match(/^\/api\/courses\/([^/]+)\/invitations(?:\/([^/]+)\/(cancel))?$/);
  if (!match) return null;
  return {
    courseId: decodeURIComponent(match[1]),
    invitationId: match[2] ? decodeURIComponent(match[2]) : '',
    action: match[3] || '',
  };
}

function getStudentInvitationRoute(url) {
  const match = url.pathname.match(/^\/api\/invitations\/([^/]+)\/(accept|decline)$/);
  if (!match) return null;
  return {
    invitationId: decodeURIComponent(match[1]),
    action: match[2],
  };
}

export function createInvitationRoutes({ invitations, requireTeacher, requireStudent }) {
  return async function handleInvitationRoutes(req, res, { url }) {
    const courseInvitationRoute = getCourseInvitationRoute(url);
    const studentInvitationRoute = getStudentInvitationRoute(url);

    if (courseInvitationRoute && req.method === 'POST' && !courseInvitationRoute.invitationId) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      const body = await readJson(req);
      const { data, errors } = validateInvitationInput(body);
      if (errors.length) {
        sendError(res, 400, errors.join(' '));
        return true;
      }

      try {
        const invitation = await invitations.createInvitation(user.id, courseInvitationRoute.courseId, data);
        sendSuccess(res, 201, invitation);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (courseInvitationRoute && req.method === 'GET' && !courseInvitationRoute.invitationId) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const data = await invitations.listCourseInvitations(user.id, courseInvitationRoute.courseId);
        sendSuccess(res, 200, data);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (
      courseInvitationRoute &&
      req.method === 'PATCH' &&
      courseInvitationRoute.invitationId &&
      courseInvitationRoute.action === 'cancel'
    ) {
      const user = await requireTeacher(req, res);
      if (!user) return true;

      try {
        const invitation = await invitations.cancelInvitation(
          user.id,
          courseInvitationRoute.courseId,
          courseInvitationRoute.invitationId,
        );
        if (!invitation) {
          sendError(res, 404, 'Khong tim thay loi moi.');
          return true;
        }
        sendSuccess(res, 200, invitation);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (url.pathname === '/api/me/invitations' && req.method === 'GET') {
      const user = await requireStudent(req, res);
      if (!user) return true;

      try {
        const data = await invitations.listMyInvitations(user);
        sendSuccess(res, 200, data);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (studentInvitationRoute && req.method === 'POST' && studentInvitationRoute.action === 'accept') {
      const user = await requireStudent(req, res);
      if (!user) return true;

      try {
        const data = await invitations.acceptInvitation(user, studentInvitationRoute.invitationId);
        sendSuccess(res, 200, data);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    if (studentInvitationRoute && req.method === 'POST' && studentInvitationRoute.action === 'decline') {
      const user = await requireStudent(req, res);
      if (!user) return true;

      try {
        const invitation = await invitations.declineInvitation(user, studentInvitationRoute.invitationId);
        sendSuccess(res, 200, invitation);
      } catch (error) {
        handleApiError(res, error);
      }
      return true;
    }

    return false;
  };
}
