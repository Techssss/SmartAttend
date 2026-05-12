const COURSE_STATUSES = new Set(['draft', 'active', 'archived']);

export function validateCourseInput(input, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || input.code !== undefined) {
    const code = String(input.code || '').trim();
    if (!code) errors.push('Ma khoa hoc la bat buoc.');
    data.code = code;
  }

  if (!partial || input.name !== undefined) {
    const name = String(input.name || '').trim();
    if (!name) errors.push('Ten khoa hoc la bat buoc.');
    data.name = name;
  }

  if (input.description !== undefined) {
    const description = String(input.description || '').trim();
    data.description = description || null;
  } else if (!partial) {
    data.description = null;
  }

  if (input.room !== undefined) {
    const room = String(input.room || '').trim();
    data.room = room || null;
  } else if (!partial) {
    data.room = null;
  }

  if (!partial || input.start_date !== undefined) {
    const startDate = String(input.start_date || '').trim();
    if (!isValidDate(startDate)) errors.push('Ngay bat dau khong hop le.');
    data.start_date = startDate;
  }

  if (!partial || input.end_date !== undefined) {
    const endDate = String(input.end_date || '').trim();
    if (!isValidDate(endDate)) errors.push('Ngay ket thuc khong hop le.');
    data.end_date = endDate;
  }

  if (input.status !== undefined || !partial) {
    const status = String(input.status || 'draft').trim();
    if (!COURSE_STATUSES.has(status)) errors.push('Trang thai khoa hoc khong hop le.');
    data.status = status;
  }

  const nextStartDate = data.start_date ?? input.currentStartDate;
  const nextEndDate = data.end_date ?? input.currentEndDate;
  if (isValidDate(nextStartDate) && isValidDate(nextEndDate) && nextStartDate > nextEndDate) {
    errors.push('Ngay bat dau phai nho hon hoac bang ngay ket thuc.');
  }

  if (partial && Object.keys(data).length === 0) {
    errors.push('Khong co truong hop le de cap nhat.');
  }

  return { data, errors };
}

export function createCourseService(getPool, { randomUUID }) {
  function requireDatabase() {
    const pool = getPool();
    if (!pool) {
      const error = new Error('Database chua duoc cau hinh.');
      error.statusCode = 503;
      throw error;
    }
    return pool;
  }

  async function createCourse(teacherId, input) {
    const pool = requireDatabase();
    const id = `CRS${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const result = await pool.query(
      `insert into public.courses
        (id, teacher_id, code, name, description, start_date, end_date, room, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       returning *`,
      [
        id,
        teacherId,
        input.code,
        input.name,
        input.description ?? null,
        input.start_date,
        input.end_date,
        input.room ?? null,
        input.status ?? 'draft',
      ],
    );

    return mapCourse(result.rows[0]);
  }

  async function listCourses(teacherId) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select *
       from public.courses
       where teacher_id = $1
       order by created_at desc`,
      [teacherId],
    );
    return result.rows.map(mapCourse);
  }

  async function getCourseById(teacherId, courseId) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select *
       from public.courses
       where id = $1 and teacher_id = $2
       limit 1`,
      [courseId, teacherId],
    );
    return result.rows[0] ? mapCourse(result.rows[0]) : null;
  }

  async function updateCourse(teacherId, courseId, input) {
    const pool = requireDatabase();
    const current = await getCourseById(teacherId, courseId);
    if (!current) return null;

    const { data, errors } = validateCourseInput(
      {
        ...input,
        currentStartDate: current.start_date,
        currentEndDate: current.end_date,
      },
      { partial: true },
    );
    if (errors.length) {
      const error = new Error(errors.join(' '));
      error.statusCode = 400;
      throw error;
    }

    const allowedColumns = ['code', 'name', 'description', 'room', 'start_date', 'end_date', 'status'];
    const sets = [];
    const values = [];

    for (const column of allowedColumns) {
      if (Object.prototype.hasOwnProperty.call(data, column)) {
        values.push(data[column]);
        sets.push(`${column} = $${values.length}`);
      }
    }

    values.push(courseId, teacherId);
    const courseIdParam = values.length - 1;
    const teacherIdParam = values.length;

    const result = await pool.query(
      `update public.courses
       set ${sets.join(', ')}, updated_at = now()
       where id = $${courseIdParam} and teacher_id = $${teacherIdParam}
       returning *`,
      values,
    );

    return result.rows[0] ? mapCourse(result.rows[0]) : null;
  }

  async function archiveCourse(teacherId, courseId) {
    const pool = requireDatabase();
    const result = await pool.query(
      `update public.courses
       set status = 'archived', updated_at = now()
       where id = $1 and teacher_id = $2
       returning *`,
      [courseId, teacherId],
    );
    return result.rows[0] ? mapCourse(result.rows[0]) : null;
  }

  return {
    createCourse,
    listCourses,
    getCourseById,
    updateCourse,
    archiveCourse,
  };
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function mapCourse(row) {
  return {
    id: row.id,
    teacher_id: row.teacher_id,
    code: row.code,
    name: row.name,
    description: row.description,
    start_date: formatDate(row.start_date),
    end_date: formatDate(row.end_date),
    room: row.room,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}
