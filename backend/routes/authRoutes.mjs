import { readJson, sendJson } from '../lib/http.mjs';
import { getBearerToken } from '../middleware/authMiddleware.mjs';
import { normalizeEmail, publicUser, validateRegister, verifyPassword } from '../services/userService.mjs';

export function createAuthRoutes({ users, tokenStore, createSession, requireAuth }) {
  return async function handleAuthRoutes(req, res, { url }) {
    if (url.pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await readJson(req);
      const user = await users.findUserByEmail(body.email);

      if (!user || !verifyPassword(String(body.password || ''), user.passwordHash)) {
        sendJson(res, 401, { message: 'Email hoac mat khau khong dung.' });
        return true;
      }

      sendJson(res, 200, { user: publicUser(user), token: createSession(user) });
      return true;
    }

    if (url.pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await readJson(req);
      const error = validateRegister(body);
      if (error) {
        sendJson(res, 400, { message: error });
        return true;
      }

      const email = normalizeEmail(body.email);
      if (await users.findUserByEmail(email)) {
        sendJson(res, 409, { message: 'Email da ton tai.' });
        return true;
      }

      const user = await users.createUser({ ...body, email });
      sendJson(res, 201, { user: publicUser(user), token: createSession(user) });
      return true;
    }

    if (url.pathname === '/api/auth/me' && req.method === 'GET') {
      const user = await requireAuth(req, res);
      if (!user) return true;

      sendJson(res, 200, { user });
      return true;
    }

    if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
      tokenStore.delete(getBearerToken(req));
      sendJson(res, 200, { ok: true });
      return true;
    }

    return false;
  };
}
