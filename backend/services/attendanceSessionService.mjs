export function validateOpenSessionInput(input) {
  const errors = [];
  const courseId = String(input.courseId ?? input.course_id ?? '').trim();
  const scheduleIdRaw = input.scheduleId ?? input.schedule_id;
  const scheduleId = scheduleIdRaw === undefined || scheduleIdRaw === null || String(scheduleIdRaw).trim() === ''
    ? null
    : String(scheduleIdRaw).trim();
  const sessionDate = String(input.sessionDate ?? input.session_date ?? '').trim();

  if (!courseId) errors.push('Ma khoa hoc la bat buoc.');
  if (!isValidDate(sessionDate)) errors.push('Ngay diem danh khong hop le.');

  return {
    data: { courseId, scheduleId, sessionDate },
    errors,
  };
}

export function createAttendanceSessionService(getPool, { randomUUID }) {
  function requireDatabase() {
    const pool = getPool();
    if (!pool) {
      const error = new Error('Database chua duoc cau hinh.');
      error.statusCode = 503;
      throw error;
    }
    return pool;
  }

  async function getOwnedCourse(teacherId, courseId) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select id, teacher_id, status
       from public.courses
       where id = $1 and teacher_id = $2
       limit 1`,
      [courseId, teacherId],
    );
    return result.rows[0] ?? null;
  }

  async function assertTeacherOwnsCourse(teacherId, courseId) {
    const course = await getOwnedCourse(teacherId, courseId);
    if (!course) {
      const error = new Error('Khong tim thay khoa hoc hoac ban khong co quyen.');
      error.statusCode = 403;
      throw error;
    }
    return course;
  }

  async function assertScheduleBelongsToCourse(courseId, scheduleId) {
    if (!scheduleId) return;

    const pool = requireDatabase();
    const result = await pool.query(
      `select id
       from public.course_schedules
       where id = $1 and course_id = $2
       limit 1`,
      [scheduleId, courseId],
    );

    if (!result.rows[0]) {
      const error = new Error('Lich hoc khong thuoc khoa hoc nay.');
      error.statusCode = 400;
      throw error;
    }
  }

  async function openSession(teacherId, input) {
    const pool = requireDatabase();
    const course = await assertTeacherOwnsCourse(teacherId, input.courseId);
    if (course.status !== 'active') {
      const error = new Error('Chi co the mo phien diem danh cho khoa hoc active.');
      error.statusCode = 400;
      throw error;
    }

    await assertScheduleBelongsToCourse(input.courseId, input.scheduleId);

    const id = `SES${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const result = await pool.query(
      `insert into public.attendance_sessions
        (id, course_id, schedule_id, teacher_id, session_date, status)
       values ($1, $2, $3, $4, $5, 'open')
       returning *`,
      [id, input.courseId, input.scheduleId, teacherId, input.sessionDate],
    );

    return mapSession(result.rows[0]);
  }

  async function listCourseSessions(teacherId, courseId) {
    const pool = requireDatabase();
    await assertTeacherOwnsCourse(teacherId, courseId);

    const result = await pool.query(
      `select *
       from public.attendance_sessions
       where course_id = $1
       order by session_date desc, opened_at desc`,
      [courseId],
    );

    return result.rows.map(mapSession);
  }

  async function getSession(teacherId, sessionId) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select s.*
       from public.attendance_sessions s
       join public.courses c on c.id = s.course_id
       where s.id = $1 and c.teacher_id = $2
       limit 1`,
      [sessionId, teacherId],
    );

    return result.rows[0] ? mapSession(result.rows[0]) : null;
  }

  async function closeSession(teacherId, sessionId) {
    return finishSession(teacherId, sessionId, 'closed');
  }

  async function cancelSession(teacherId, sessionId) {
    return finishSession(teacherId, sessionId, 'cancelled');
  }

  async function finishSession(teacherId, sessionId, nextStatus) {
    const pool = requireDatabase();
    const session = await getSession(teacherId, sessionId);
    if (!session) return null;

    if (session.status !== 'open') {
      const error = new Error('Chi co the dong/huy phien dang open.');
      error.statusCode = 400;
      throw error;
    }

    const result = await pool.query(
      `update public.attendance_sessions
       set status = $1,
           closed_at = now()
       where id = $2
       returning *`,
      [nextStatus, sessionId],
    );

    return result.rows[0] ? mapSession(result.rows[0]) : null;
  }

  return {
    openSession,
    listCourseSessions,
    getSession,
    closeSession,
    cancelSession,
  };
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function mapSession(row) {
  return {
    id: row.id,
    course_id: row.course_id,
    schedule_id: row.schedule_id,
    teacher_id: row.teacher_id,
    session_date: formatDate(row.session_date),
    opened_at: row.opened_at,
    closed_at: row.closed_at,
    status: row.status,
  };
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
