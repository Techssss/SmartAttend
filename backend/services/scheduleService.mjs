export function validateScheduleInput(input, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || input.day_of_week !== undefined) {
    const day = Number(input.day_of_week);
    if (!Number.isInteger(day) || day < 1 || day > 7) {
      errors.push('Thu trong tuan phai tu 1 den 7.');
    }
    data.day_of_week = day;
  }

  if (!partial || input.start_time !== undefined) {
    const startTime = String(input.start_time || '').trim();
    if (!isValidTime(startTime)) errors.push('Gio bat dau khong hop le.');
    data.start_time = normalizeTime(startTime);
  }

  if (!partial || input.end_time !== undefined) {
    const endTime = String(input.end_time || '').trim();
    if (!isValidTime(endTime)) errors.push('Gio ket thuc khong hop le.');
    data.end_time = normalizeTime(endTime);
  }

  if (input.room !== undefined) {
    const room = String(input.room || '').trim();
    data.room = room || null;
  } else if (!partial) {
    data.room = null;
  }

  const nextStartTime = data.start_time ?? input.currentStartTime;
  const nextEndTime = data.end_time ?? input.currentEndTime;
  if (isValidTime(nextStartTime) && isValidTime(nextEndTime) && normalizeTime(nextStartTime) >= normalizeTime(nextEndTime)) {
    errors.push('Gio bat dau phai nho hon gio ket thuc.');
  }

  if (partial && Object.keys(data).length === 0) {
    errors.push('Khong co truong hop le de cap nhat.');
  }

  return { data, errors };
}

export function createScheduleService(getPool, { randomUUID }) {
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
      `select id, teacher_id, status, room
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

  async function createSchedule(teacherId, courseId, input) {
    const pool = requireDatabase();
    const course = await assertTeacherOwnsCourse(teacherId, courseId);
    if (course.status === 'archived') {
      const error = new Error('Khong the tao lich hoc cho khoa hoc da archive.');
      error.statusCode = 400;
      throw error;
    }

    const id = `SCH${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const result = await pool.query(
      `insert into public.course_schedules
        (id, course_id, day_of_week, start_time, end_time, room)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [
        id,
        courseId,
        input.day_of_week,
        input.start_time,
        input.end_time,
        input.room ?? null,
      ],
    );

    return mapSchedule(result.rows[0]);
  }

  async function listSchedules(teacherId, courseId) {
    const pool = requireDatabase();
    await assertTeacherOwnsCourse(teacherId, courseId);

    const result = await pool.query(
      `select *
       from public.course_schedules
       where course_id = $1
       order by day_of_week asc, start_time asc`,
      [courseId],
    );

    return result.rows.map(mapSchedule);
  }

  async function getSchedule(teacherId, courseId, scheduleId) {
    const pool = requireDatabase();
    await assertTeacherOwnsCourse(teacherId, courseId);

    const result = await pool.query(
      `select *
       from public.course_schedules
       where id = $1 and course_id = $2
       limit 1`,
      [scheduleId, courseId],
    );

    return result.rows[0] ? mapSchedule(result.rows[0]) : null;
  }

  async function updateSchedule(teacherId, courseId, scheduleId, input) {
    const pool = requireDatabase();
    const course = await assertTeacherOwnsCourse(teacherId, courseId);
    if (course.status === 'archived') {
      const error = new Error('Khong the cap nhat lich hoc cua khoa hoc da archive.');
      error.statusCode = 400;
      throw error;
    }

    const current = await getSchedule(teacherId, courseId, scheduleId);
    if (!current) return null;

    const { data, errors } = validateScheduleInput(
      {
        ...input,
        currentStartTime: current.start_time,
        currentEndTime: current.end_time,
      },
      { partial: true },
    );
    if (errors.length) {
      const error = new Error(errors.join(' '));
      error.statusCode = 400;
      throw error;
    }

    const allowedColumns = ['day_of_week', 'start_time', 'end_time', 'room'];
    const sets = [];
    const values = [];

    for (const column of allowedColumns) {
      if (Object.prototype.hasOwnProperty.call(data, column)) {
        values.push(data[column]);
        sets.push(`${column} = $${values.length}`);
      }
    }

    values.push(scheduleId, courseId);
    const scheduleIdParam = values.length - 1;
    const courseIdParam = values.length;

    const result = await pool.query(
      `update public.course_schedules
       set ${sets.join(', ')}
       where id = $${scheduleIdParam} and course_id = $${courseIdParam}
       returning *`,
      values,
    );

    return result.rows[0] ? mapSchedule(result.rows[0]) : null;
  }

  async function deleteSchedule(teacherId, courseId, scheduleId) {
    const pool = requireDatabase();
    const course = await assertTeacherOwnsCourse(teacherId, courseId);
    if (course.status === 'archived') {
      const error = new Error('Khong the xoa lich hoc cua khoa hoc da archive.');
      error.statusCode = 400;
      throw error;
    }

    const result = await pool.query(
      `delete from public.course_schedules
       where id = $1 and course_id = $2
       returning *`,
      [scheduleId, courseId],
    );

    return result.rows[0] ? mapSchedule(result.rows[0]) : null;
  }

  return {
    assertTeacherOwnsCourse,
    createSchedule,
    listSchedules,
    getSchedule,
    updateSchedule,
    deleteSchedule,
  };
}

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(String(value || ''));
}

function normalizeTime(value) {
  const raw = String(value || '').trim();
  return raw.length === 5 ? `${raw}:00` : raw;
}

function mapSchedule(row) {
  return {
    id: row.id,
    course_id: row.course_id,
    day_of_week: row.day_of_week,
    start_time: formatTime(row.start_time),
    end_time: formatTime(row.end_time),
    room: row.room,
    created_at: row.created_at,
  };
}

function formatTime(value) {
  return String(value).slice(0, 5);
}
