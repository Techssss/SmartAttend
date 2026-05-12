export type UserRole = 'admin' | 'teacher' | 'student';
export type AttendanceStatus = 'present' | 'late' | 'absent';
export type FaceEnrollmentStatus = 'registered' | 'pending';

export interface DemoAccount {
  role: UserRole;
  email: string;
  name: string;
  id: string;
  class?: string;
  department?: string;
  labelKey: 'loginDemoAdmin' | 'loginDemoTeacher' | 'loginDemoStudent';
  path: string;
}

// Demo login accounts are kept intentionally because backend seeds these users for manual testing.
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'admin',
    email: 'admin@smartattend.vn',
    name: 'Quan tri vien',
    id: 'ADMIN001',
    labelKey: 'loginDemoAdmin',
    path: '/admin',
  },
  {
    role: 'teacher',
    email: 'teacher@smartattend.vn',
    name: 'TS. Nguyen Minh Tuan',
    id: 'TCH001',
    department: 'Khoa CNTT',
    labelKey: 'loginDemoTeacher',
    path: '/teacher',
  },
  {
    role: 'student',
    email: 'student@smartattend.vn',
    name: 'Nguyen Van An',
    id: 'STU001',
    class: 'CS-301',
    labelKey: 'loginDemoStudent',
    path: '/student',
  },
];

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function percent(value: number, total: number, digits = 0) {
  if (!total) return 0;
  const factor = 10 ** digits;
  return Math.round((value / total) * 100 * factor) / factor;
}
