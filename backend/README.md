# SmartAttend Backend

Backend auth runs with local JSON storage by default and switches to Supabase/PostgreSQL when `DATABASE_URL` is configured.

## Backend structure

- `server.mjs`: boot server, wire middleware/services, hand off to router.
- `router.mjs`: compose route modules and handle fallback/OPTIONS.
- `routes/*Routes.mjs`: API routing by domain.
- `lib/database.mjs`: load `.env`, create PostgreSQL pool, ensure core tables/indexes.
- `lib/http.mjs`: JSON request/response helpers.
- `lib/apiErrors.mjs`: map database/service errors to HTTP responses.
- `middleware/authMiddleware.mjs`: require auth/role helpers.
- `services/*Service.mjs`: business logic theo domain nhu user, course, schedule, invitation, timetable, attendance.

## Local JSON mode

```bash
npm run api
```

The API seeds these demo accounts automatically:

- `admin@smartattend.vn` / `demo123`
- `teacher@smartattend.vn` / `demo123`
- `student@smartattend.vn` / `demo123`

## Supabase mode

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`.

Direct connection:

```text
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.zqtkwkmajuzxpmanwktj.supabase.co:5432/postgres
```

If your network is IPv4-only, use Supabase Dashboard > Project Settings > Database > Connection string > Session pooler instead of the direct host.

3. Start the backend:

```bash
npm run api
```

The server creates `public.app_users` if it does not exist and seeds the demo accounts on first start.

## API

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## Phase 2 auth middleware

Backend exposes reusable auth helpers in `backend/authMiddleware.mjs`:

- `requireAuth(req, res)`: validates Bearer token, loads the user from `app_users`, attaches `req.user`, returns 401 when missing/invalid.
- `requireRole(...roles)`: wraps `requireAuth` and returns 403 when the user role is not allowed.
- `requireTeacher(req, res)`: shortcut for teacher-only routes.
- `requireStudent(req, res)`: shortcut for student-only routes.

Manual checks:

```bash
curl http://127.0.0.1:4000/api/health

curl -X POST http://127.0.0.1:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"  TEACHER@SMARTATTEND.VN  \",\"password\":\"demo123\"}"

curl http://127.0.0.1:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Registration and login normalize email with `trim().toLowerCase()` before storing/querying `app_users`. Passwords are stored only as `password_hash`.

## Phase 3 course CRUD

All course endpoints require a teacher Bearer token. `teacher_id` is always taken from the authenticated user, never from request body.

```bash
# 1. Login as teacher and copy token
curl -X POST http://127.0.0.1:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"teacher@smartattend.vn\",\"password\":\"demo123\"}"

# 2. Create course
curl -X POST http://127.0.0.1:4000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"code\":\"CS301-2026\",\"name\":\"Computer Vision\",\"description\":\"FaceID attendance course\",\"room\":\"A101\",\"start_date\":\"2026-05-10\",\"end_date\":\"2026-08-10\",\"status\":\"draft\"}"

# 3. List teacher courses
curl http://127.0.0.1:4000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Get one course
curl http://127.0.0.1:4000/api/courses/COURSE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Update course
curl -X PATCH http://127.0.0.1:4000/api/courses/COURSE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"name\":\"Computer Vision Updated\",\"status\":\"active\"}"

# 6. Archive course
curl -X PATCH http://127.0.0.1:4000/api/courses/COURSE_ID/archive \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Phase 4 weekly schedule CRUD

All schedule endpoints require a teacher Bearer token. The teacher must own the course.

```bash
# Create weekly schedule
curl -X POST http://127.0.0.1:4000/api/courses/COURSE_ID/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"day_of_week\":2,\"start_time\":\"08:00\",\"end_time\":\"10:00\",\"room\":\"A101\"}"

# List schedules for a course
curl http://127.0.0.1:4000/api/courses/COURSE_ID/schedules \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update a schedule
curl -X PATCH http://127.0.0.1:4000/api/courses/COURSE_ID/schedules/SCHEDULE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"day_of_week\":3,\"start_time\":\"09:00\",\"end_time\":\"11:30\",\"room\":\"B202\"}"

# Delete a schedule
curl -X DELETE http://127.0.0.1:4000/api/courses/COURSE_ID/schedules/SCHEDULE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Validation rules:

- `day_of_week` must be from 1 to 7.
- `start_time` must be earlier than `end_time`.
- `room` is optional; when null, the app can fall back to `courses.room`.
- Archived courses reject schedule create/update/delete.

## Phase 5 invitations and enrollments

Teacher invitation endpoints:

