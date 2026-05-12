import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth, type UserRole } from '../context/AuthContext';

const roleHome: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
};

interface ProtectedRouteProps {
  role: UserRole;
  children: ReactNode;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (user.role !== role) {
    return <Navigate to={roleHome[user.role]} replace />;
  }

  return <>{children}</>;
}

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={roleHome[user.role]} replace />;
  }

  return <>{children}</>;
}
