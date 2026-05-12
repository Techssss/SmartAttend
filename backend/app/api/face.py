from fastapi import APIRouter, HTTPException, Request

from app.utils.image_utils import ImageDecodeError, image_from_request

router = APIRouter(prefix="/api/face", tags=["face"])


@router.post("/register")
async def register_face(request: Request):
    service = request.app.state.face_service
    try:
        image, fields = await image_from_request(request)
        student_id = str(fields.get("student_id") or fields.get("studentId") or "").strip()
        if not student_id:
            raise HTTPException(status_code=400, detail="student_id is required.")
        return service.register_face(student_id, image)
    except ImageDecodeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LookupError as exc:
        reason = str(exc)
        status = 404 if reason == "STUDENT_NOT_FOUND" else 422
        raise HTTPException(status_code=status, detail=reason) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/recognize")
async def recognize_face(request: Request):
    service = request.app.state.face_service
    try:
        image, _ = await image_from_request(request)
        return service.recognize_face(image)
    except ImageDecodeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
