export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Course {
  id: string;
  teacherId: string;
  code: string;
  name: string;
  description: string | null;
  room: string | null;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CourseSchedule {
  id: string;
  courseId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  createdAt: string;
}

export interface CourseInvitation {
  id: string;
  courseId: string;
  invitedEmail: string;
  invitedStudentId: string | null;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
  acceptedAt: string | null;
  declinedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  courseCode?: string;
  courseName?: string;
  teacherName?: string;
}

export interface TimetableCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  teacherId: string;
  room: string | null;
  startDate: string;
  endDate: string;
  schedules: Array<{
    scheduleId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string | null;
  }>;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  scheduleId: string | null;
  teacherId: string;
  sessionDate: string;
  openedAt: string;
  closedAt: string | null;
  status: 'open' | 'closed' | 'cancelled';
}

export interface AttendanceRecordRow {
  studentId: string;
  studentName: string;
  email: string;
  attendanceStatus: 'present' | 'late' | 'absent' | 'rejected';
  method: 'face' | 'manual' | null;
  scanTime: string | null;
  confidence: number | null;
  livenessScore: number | null;
}

export interface CourseAttendanceSession {
  sessionId: string;
  sessionDate: string;
  status: 'open' | 'closed' | 'cancelled';
  openedAt: string;
  closedAt: string | null;
  records: AttendanceRecordRow[];
}

export interface FaceRecognizeResponse {
  matched: boolean;
  student_id?: string;
  student_name?: string;
  confidence: number;
  reason: 'MATCHED' | 'NO_FACE' | 'MULTIPLE_FACES' | 'LOW_CONFIDENCE' | 'NO_REGISTERED_FACE';
}

export interface FaceCheckInResponse {
  status: 'checked_in' | 'already_checked_in';
  record: unknown;
}

export interface OpenFaceSession {
  id: string;
  course_id: string;
  schedule_id: string | null;
  session_date: string;
  opened_at: string;
  status: 'open';
  course_code: string;
  course_name: string;
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload as T;
}

async function data<T>(path: string, token: string, init: RequestInit = {}) {
  const payload = await request<ApiEnvelope<T>>(path, token, init);
  return payload.data;
}

export function listCourses(token: string) {
  return data<RawCourse[]>('/api/courses', token).then((courses) => courses.map(mapCourse));
}

export function createCourse(token: string, payload: {
  code: string;
  name: string;
  description?: string | null;
  room?: string | null;
  start_date: string;
  end_date: string;
  status?: Course['status'];
}) {
  return data<RawCourse>('/api/courses', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(mapCourse);
}

export function listSchedules(token: string, courseId: string) {
  return data<RawSchedule[]>(`/api/courses/${encodeURIComponent(courseId)}/schedules`, token).then((schedules) => schedules.map(mapSchedule));
}

export function createSchedule(token: string, courseId: string, payload: {
  day_of_week: number;
  start_time: string;
  end_time: string;
  room?: string | null;
}) {
  return data<RawSchedule>(`/api/courses/${encodeURIComponent(courseId)}/schedules`, token, {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(mapSchedule);
}

export function listCourseInvitations(token: string, courseId: string) {
  return data<RawInvitation[]>(`/api/courses/${encodeURIComponent(courseId)}/invitations`, token).then((invitations) => invitations.map(mapInvitation));
}

export function createCourseInvitation(token: string, courseId: string, email: string) {
  return data<RawInvitation>(`/api/courses/${encodeURIComponent(courseId)}/invitations`, token, {
    method: 'POST',
    body: JSON.stringify({ email }),
  }).then(mapInvitation);
}

export function listMyInvitations(token: string) {
  return data<RawInvitation[]>('/api/me/invitations', token).then((invitations) => invitations.map(mapInvitation));
}

export function acceptInvitation(token: string, invitationId: string) {
  return data(`/api/invitations/${encodeURIComponent(invitationId)}/accept`, token, { method: 'POST' });
}

export function declineInvitation(token: string, invitationId: string) {
  return data<RawInvitation>(`/api/invitations/${encodeURIComponent(invitationId)}/decline`, token, { method: 'POST' }).then(mapInvitation);
}

export function getTimetable(token: string) {
  return request<TimetableCourse[]>('/api/me/timetable', token);
}

export function listCourseAttendance(token: string, courseId: string) {
  return data<CourseAttendanceSession[]>(`/api/courses/${encodeURIComponent(courseId)}/attendance`, token);
}

export function listCourseAttendanceSessions(token: string, courseId: string) {
  return data<RawAttendanceSession[]>(`/api/courses/${encodeURIComponent(courseId)}/attendance/sessions`, token).then((sessions) => sessions.map(mapSession));
}

export function openAttendanceSession(
  token: string,
  payload: { courseId: string; scheduleId?: string | null; sessionDate: string },
) {
  return data<RawAttendanceSession>('/api/attendance/sessions', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(mapSession);
}

export function closeAttendanceSession(token: string, sessionId: string) {
  return data<RawAttendanceSession>(`/api/attendance/sessions/${encodeURIComponent(sessionId)}/close`, token, { method: 'POST' }).then(mapSession);
}

export function listSessionRecords(token: string, sessionId: string) {
  return data<AttendanceRecordRow[]>(`/api/attendance/sessions/${encodeURIComponent(sessionId)}/records`, token);
}

export function markManualAttendance(token: string, sessionId: string, studentId: string, status: 'present' | 'late' | 'rejected') {
  return data(`/api/attendance/sessions/${encodeURIComponent(sessionId)}/manual`, token, {
    method: 'POST',
    body: JSON.stringify({ studentId, status }),
  });
}

async function publicJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.detail || payload.message || 'Request failed');
  }

  return payload as T;
}

export function recognizeFace(image: string, sessionId?: string) {
  return publicJson<FaceRecognizeResponse>('/api/face/recognize', {
    method: 'POST',
    body: JSON.stringify({ image, session_id: sessionId }),
  });
}

export function registerFace(studentId: string, image: string) {
  return publicJson('/api/face/register', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId, image }),
  });
}

