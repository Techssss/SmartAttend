import type { AuthUser, UserRole } from '../context/AuthContext';

export interface AuthSession {
  user: AuthUser;
  token: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
  class?: string;
  department?: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload as T;
}

export function loginWithPassword(payload: LoginPayload) {
  return request<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerAccount(payload: RegisterPayload) {
  return request<AuthSession>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(token: string) {
  return request<{ user: AuthUser }>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function logoutSession(token: string) {
  return request<{ ok: boolean }>('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}
