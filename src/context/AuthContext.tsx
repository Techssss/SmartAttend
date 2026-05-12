import { createContext, useContext, useState, ReactNode } from 'react';
import { logoutSession } from '../services/authApi';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  id: string;
  class?: string;
  department?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('smartattend_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('smartattend_token');
    } catch {
      return null;
    }
  });

  const login = (u: AuthUser, nextToken?: string) => {
    setUser(u);
    localStorage.setItem('smartattend_user', JSON.stringify(u));
    if (nextToken) {
      setToken(nextToken);
      localStorage.setItem('smartattend_token', nextToken);
    }
  };

  const logout = () => {
    const currentToken = token;
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartattend_user');
    localStorage.removeItem('smartattend_token');
    if (currentToken) {
      logoutSession(currentToken).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
