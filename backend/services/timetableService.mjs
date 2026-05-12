export function createTimetableService(getPool) {
  function requireDatabase() {
    const pool = getPool();
    if (!pool) {
      const error = new Error('Database chua duoc cau hinh.');
      error.statusCode = 503;
      throw error;
    }
    return pool;
  }

  async function getStudentTimetable(student) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select
          c.id as course_id,
          c.code as course_code,
          c.name as course_name,
          c.teacher_id,
          c.room as course_room,
          c.start_date,
          c.end_date,
          s.id as schedule_id,
          s.day_of_week,
          s.start_time,
          s.end_time,
          s.room as schedule_room
       from public.course_enrollments e
       join public.course_invitations i on i.id = e.invitation_id
        and i.course_id = e.course_id
       join public.courses c on c.id = e.course_id
       join public.app_users u on u.id = e.student_id
       left join public.course_schedules s on s.course_id = c.id
       where e.student_id = $1
         and e.status = 'active'
         and u.role = 'student'
         and i.status = 'accepted'
         and lower(i.invited_email) = lower($2)
         and (i.invited_student_id is null or i.invited_student_id = e.student_id)
         and c.status = 'active'
       order by c.start_date asc, c.code asc, s.day_of_week asc nulls last, s.start_time asc nulls last`,
      [student.id, student.email],
    );

    return groupTimetableRows(result.rows);
  }

  return { getStudentTimetable };
}

function groupTimetableRows(rows) {
  const courses = new Map();

  for (const row of rows) {
    if (!courses.has(row.course_id)) {
      courses.set(row.course_id, {
        courseId: row.course_id,
        courseCode: row.course_code,
        courseName: row.course_name,
        teacherId: row.teacher_id,
        room: row.course_room,
        startDate: formatDate(row.start_date),
        endDate: formatDate(row.end_date),
        schedules: [],
      });
    }

    if (row.schedule_id) {
      courses.get(row.course_id).schedules.push({
        scheduleId: row.schedule_id,
        dayOfWeek: row.day_of_week,
        startTime: formatTime(row.start_time),
        endTime: formatTime(row.end_time),
        room: row.schedule_room ?? row.course_room,
      });
    }
  }

  return [...courses.values()];
}

function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

function formatTime(value) {
  return String(value).slice(0, 5);
}
