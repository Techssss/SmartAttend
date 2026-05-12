# Cau truc co so du lieu

He thong su dung PostgreSQL/Supabase. Hien tai backend da tao va dung bang `app_users` cho dang nhap/dang ky. Cac bang ben duoi la schema nang cap cho workflow: giao vien tao khoa hoc, moi hoc sinh bang email, hoc sinh chap nhan loi moi va xem thoi khoa bieu.

## Tong quan bang

| Bang | Muc dich |
| --- | --- |
| `app_users` | Luu tai khoan admin, giao vien, hoc sinh. |
| `courses` | Luu khoa hoc/lop hoc do giao vien tao. |
| `course_schedules` | Luu lich hoc hang tuan cua khoa hoc. |
| `course_invitations` | Luu loi moi hoc sinh vao khoa hoc bang email. |
| `course_enrollments` | Luu hoc sinh da chap nhan tham gia khoa hoc. |
| `attendance_sessions` | Luu phien diem danh cua mot buoi hoc. |
| `attendance_records` | Luu ket qua diem danh tung hoc sinh. |
| `face_embeddings` | Luu vector khuon mat cua hoc sinh. |

## `app_users`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
| --- | --- | --- | --- |
| `id` | `text` | Primary key | Ma nguoi dung. |
| `name` | `text` | Not null | Ho ten. |
| `email` | `text` | Not null, unique | Email dang nhap va email nhan loi moi. |
| `role` | `text` | Not null, check | `admin`, `teacher`, `student`. |
| `class` | `text` | Nullable | Lop hanh chinh cua hoc sinh neu co. |
| `department` | `text` | Nullable | Khoa/bo mon cua giao vien. |
| `avatar` | `text` | Nullable | Anh dai dien. |
| `password_hash` | `text` | Not null | Mat khau da hash. |
| `created_at` | `timestamptz` | Default `now()` | Thoi diem tao. |

## `courses`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
| --- | --- | --- | --- |
| `id` | `text` | Primary key | Ma khoa hoc. |
| `teacher_id` | `text` | FK -> `app_users.id` | Giao vien so huu khoa hoc. |
| `code` | `text` | Unique, not null | Ma khoa hoc. |
| `name` | `text` | Not null | Ten khoa hoc. |
| `description` | `text` | Nullable | Mo ta khoa hoc. |
| `start_date` | `date` | Not null | Ngay bat dau. |
| `end_date` | `date` | Not null | Ngay ket thuc. |
| `room` | `text` | Nullable | Phong hoc mac dinh. |
| `status` | `text` | Check | `draft`, `active`, `archived`. |
| `created_at` | `timestamptz` | Default `now()` | Thoi diem tao. |

## `course_schedules`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
| --- | --- | --- | --- |
| `id` | `text` | Primary key | Ma lich hoc. |
| `course_id` | `text` | FK -> `courses.id` | Khoa hoc. |
| `day_of_week` | `int` | Check 1-7 | Thu trong tuan, 1 = Monday. |
| `start_time` | `time` | Not null | Gio bat dau. |
| `end_time` | `time` | Not null | Gio ket thuc. |
| `room` | `text` | Nullable | Phong hoc cua buoi hoc. |

## `course_invitations`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
| --- | --- | --- | --- |
| `id` | `text` | Primary key | Ma loi moi. |
| `course_id` | `text` | FK -> `courses.id` | Khoa hoc duoc moi vao. |
| `invited_email` | `text` | Not null | Email hoc sinh duoc moi. |
| `invited_student_id` | `text` | FK -> `app_users.id`, nullable | Hoc sinh neu email da ton tai. |
| `invited_by` | `text` | FK -> `app_users.id` | Giao vien gui loi moi. |
| `status` | `text` | Check | `pending`, `accepted`, `declined`, `cancelled`, `expired`. |
| `accepted_at` | `timestamptz` | Nullable | Thoi diem chap nhan. |
| `declined_at` | `timestamptz` | Nullable | Thoi diem tu choi. |
| `created_at` | `timestamptz` | Default `now()` | Thoi diem tao. |

## `course_enrollments`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
| --- | --- | --- | --- |
| `id` | `text` | Primary key | Ma ghi danh. |
| `course_id` | `text` | FK -> `courses.id` | Khoa hoc. |
| `student_id` | `text` | FK -> `app_users.id` | Hoc sinh. |
| `invitation_id` | `text` | FK -> `course_invitations.id`, nullable | Loi moi tao ra enrollment. |
| `status` | `text` | Check | `active`, `removed`, `completed`. |
| `enrolled_at` | `timestamptz` | Default `now()` | Thoi diem tham gia. |

## `attendance_sessions`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
| --- | --- | --- | --- |
| `id` | `text` | Primary key | Ma phien diem danh. |
| `course_id` | `text` | FK -> `courses.id` | Khoa hoc. |
| `teacher_id` | `text` | FK -> `app_users.id` | Giao vien mo phien. |
| `opened_at` | `timestamptz` | Default `now()` | Thoi diem mo. |
| `closed_at` | `timestamptz` | Nullable | Thoi diem dong. |
| `status` | `text` | Check | `open`, `closed`, `cancelled`. |

## `attendance_records`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
| --- | --- | --- | --- |
| `id` | `text` | Primary key | Ma ban ghi. |
| `session_id` | `text` | FK -> `attendance_sessions.id` | Phien diem danh. |
| `course_id` | `text` | FK -> `courses.id` | Khoa hoc. |
| `student_id` | `text` | FK -> `app_users.id` | Hoc sinh. |
| `scan_time` | `timestamptz` | Default `now()` | Thoi diem quet. |
| `status` | `text` | Check | `present`, `late`, `absent`, `manual`. |
| `method` | `text` | Check | `face`, `manual`. |
| `confidence` | `float` | Nullable | Do tin cay nhan dien. |
| `liveness_score` | `float` | Nullable | Diem chong gia mao. |

## `face_embeddings`

| Cot | Kieu du lieu | Rang buoc | Mo ta |
| --- | --- | --- | --- |
| `id` | `text` | Primary key | Ma vector. |
| `student_id` | `text` | FK -> `app_users.id` | Hoc sinh so huu vector. |
| `embedding` | `text` | Not null | Vector dang JSON/text; co the nang cap thanh `vector(512)`. |
| `image_url` | `text` | Nullable | URL anh minh chung. |
| `created_at` | `timestamptz` | Default `now()` | Thoi diem tao. |

## Quan he chinh

- Mot giao vien co nhieu `courses`.
- Mot `course` co nhieu `course_schedules`.
- Mot `course` co nhieu `course_invitations`.
- Hoc sinh chi vao `course_enrollments` sau khi chap nhan loi moi.
- Thoi khoa bieu hoc sinh duoc lay tu `course_enrollments` join `courses` va `course_schedules`.
- Diem danh chi hop le voi hoc sinh co enrollment `active`.
