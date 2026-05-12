import { createServer } from 'node:http';
import { randomUUID, randomBytes } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDbPool, ensureDatabase, loadEnv } from './lib/database.mjs';
import { sendJson } from './lib/http.mjs';
import { createAuthMiddleware } from './middleware/authMiddleware.mjs';
import { createRouter } from './router.mjs';
import { createAttendanceRecordService } from './services/attendanceRecordService.mjs';
import { createAttendanceSessionService } from './services/attendanceSessionService.mjs';
import { createCourseService } from './services/courseService.mjs';
import { createInvitationService } from './services/invitationService.mjs';
import { createScheduleService } from './services/scheduleService.mjs';
import { createTimetableService } from './services/timetableService.mjs';
import { createUserService, publicUser } from './services/userService.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const dataDir = join(__dirname, 'data');
const tokenStore = new Map();

await loadEnv(projectRoot);

const port = Number(process.env.PORT || 4000);
let pool = createDbPool();
let databaseStatus = pool ? 'configured' : 'not-configured';
let databaseError = '';

const users = createUserService({ getPool: () => pool, dataDir });

function createSession(user) {
  const token = randomUUID() + randomBytes(24).toString('hex');
  tokenStore.set(token, { userId: user.id, createdAt: Date.now() });
  return token;
}

const { requireAuth, requireTeacher, requireStudent } = createAuthMiddleware({
  tokenStore,
  findUserById: users.findUserById,
  sendJson,
  publicUser,
});

const courses = createCourseService(() => pool, { randomUUID });
const attendanceRecords = createAttendanceRecordService(() => pool, { randomUUID });
const attendanceSessions = createAttendanceSessionService(() => pool, { randomUUID });
const invitations = createInvitationService(() => pool, { randomUUID });
const schedules = createScheduleService(() => pool, { randomUUID });
const timetable = createTimetableService(() => pool);

const handleRequest = createRouter({
  getStorage: () => (pool ? 'postgres' : 'json'),
  getDatabaseStatus: () => databaseStatus,
  getDatabaseError: () => databaseError,
  tokenStore,
  users,
  createSession,
  requireAuth,
  requireTeacher,
  requireStudent,
  courses,
  attendanceRecords,
  attendanceSessions,
  invitations,
  schedules,
  timetable,
});

try {
  await ensureDatabase(pool);
  await users.seedDemoUsers();
  databaseStatus = pool ? 'connected' : 'not-configured';
} catch (error) {
  databaseStatus = 'unavailable';
  databaseError = error instanceof Error ? error.message : String(error);
  await pool?.end().catch(() => {});
  pool = null;
}

createServer(handleRequest).listen(port, () => {
  const storage = pool ? 'PostgreSQL/Supabase' : 'local JSON';
  console.log(`SmartAttend API running at http://127.0.0.1:${port} (${storage})`);
});
