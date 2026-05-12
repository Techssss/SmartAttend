const MANUAL_STATUSES = new Set(['present', 'late', 'rejected']);

export function validateManualAttendanceInput(input) {
  const errors = [];
  const studentId = String(input.studentId ?? input.student_id ?? '').trim();
  const status = String(input.status || '').trim();

  if (!studentId) errors.push('Ma hoc sinh la bat buoc.');
  if (!MANUAL_STATUSES.has(status)) {
    errors.push('Trang thai diem danh khong hop le.');
  }

  return {
    data: { studentId, status },
    errors,
  };
}

export function createAttendanceRecordService(getPool, { randomUUID }) {
  function requireDatabase() {
    const pool = getPool();
    if (!pool) {
      const error = new Error('Database chua duoc cau hinh.');
      error.statusCode = 503;
      throw error;
    }
    return pool;
  }

  async function getOwnedSession(teacherId, sessionId) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select s.*
       from public.attendance_sessions s
       join public.courses c on c.id = s.course_id
       where s.id = $1 and c.teacher_id = $2
       limit 1`,
      [sessionId, teacherId],
    );

    return result.rows[0] ?? null;
  }

  async function assertOwnedSession(teacherId, sessionId) {
    const session = await getOwnedSession(teacherId, sessionId);
    if (!session) {
      const error = new Error('Khong tim thay phien diem danh hoac ban khong co quyen.');
      error.statusCode = 404;
      throw error;
    }
    return session;
  }

  async function assertActiveEnrollment(courseId, studentId) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select e.id
       from public.course_enrollments e
       join public.app_users u on u.id = e.student_id
       where e.course_id = $1
         and e.student_id = $2
         and e.status = 'active'
         and u.role = 'student'
       limit 1`,
      [courseId, studentId],
    );

    if (!result.rows[0]) {
      const error = new Error('Hoc sinh chua co enrollment active trong khoa hoc.');
      error.statusCode = 403;
      throw error;
    }
  }

  async function markManualAttendance(teacherId, sessionId, input) {
    const pool = requireDatabase();
    const session = await assertOwnedSession(teacherId, sessionId);

    if (session.status !== 'open') {
      const error = new Error('Chi co the diem danh khi phien dang open.');
      error.statusCode = 400;
      throw error;
    }

    await assertActiveEnrollment(session.course_id, input.studentId);

    const id = `ATR${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const result = await pool.query(
      `insert into public.attendance_records
        (id, session_id, course_id, student_id, status, method, scan_time)
       values ($1, $2, $3, $4, $5, 'manual', now())
       on conflict (session_id, student_id)
       do update set
         status = excluded.status,
         method = 'manual',
         scan_time = now(),
         confidence = null,
         liveness_score = null
       returning *`,
      [id, sessionId, session.course_id, input.studentId, input.status],
    );

    return mapRecord(result.rows[0]);
  }

  async function listSessionRecords(teacherId, sessionId) {
    const pool = requireDatabase();
    const session = await assertOwnedSession(teacherId, sessionId);

    const result = await pool.query(
      `select
          u.id as student_id,
          u.name as student_name,
          u.email,
          r.id as record_id,
          r.status as attendance_status,
          r.method,
          r.scan_time,
          r.confidence,
          r.liveness_score
       from public.course_enrollments e
       join public.app_users u on u.id = e.student_id
       left join public.attendance_records r
         on r.session_id = $2
        and r.student_id = e.student_id
       where e.course_id = $1
         and e.status = 'active'
       order by u.name asc, u.email asc`,
      [session.course_id, sessionId],
    );

    return result.rows.map(mapRecordRowWithAbsent);
  }

  async function listCourseAttendance(teacherId, courseId) {
    const pool = requireDatabase();
    const ownership = await pool.query(
      `select id
       from public.courses
       where id = $1 and teacher_id = $2
       limit 1`,
      [courseId, teacherId],
    );

    if (!ownership.rows[0]) {
      const error = new Error('Khong tim thay khoa hoc hoac ban khong co quyen.');
      error.statusCode = 403;
      throw error;
    }

    const result = await pool.query(
      `select
          s.id as session_id,
          s.session_date,
          s.status as session_status,
          s.opened_at,
          s.closed_at,
          u.id as student_id,
          u.name as student_name,
          u.email,
          r.id as record_id,
          r.status as attendance_status,
          r.method,
          r.scan_time,
          r.confidence,
          r.liveness_score
       from public.attendance_sessions s
       join public.course_enrollments e
         on e.course_id = s.course_id
        and e.status = 'active'
       join public.app_users u on u.id = e.student_id
       left join public.attendance_records r
         on r.session_id = s.id
        and r.student_id = e.student_id
       where s.course_id = $1
       order by s.session_date desc, s.opened_at desc, u.name asc`,
      [courseId],
    );

    return groupCourseAttendance(result.rows);
  }

  return {
    markManualAttendance,
    listSessionRecords,
    listCourseAttendance,
  };
}

function mapRecord(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    courseId: row.course_id,
    studentId: row.student_id,
    attendanceStatus: row.status,
    method: row.method,
    scanTime: row.scan_time,
    confidence: row.confidence,
    livenessScore: row.liveness_score,
  };
}

function mapRecordRowWithAbsent(row) {
  return {
    studentId: row.student_id,
    studentName: row.student_name,
    email: row.email,
    attendanceStatus: row.attendance_status ?? 'absent',
    method: row.method ?? null,
    scanTime: row.scan_time ?? null,
    confidence: row.confidence ?? null,
    livenessScore: row.liveness_score ?? null,
  };
}

function groupCourseAttendance(rows) {
  const sessions = new Map();

  for (const row of rows) {
    if (!sessions.has(row.session_id)) {
      sessions.set(row.session_id, {
        sessionId: row.session_id,
        sessionDate: formatDate(row.session_date),
        status: row.session_status,
        openedAt: row.opened_at,
        closedAt: row.closed_at,
        records: [],
      });
    }

    sessions.get(row.session_id).records.push(mapRecordRowWithAbsent(row));
  }

  return [...sessions.values()];
}

function formatDate(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return value;
}