export function checkInByFace(studentId: string, sessionId: string, confidence: number) {
  return publicJson<FaceCheckInResponse>('/api/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentId,
      session_id: sessionId,
      method: 'face',
      confidence,
    }),
  });
}

export function listOpenFaceSessions(studentId: string) {
  return publicJson<OpenFaceSession[]>(`/api/attendance/open-sessions?student_id=${encodeURIComponent(studentId)}`);
}

interface RawCourse {
  id: string;
  teacher_id: string;
  code: string;
  name: string;
  description: string | null;
  room: string | null;
  start_date: string;
  end_date: string;
  status: Course['status'];
  created_at: string;
  updated_at: string;
}

interface RawSchedule {
  id: string;
  course_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  created_at: string;
}

interface RawInvitation {
  id: string;
  course_id: string;
  invited_email: string;
  invited_student_id: string | null;
  invited_student_name?: string | null;
  invited_by: string;
  status: CourseInvitation['status'];
  accepted_at: string | null;
  declined_at: string | null;
  expires_at: string | null;
  created_at: string;
  course?: {
    id: string;
    code: string;
    name: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
}

interface RawAttendanceSession {
  id: string;
  course_id: string;
  schedule_id: string | null;
  teacher_id: string;
  session_date: string;
  opened_at: string;
  closed_at: string | null;
  status: AttendanceSession['status'];
}

function mapCourse(course: RawCourse): Course {
  return {
    id: course.id,
    teacherId: course.teacher_id,
    code: course.code,
    name: course.name,
    description: course.description,
    room: course.room,
    startDate: course.start_date,
    endDate: course.end_date,
    status: course.status,
    createdAt: course.created_at,
    updatedAt: course.updated_at,
  };
}

function mapSchedule(schedule: RawSchedule): CourseSchedule {
  return {
    id: schedule.id,
    courseId: schedule.course_id,
    dayOfWeek: schedule.day_of_week,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    room: schedule.room,
    createdAt: schedule.created_at,
  };
}

function mapInvitation(invitation: RawInvitation): CourseInvitation {
  return {
    id: invitation.id,
    courseId: invitation.course_id,
    invitedEmail: invitation.invited_email,
    invitedStudentId: invitation.invited_student_id,
    invitedBy: invitation.invited_by,
    status: invitation.status,
    acceptedAt: invitation.accepted_at,
    declinedAt: invitation.declined_at,
    expiresAt: invitation.expires_at,
    createdAt: invitation.created_at,
    courseCode: invitation.course?.code,
    courseName: invitation.course?.name,
    teacherName: invitation.teacher?.name,
  };
}

function mapSession(session: RawAttendanceSession): AttendanceSession {
  return {
    id: session.id,
    courseId: session.course_id,
    scheduleId: session.schedule_id,
    teacherId: session.teacher_id,
    sessionDate: session.session_date,
    openedAt: session.opened_at,
    closedAt: session.closed_at,
    status: session.status,
  };
}
