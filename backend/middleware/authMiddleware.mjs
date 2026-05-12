export function getBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

export function createAuthMiddleware({ tokenStore, findUserById, sendJson, publicUser }) {
  async function requireAuth(req, res) {
    const token = getBearerToken(req);
    const session = token ? tokenStore.get(token) : null;

    if (!session) {
      sendJson(res, 401, { message: 'Phien dang nhap khong hop le.' });
      return null;
    }

    const user = await findUserById(session.userId);
    if (!user) {
      tokenStore.delete(token);
      sendJson(res, 401, { message: 'Nguoi dung khong ton tai.' });
      return null;
    }

    req.user = publicUser(user);
    return req.user;
  }

  function requireRole(...roles) {
    return async function requireRoleMiddleware(req, res) {
      const user = await requireAuth(req, res);
      if (!user) return null;

      if (!roles.includes(user.role)) {
        sendJson(res, 403, { message: 'Ban khong co quyen thuc hien thao tac nay.' });
        return null;
      }

      return user;
    };
  }

  return {
    requireAuth,
    requireRole,
    requireTeacher: requireRole('teacher'),
    requireStudent: requireRole('student'),
  };
}
