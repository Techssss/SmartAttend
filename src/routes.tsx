import { createBrowserRouter } from 'react-router';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminLayout } from './components/AdminLayout';
import { TeacherLayout } from './components/TeacherLayout';
import { StudentLayout } from './components/StudentLayout';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Classes } from './pages/Classes';
import { Students } from './pages/Students';
import { Reports } from './pages/Reports';
import { Alerts } from './pages/Alerts';
import { SettingsPage } from './pages/SettingsPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/', Component: Landing },
  { path: '/login', element: <GuestRoute><Login /></GuestRoute> },
  { path: '/register', element: <GuestRoute><Register /></GuestRoute> },
  {
    path: '/admin',
    element: <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, Component: Dashboard },
      { path: 'attendance', Component: Attendance },
      { path: 'classes', Component: Classes },
      { path: 'students', Component: Students },
      { path: 'reports', Component: Reports },
      { path: 'alerts', Component: Alerts },
      { path: 'settings', Component: SettingsPage },
    ],
  },
  {
    path: '/teacher',
    element: <ProtectedRoute role="teacher"><TeacherLayout /></ProtectedRoute>,
    children: [
      { index: true, Component: TeacherDashboard },
      { path: 'attendance', Component: Attendance },
      { path: 'classes', Component: Classes },
      { path: 'reports', Component: Reports },
    ],
  },
  {
    path: '/student',
    element: <ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>,
    children: [
      { index: true, Component: StudentDashboard },
      { path: 'history', Component: StudentDashboard },
    ],
  },
]);
