from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.deps import require_counselor
from app.db.session import get_db
from app.models.user import User
from app.models.assessment import Assessment
from app.models.safety_flag import SafetyFlag
from app.schemas.safety import SafetyFlagResponse, SafetyFlagStatusUpdate
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/safety-flags", tags=["safety-flags"])

@router.get("/", response_model=list[SafetyFlagResponse])
async def list_safety_flags(
    status_filter: str | None = None,
    current_user: User = Depends(require_counselor),
    session: AsyncSession = Depends(get_db)
):
    """
    List safety flags for counselor review.
    Sorted with newest open flags first.
    """
    stmt = (
        select(SafetyFlag)
        .join(Assessment, SafetyFlag.assessment_id == Assessment.id)
        .options(
            selectinload(SafetyFlag.assessment).selectinload(Assessment.student),
            selectinload(SafetyFlag.assessment).selectinload(Assessment.background_responses),
            selectinload(SafetyFlag.reviewer)
        )
        .order_by(desc(SafetyFlag.created_at))
    )
    if status_filter:
        stmt = stmt.where(SafetyFlag.status == status_filter)
    
    result = await session.execute(stmt)
    flags = result.scalars().all()

    responses: list[SafetyFlagResponse] = []
    for f in flags:
        student_name = f.assessment.student.name if f.assessment and f.assessment.student else "Student"
        student_id = f.assessment.student_id if f.assessment else ""
        stage = None
        if f.assessment:
            for bg in f.assessment.background_responses:
                if bg.field_name == "school_stage":
                    stage = bg.value
                    break

        responses.append(
            SafetyFlagResponse(
                id=f.id,
                assessment_id=f.assessment_id,
                student_id=student_id,
                student_name=student_name,
                student_stage=stage,
                triggered_by=f.triggered_by,
                status=f.status,
                notes=f.notes,
                created_at=f.created_at,
                reviewed_by=f.reviewer.name if f.reviewer else None,
                reviewed_at=f.reviewed_at
            )
        )
    return responses

@router.patch("/{flag_id}", response_model=SafetyFlagResponse)
async def update_safety_flag_status(
    flag_id: str,
    payload: SafetyFlagStatusUpdate,
    current_user: User = Depends(require_counselor),
    session: AsyncSession = Depends(get_db)
):
    """
    Counselor review, triage, escalation, or resolution of a safety flag.
    """
    stmt = (
        select(SafetyFlag)
        .options(
            selectinload(SafetyFlag.assessment).selectinload(Assessment.student),
            selectinload(SafetyFlag.reviewer)
        )
        .where(SafetyFlag.id == flag_id)
    )
    result = await session.execute(stmt)
    flag = result.scalar_one_or_none()

    if not flag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety flag not found")

    old_status = flag.status
    flag.status = payload.status
    if payload.notes is not None:
        flag.notes = payload.notes
    flag.reviewed_by = current_user.id
    flag.reviewed_at = datetime.now(timezone.utc)

    await session.commit()
    await session.refresh(flag)

    await log_audit_event(
        session=session,
        action="safety_flag_updated",
        actor_id=current_user.id,
        target_id=flag.id,
        details=f"Status changed from {old_status} to {payload.status}. Notes: {payload.notes}"
    )

    student_name = flag.assessment.student.name if flag.assessment and flag.assessment.student else "Student"
    student_id = flag.assessment.student_id if flag.assessment else ""

    return SafetyFlagResponse(
        id=flag.id,
        assessment_id=flag.assessment_id,
        student_id=student_id,
        student_name=student_name,
        triggered_by=flag.triggered_by,
        status=flag.status,
        notes=flag.notes,
        created_at=flag.created_at,
        reviewed_by=current_user.name,
        reviewed_at=flag.reviewed_at
    )