```bash
# Invite a student by email
curl -X POST http://127.0.0.1:4000/api/courses/COURSE_ID/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -d "{\"email\":\"student@smartattend.vn\"}"

# List course invitations
curl http://127.0.0.1:4000/api/courses/COURSE_ID/invitations \
  -H "Authorization: Bearer TEACHER_TOKEN"

# Cancel a pending invitation
curl -X PATCH http://127.0.0.1:4000/api/courses/COURSE_ID/invitations/INVITATION_ID/cancel \
  -H "Authorization: Bearer TEACHER_TOKEN"
```

Student invitation endpoints:

```bash
# List pending invitations for the logged-in student email
curl http://127.0.0.1:4000/api/me/invitations \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Accept invitation and create course_enrollments in a transaction
curl -X POST http://127.0.0.1:4000/api/invitations/INVITATION_ID/accept \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Decline invitation without enrollment
curl -X POST http://127.0.0.1:4000/api/invitations/INVITATION_ID/decline \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

Manual checks:

- Invite an email that does not have an account yet.
- Invite an existing student email and verify `invited_student_id` is set.
- Invite the same email twice and expect `409`.
- Accept as the invited student and verify enrollment status `active`.
- Decline as the invited student and verify no enrollment is created.
- Try accepting with another student email and expect `403`.

## Phase 6 student timetable

Timetable is generated from active `course_enrollments`, active `courses`, and weekly `course_schedules`.

```bash
# Student must first accept an invitation.
curl http://127.0.0.1:4000/api/me/timetable \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

Expected shape:

```json
[
  {
    "courseId": "COURSE_ID",
    "courseCode": "CS301-2026",
    "courseName": "Software Engineering",
    "teacherId": "TEACHER_ID",
    "room": "A101",
    "startDate": "2026-05-01",
    "endDate": "2026-08-01",
    "schedules": [
      {
        "scheduleId": "SCHEDULE_ID",
        "dayOfWeek": 1,
        "startTime": "07:30",
        "endTime": "09:30",
        "room": "A101"
      }
    ]
  }
]
```

Manual checks:

- Student with no active enrollment gets `[]`.
- Course `archived` does not appear.
- Enrollment `removed` or `completed` does not appear.
- If `course_schedules.room` is null, the response uses `courses.room`.

## Phase 7 attendance sessions

Attendance sessions are teacher-only. This phase only opens/closes/cancels sessions; it does not include FaceID scans, manual attendance, or reports.

```bash
# Open an attendance session. scheduleId is optional.
curl -X POST http://127.0.0.1:4000/api/attendance/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -d "{\"courseId\":\"COURSE_ID\",\"scheduleId\":\"SCHEDULE_ID\",\"sessionDate\":\"2026-05-05\"}"

# List sessions for a teacher-owned course
curl http://127.0.0.1:4000/api/courses/COURSE_ID/attendance/sessions \
  -H "Authorization: Bearer TEACHER_TOKEN"

# Get one session
curl http://127.0.0.1:4000/api/attendance/sessions/SESSION_ID \
  -H "Authorization: Bearer TEACHER_TOKEN"

# Close an open session
curl -X POST http://127.0.0.1:4000/api/attendance/sessions/SESSION_ID/close \
  -H "Authorization: Bearer TEACHER_TOKEN"

# Cancel an open session
curl -X POST http://127.0.0.1:4000/api/attendance/sessions/SESSION_ID/cancel \
  -H "Authorization: Bearer TEACHER_TOKEN"
```

Manual checks:

- Open a valid session for an active teacher-owned course.
- Opening a session for an archived course returns `400`.
- A different teacher opening a session for the course returns `403`.
- Opening a second `open` session for the same course returns `409`.
- Closing an open session sets `status = closed` and `closed_at`.
- Closing/cancelling an already closed/cancelled session returns `400`.

## Phase 8 manual attendance

Manual attendance is teacher-only and works only for open sessions. It does not include FaceID or AI.

```bash
# Mark or update one enrolled student in an open session
curl -X POST http://127.0.0.1:4000/api/attendance/sessions/SESSION_ID/manual \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -d "{\"studentId\":\"STUDENT_ID\",\"status\":\"present\"}"

# Valid status values: present, late, rejected

# List all active enrolled students for a session.
# Students without a DB record are returned as computed absent.
curl http://127.0.0.1:4000/api/attendance/sessions/SESSION_ID/records \
  -H "Authorization: Bearer TEACHER_TOKEN"

# Course-level attendance grouped by session
curl http://127.0.0.1:4000/api/courses/COURSE_ID/attendance \
  -H "Authorization: Bearer TEACHER_TOKEN"
```

Manual checks:

- Mark an active enrolled student `present`.
- Mark the same student `late` and verify the existing record is updated.
- Try a student without active enrollment and expect `403`.
- Close the session, then try manual attendance and expect `400`.
- Verify students without records appear as `attendanceStatus = absent` in GET records, without inserting absent rows.
