export function validateInvitationInput(input) {
  const errors = [];
  const email = normalizeEmail(input.email ?? input.invited_email);
  const expiresAt = input.expires_at === undefined || input.expires_at === null || input.expires_at === ''
    ? null
    : String(input.expires_at).trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email hoc sinh khong hop le.');
  }

  if (expiresAt && Number.isNaN(Date.parse(expiresAt))) {
    errors.push('Thoi diem het han loi moi khong hop le.');
  }

  return {
    data: { invited_email: email, expires_at: expiresAt },
    errors,
  };
}

export function createInvitationService(getPool, { randomUUID }) {
  function requireDatabase() {
    const pool = getPool();
    if (!pool) {
      const error = new Error('Database chua duoc cau hinh.');
      error.statusCode = 503;
      throw error;
    }
    return pool;
  }

  async function assertTeacherOwnsCourse(teacherId, courseId) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select id, teacher_id, status
       from public.courses
       where id = $1 and teacher_id = $2
       limit 1`,
      [courseId, teacherId],
    );

    if (!result.rows[0]) {
      const error = new Error('Khong tim thay khoa hoc hoac ban khong co quyen.');
      error.statusCode = 403;
      throw error;
    }

    return result.rows[0];
  }

  async function createInvitation(teacherId, courseId, input) {
    const pool = requireDatabase();
    await assertTeacherOwnsCourse(teacherId, courseId);

    const existing = await findBlockingInvitationByEmail(courseId, input.invited_email);
    if (existing) {
      const error = new Error(
        existing.status === 'accepted'
          ? 'Hoc sinh nay da chap nhan tham gia khoa hoc.'
          : 'Loi moi dang cho cho email nay da ton tai trong khoa hoc.',
      );
      error.statusCode = 409;
      error.data = existing;
      throw error;
    }

    const invitedUser = await findUserByEmail(input.invited_email);
    if (invitedUser && invitedUser.role !== 'student') {
      const error = new Error('Email nay da thuoc ve tai khoan khong phai hoc sinh.');
      error.statusCode = 400;
      throw error;
    }

    const id = `INV${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
    const result = await pool.query(
      `insert into public.course_invitations
        (id, course_id, invited_email, invited_student_id, invited_by, status, expires_at)
       values ($1, $2, $3, $4, $5, 'pending', $6)
       returning *`,
      [
        id,
        courseId,
        input.invited_email,
        invitedUser?.id ?? null,
        teacherId,
        input.expires_at ?? null,
      ],
    );

    return mapInvitation(result.rows[0]);
  }

  async function listCourseInvitations(teacherId, courseId) {
    const pool = requireDatabase();
    await assertTeacherOwnsCourse(teacherId, courseId);

    const result = await pool.query(
      `select i.*, s.name as invited_student_name
       from public.course_invitations i
       left join public.app_users s on s.id = i.invited_student_id
       where i.course_id = $1
       order by i.created_at desc`,
      [courseId],
    );

    return result.rows.map(mapInvitation);
  }

  async function cancelInvitation(teacherId, courseId, invitationId) {
    const pool = requireDatabase();
    await assertTeacherOwnsCourse(teacherId, courseId);

    const result = await pool.query(
      `update public.course_invitations
       set status = 'cancelled'
       where id = $1 and course_id = $2 and status = 'pending'
       returning *`,
      [invitationId, courseId],
    );

    if (result.rows[0]) return mapInvitation(result.rows[0]);

    const existing = await pool.query(
      `select *
       from public.course_invitations
       where id = $1 and course_id = $2
       limit 1`,
      [invitationId, courseId],
    );

    if (!existing.rows[0]) return null;

    const error = new Error('Chi co the huy loi moi dang pending.');
    error.statusCode = 400;
    throw error;
  }

  async function listMyInvitations(student) {
    const pool = requireDatabase();
    const email = normalizeEmail(student.email);
    const result = await pool.query(
      `select
          i.*,
          c.code as course_code,
          c.name as course_name,
          c.description as course_description,
          c.room as course_room,
          c.start_date as course_start_date,
          c.end_date as course_end_date,
          c.status as course_status,
          t.id as teacher_id,
          t.name as teacher_name,
          t.email as teacher_email
       from public.course_invitations i
       join public.courses c on c.id = i.course_id
       join public.app_users t on t.id = i.invited_by
       where i.invited_email = $1
         and i.status = 'pending'
       order by i.created_at desc`,
      [email],
    );

    return result.rows.map(mapInvitationWithCourse);
  }

  async function acceptInvitation(student, invitationId) {
    const pool = requireDatabase();
    const client = await pool.connect();

    try {
      await client.query('begin');

      const invitationResult = await client.query(
        `select *
         from public.course_invitations
         where id = $1
         for update`,
        [invitationId],
      );
      const invitation = invitationResult.rows[0];
      validateStudentInvitationAccess(invitation, student, 'accept');

      const enrollmentId = `ENR${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
      const updatedInvitation = await client.query(
        `update public.course_invitations
         set status = 'accepted',
             accepted_at = now(),
             invited_student_id = coalesce(invited_student_id, $2)
         where id = $1
         returning *`,
        [invitationId, student.id],
      );

      const enrollment = await client.query(
        `insert into public.course_enrollments
          (id, course_id, student_id, invitation_id, status)
         values ($1, $2, $3, $4, 'active')
         returning *`,
        [enrollmentId, invitation.course_id, student.id, invitationId],
      );

      await client.query('commit');

      return {
        invitation: mapInvitation(updatedInvitation.rows[0]),
        enrollment: mapEnrollment(enrollment.rows[0]),
      };
    } catch (error) {
      await client.query('rollback').catch(() => {});
      if (error?.code === '23505') {
        const duplicate = new Error('Hoc sinh da duoc ghi danh vao khoa hoc nay.');
        duplicate.statusCode = 409;
        throw duplicate;
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async function declineInvitation(student, invitationId) {
    const pool = requireDatabase();

    const invitationResult = await pool.query(
      `select *
       from public.course_invitations
       where id = $1
       limit 1`,
      [invitationId],
    );
    const invitation = invitationResult.rows[0];
    validateStudentInvitationAccess(invitation, student, 'decline');

    const result = await pool.query(
      `update public.course_invitations
       set status = 'declined',
           declined_at = now(),
           invited_student_id = coalesce(invited_student_id, $2)
       where id = $1
       returning *`,
      [invitationId, student.id],
    );

    return mapInvitation(result.rows[0]);
  }

  async function findBlockingInvitationByEmail(courseId, email) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select *
       from public.course_invitations
       where course_id = $1
         and invited_email = $2
         and status in ('pending', 'accepted')
       order by created_at desc
       limit 1`,
      [courseId, email],
    );
    return result.rows[0] ? mapInvitation(result.rows[0]) : null;
  }

  async function findUserByEmail(email) {
    const pool = requireDatabase();
    const result = await pool.query(
      `select id, name, email, role
       from public.app_users
       where email = $1
       limit 1`,
      [normalizeEmail(email)],
    );
    return result.rows[0] ?? null;
  }

  return {
    createInvitation,
    listCourseInvitations,
    cancelInvitation,
    listMyInvitations,
    acceptInvitation,
    declineInvitation,
  };
}

