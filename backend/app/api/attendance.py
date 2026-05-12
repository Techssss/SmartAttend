from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


class FaceCheckInRequest(BaseModel):
    student_id: str
    session_id: str
    method: str = Field(default="face")
    confidence: float


@router.post("/check-in")
async def check_in(payload: FaceCheckInRequest, request: Request):
    service = request.app.state.attendance_service
    try:
        return service.check_in(
            student_id=payload.student_id,
            session_id=payload.session_id,
            method=payload.method,
            confidence=payload.confidence,
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/open-sessions")
async def list_open_sessions(request: Request, student_id: str = Query(...)):
    service = request.app.state.attendance_service
    try:
        return service.list_open_sessions_for_student(student_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
