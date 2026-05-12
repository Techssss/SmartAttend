# SmartAttend Face Recognition MVP

## Architecture

- Existing Node API remains on `http://127.0.0.1:4000` for auth, courses, sessions, and manual attendance.
- FastAPI Face API runs on `http://127.0.0.1:8000` for:
  - `POST /api/face/register`
  - `POST /api/face/recognize`
  - `POST /api/attendance/check-in`
- Vite proxies `/api/face/*` and `/api/attendance/check-in` to FastAPI, and all other `/api/*` calls to the existing Node API.

This keeps the current app working while adding the InsightFace backend requested for the MVP.

## Model

- InsightFace model pack: `buffalo_s`
- Detector: SCRFD
- Recognizer: ArcFace
- Embedding: normalized 512D vector
- Runtime: CPU with `onnxruntime`
- No custom training and no YOLO for face recognition

`FACE_MATCH_THRESHOLD` defaults to `0.6`. This is only a starting point; tune it with real webcam tests and your actual lighting/camera setup.

## Database

Run `supabase/migrations/002_face_attendance.sql` in Supabase SQL editor.

Embeddings are stored in `face_embeddings.embedding_json` as JSONB for the MVP. If pgvector is enabled later, migrate that column to `vector(512)` and move nearest-neighbor search into PostgreSQL.

## Local Run

1. Configure `.env`:

```bash
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
FACE_MATCH_THRESHOLD=0.6
FACE_MODEL_PACK=buffalo_s
FACE_DETECTION_SIZE=320,320
VITE_FACE_MATCH_THRESHOLD=0.6
```

2. Install Python dependencies:

```bash
python -m pip install -r requirements.txt
```

On Windows, `insightface` may require Microsoft C++ Build Tools because it builds a native extension. Install "Microsoft C++ Build Tools" if pip fails with `Microsoft Visual C++ 14.0 or greater is required`.

3. Start the services:

```bash
npm run api
npm run api:face
npm run dev
```

4. Open `http://127.0.0.1:3000`, log in as teacher, open an attendance session, and click `Bat dau quet`.

## API Test

Register one face:

```bash
curl -X POST http://127.0.0.1:8000/api/face/register \
  -H "Content-Type: application/json" \
  -d "{\"student_id\":\"STUDENT_ID\",\"image\":\"data:image/jpeg;base64,...\"}"
```

Recognize one frame:

```bash
curl -X POST http://127.0.0.1:8000/api/face/recognize \
  -H "Content-Type: application/json" \
  -d "{\"image\":\"data:image/jpeg;base64,...\"}"
```

Check in after frontend stability passes:

```bash
curl -X POST http://127.0.0.1:8000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -d "{\"student_id\":\"STUDENT_ID\",\"session_id\":\"SESSION_ID\",\"method\":\"face\",\"confidence\":0.82}"
```
