# SmartAttend - FaceID Attendance System

SmartAttend là hệ thống điểm danh sinh viên theo lớp học, hỗ trợ giáo viên mở phiên điểm danh và sinh viên check-in bằng khuôn mặt qua webcam. Project hiện là bản MVP chạy local, ưu tiên demo ổn định trước với máy tính cá nhân và Supabase PostgreSQL.

## Tính năng chính

- Đăng nhập theo vai trò `admin`, `teacher`, `student`.
- Giáo viên quản lý lớp học, lịch học, lời mời sinh viên và phiên điểm danh.
- Sinh viên xem dashboard, đăng ký khuôn mặt và điểm danh bằng webcam.
- FaceID realtime dùng InsightFace `buffalo_s`: SCRFD detector, ArcFace recognizer, embedding 512D.
- Frontend scan theo kiểu Face ID, gửi frame mỗi chu kỳ và chỉ check-in sau khi match ổn định nhiều frame.
- Backend chặn điểm danh trùng: mỗi sinh viên chỉ check-in một lần trong một phiên.

## Kiến trúc

Project chạy 3 service local:

| Service | Port | Vai trò |
| --- | --- | --- |
| Vite React Frontend | `3000` | UI web, webcam, stability check |
| Node API | `4000` | Auth, courses, schedules, invitations, attendance sessions |
| FastAPI Face API | `8000` | Register face, recognize face, face check-in |

Vite proxy định tuyến:

- `/api/face/*` -> FastAPI `http://127.0.0.1:8000`
- `/api/attendance/check-in` -> FastAPI `http://127.0.0.1:8000`
- `/api/attendance/open-sessions` -> FastAPI `http://127.0.0.1:8000`
- Các `/api/*` còn lại -> Node API `http://127.0.0.1:4000`

## Công nghệ

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, Radix UI, lucide-react.
- Node backend: Node.js ESM, `pg`, PostgreSQL/Supabase.
- Face backend: FastAPI, InsightFace, ONNX Runtime CPU, OpenCV, NumPy.
- Database: Supabase PostgreSQL. Face embedding đang lưu JSONB/float array để dễ chạy MVP; có thể migrate sang pgvector `vector(512)` sau.

## Cấu trúc thư mục

```text
backend/
  app/                      FastAPI Face API
  routes/                   Node API routes
  services/                 Node business services
  schema.sql                Core schema reference
docs/uml/                   PlantUML diagrams
src/
  components/               React components
  pages/                    App pages
  services/                 Frontend API clients
supabase/migrations/        SQL migrations
FACE_RECOGNITION.md         Tài liệu FaceID MVP
PROJECT_DESIGN.md           Tài liệu kiến trúc và báo cáo
```

## Yêu cầu môi trường

- Node.js 20 hoặc mới hơn.
- Python 3.11 khuyến nghị.
- Supabase PostgreSQL hoặc PostgreSQL tương thích.
- Windows cần Microsoft C++ Build Tools nếu cài `insightface` báo lỗi `Microsoft Visual C++ 14.0 or greater is required`.

## Cài đặt

1. Cài Node dependencies:

```bash
npm install
```

2. Cài Python dependencies:

```bash
python -m pip install -r requirements.txt
```

Nếu cài trên Windows và muốn tránh cache ở ổ C, có thể đặt tạm cache/temp sang ổ D trước khi chạy `pip install`.

## Cấu hình môi trường

Copy `.env.example` thành `.env` và điền thông tin thật:

```bash
PORT=4000
FACE_API_PORT=8000
DATABASE_URL=postgresql://...
FACE_MATCH_THRESHOLD=0.6
FACE_MODEL_PACK=buffalo_s
FACE_DETECTION_SIZE=320,320
VITE_FACE_MATCH_THRESHOLD=0.6
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Ghi chú:

- `DATABASE_URL` là bắt buộc cho Face API vì service đọc/ghi `face_embeddings` và `attendance_records`.
- `FACE_MATCH_THRESHOLD=0.6` chỉ là giá trị khởi đầu, cần test thực tế theo webcam/ánh sáng.
- Không commit `.env` hoặc secret key.

## Database

Chạy migrations trong Supabase SQL Editor theo thứ tự:

```text
supabase/migrations/001_create_core_tables.sql
supabase/migrations/002_face_attendance.sql
```

Các bảng chính:

- `app_users`
- `courses`
- `course_schedules`
- `course_invitations`
- `course_enrollments`
- `attendance_sessions`
- `attendance_records`
- `face_embeddings`

## Chạy local

Mở 3 terminal ở thư mục project:

```bash
npm run api
```

```bash
npm run api:face
```

```bash
npm run dev -- --host 127.0.0.1 --port 3000
```

Sau đó mở:

- Frontend: http://127.0.0.1:3000
- Node API health: http://127.0.0.1:4000/api/health
- Face API health: http://127.0.0.1:8000/api/health

Lần đầu chạy Face API, InsightFace có thể mất thêm thời gian để tải/nạp model `buffalo_s`.

## Tài khoản demo

Khi chạy local JSON mode hoặc seed ban đầu, có các tài khoản demo:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@smartattend.vn` | `demo123` |
| Teacher | `teacher@smartattend.vn` | `demo123` |
| Student | `student@smartattend.vn` | `demo123` |

## Luồng test webcam

1. Đăng nhập giáo viên.
2. Tạo/mở lớp học và mở một phiên điểm danh.
3. Đăng nhập sinh viên.
4. Vào phần đăng ký khuôn mặt, bật webcam và lưu embedding.
5. Quay lại phần điểm danh sinh viên.
6. Đưa mặt vào khung oval, chờ hệ thống xác minh ổn định.
7. Khi cùng một `student_id` match liên tiếp đủ số frame và confidence trung bình đạt threshold, frontend gọi `POST /api/attendance/check-in`.
8. Nếu sinh viên đã điểm danh trong session đó, API trả trạng thái đã check-in thay vì tạo bản ghi trùng.

## Face API

Register face:

```bash
curl -X POST http://127.0.0.1:8000/api/face/register \
  -H "Content-Type: application/json" \
  -d "{\"student_id\":\"STUDENT_ID\",\"image\":\"data:image/jpeg;base64,...\"}"
```

Recognize frame:

```bash
curl -X POST http://127.0.0.1:8000/api/face/recognize \
  -H "Content-Type: application/json" \
  -d "{\"image\":\"data:image/jpeg;base64,...\",\"session_id\":\"SESSION_ID\"}"
```

Face check-in:

```bash
curl -X POST http://127.0.0.1:8000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -d "{\"student_id\":\"STUDENT_ID\",\"session_id\":\"SESSION_ID\",\"method\":\"face\",\"confidence\":0.82}"
```

## Lưu ý hiệu năng realtime

MVP không nhận diện mọi frame webcam. Frontend giảm lag bằng cách:

- Capture frame theo chu kỳ thay vì theo 30 FPS.
- Bỏ qua frame khi tab inactive hoặc đã check-in.
- Dùng stability check nhiều frame liên tiếp trước khi điểm danh.
- Cache/ngắt scan sau khi đã điểm danh thành công để tránh spam request.

Nếu máy vẫn lag, ưu tiên giảm `FACE_DETECTION_SIZE`, tăng khoảng cách capture frame, hoặc chuyển pipeline sang detect/track/recognize có cache theo khuôn mặt.

## Troubleshooting

- Face API đứng lâu khi start: lần đầu model `buffalo_s` đang được tải hoặc nạp ONNX.
- `DATABASE_URL is required`: kiểm tra file `.env` ở root project.
- `Microsoft Visual C++ 14.0 or greater is required`: cài Microsoft C++ Build Tools rồi cài lại `insightface`.
- Webcam không bật: kiểm tra quyền camera của browser và dùng `http://127.0.0.1:3000`.
- Không nhận diện được: đăng ký khuôn mặt lại với ánh sáng tốt, chỉ một mặt trong khung, rồi tune `FACE_MATCH_THRESHOLD`.

## Tài liệu liên quan

- [PROJECT_DESIGN.md](PROJECT_DESIGN.md): tổng hợp kiến trúc, API, database, luồng nghiệp vụ và nội dung báo cáo.
- [FACE_RECOGNITION.md](FACE_RECOGNITION.md): chi tiết FaceID MVP.
- [backend/README.md](backend/README.md): chi tiết Node API và backend domain.
- [docs/uml/README.md](docs/uml/README.md): danh sách sơ đồ PlantUML.