function validateStudentInvitationAccess(invitation, student, action) {
  const studentEmail = normalizeEmail(student.email);
  if (!invitation) {
    const error = new Error('Khong tim thay loi moi.');
    error.statusCode = 404;
    throw error;
  }

  if (normalizeEmail(invitation.invited_email) !== studentEmail) {
    const error = new Error(`Ban khong co quyen ${action} loi moi nay.`);
    error.statusCode = 403;
    throw error;
  }

  if (invitation.invited_student_id && invitation.invited_student_id !== student.id) {
    const error = new Error(`Ban khong co quyen ${action} loi moi nay.`);
    error.statusCode = 403;
    throw error;
  }

  if (invitation.status !== 'pending') {
    const error = new Error('Chi co the thao tac voi loi moi dang pending.');
    error.statusCode = 400;
    throw error;
  }

  if (invitation.expires_at && new Date(invitation.expires_at).getTime() <= Date.now()) {
    const error = new Error('Loi moi da het han.');
    error.statusCode = 400;
    throw error;
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function mapInvitation(row) {
  return {
    id: row.id,
    course_id: row.course_id,
    invited_email: row.invited_email,
    invited_student_id: row.invited_student_id,
    invited_student_name: row.invited_student_name,
    invited_by: row.invited_by,
    status: row.status,
    accepted_at: row.accepted_at,
    declined_at: row.declined_at,
    expires_at: row.expires_at,
    created_at: row.created_at,
  };
}

function mapInvitationWithCourse(row) {
  return {
    ...mapInvitation(row),
    course: {
      id: row.course_id,
      code: row.course_code,
      name: row.course_name,
      description: row.course_description,
      room: row.course_room,
      start_date: formatDate(row.course_start_date),
      end_date: formatDate(row.course_end_date),
      status: row.course_status,
    },
    teacher: {
      id: row.teacher_id,
      name: row.teacher_name,
      email: row.teacher_email,
    },
  };
}

function mapEnrollment(row) {
  return {
    id: row.id,
    course_id: row.course_id,
    student_id: row.student_id,
    invitation_id: row.invitation_id,
    status: row.status,
    enrolled_at: row.enrolled_at,
    removed_at: row.removed_at,
    completed_at: row.completed_at,
  };
}

function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}
