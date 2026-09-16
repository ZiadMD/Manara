import json
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.deps import get_current_user, require_student, require_counselor
from app.db.session import get_db
from app.models.user import User
from app.models.assessment import Assessment
from app.models.background import BackgroundResponse
from app.models.item_response import ItemResponse
from app.models.domain_score import DomainScore
from app.models.safety_flag import SafetyFlag
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentReceipt,
    AssessmentSummary,
    AssessmentDetail,
    ItemDetailResponse
)
from app.schemas.scoring import DomainScoreResult
from app.schemas.safety import SafetyFlagResponse
from app.services.scoring_engine import (
    compute_all_domain_scores,
    score_item_response,
    REVERSE_SCORED_ITEMS,
    DOMAIN_CONFIGS
)
from app.services.safety_service import evaluate_safety_override, load_safety_config
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/assessments", tags=["assessments"])

# Load item dictionary for details
def get_items_dict() -> dict[int, dict]:
    from app.core.config import settings
    path = settings.DATA_DIR / "items_bank.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {item["number"]: item for item in data["items"]}

@router.post("/submit", response_model=AssessmentReceipt)
async def submit_assessment(
    payload: AssessmentCreate,
    current_user: User = Depends(require_student),
    session: AsyncSession = Depends(get_db)
):
    """
    Student intake submission endpoint.
    - Collects background fields and all 61 items
    - Executes deterministic scoring engine
    - Evaluates standalone safety override check
    - Persists all entities
    - Returns neutral, reassuring completion receipt (never reveals scores)
    """
    # 1. Validate items count and range
    items_map: dict[int, int] = {}
    for item in payload.item_responses:
        if item.item_number in items_map:
            raise HTTPException(
                status_code=422,
                detail=f"Duplicate response for item {item.item_number}"
            )
        items_map[item.item_number] = item.response_value

    if len(items_map) != 61:
        missing = [i for i in range(1, 62) if i not in items_map]
        raise HTTPException(
            status_code=422,
            detail=f"Assessment requires all 61 items. Missing items: {missing}"
        )

    # 2. Run deterministic scoring engine
    domain_scores_dict = compute_all_domain_scores(items_map)

    # 3. Run safety override check
    safety_config = load_safety_config()
    safety_result = evaluate_safety_override(items_map, safety_config)

    # 4. Create Assessment record
    assessment_status = "flagged" if safety_result.triggered else "completed"
    assessment = Assessment(
        student_id=current_user.id,
        status=assessment_status
    )
    session.add(assessment)
    await session.flush()  # assign assessment.id

    # 5. Persist background responses
    for bg in payload.background_responses:
        bg_record = BackgroundResponse(
            assessment_id=assessment.id,
            field_name=bg.field_name,
            value=bg.value
        )
        session.add(bg_record)

    # 6. Persist item responses
    for item_num, raw_val in items_map.items():
        item_record = ItemResponse(
            assessment_id=assessment.id,
            item_number=item_num,
            response_value=raw_val
        )
        session.add(item_record)

    # 7. Persist domain scores (never compute or store a total composite score!)
    for domain_key, res in domain_scores_dict.items():
        score_record = DomainScore(
            assessment_id=assessment.id,
            domain=res.domain,
            raw_score=res.raw_score,
            t_score=res.t_score,
            percentile=res.percentile,
            screening_level=res.screening_level
        )
        session.add(score_record)

    # 8. Persist safety flags if triggered
    if safety_result.triggered:
        for trigger in safety_result.triggers:
            flag = SafetyFlag(
                assessment_id=assessment.id,
                triggered_by=trigger.description,
                status="open"
            )
            session.add(flag)

    await session.commit()

    # 9. Audit log
    await log_audit_event(
        session=session,
        action="assessment_submitted",
        actor_id=current_user.id,
        target_id=assessment.id,
        details=f"Safety triggered: {safety_result.triggered}"
    )

    return AssessmentReceipt(
        assessment_id=assessment.id,
        status=assessment.status,
        submitted_at=assessment.submitted_at
    )

@router.get("/", response_model=list[AssessmentSummary])
async def list_assessments(
    current_user: User = Depends(require_counselor),
    session: AsyncSession = Depends(get_db)
):
    """
    Counselor list view of assessments.
    Enforces RBAC: only counselors can access this list.
    """
    stmt = (
        select(Assessment)
        .options(
            selectinload(Assessment.student),
            selectinload(Assessment.domain_scores),
            selectinload(Assessment.safety_flags),
            selectinload(Assessment.background_responses)
        )
        .order_by(desc(Assessment.submitted_at))
    )
    result = await session.execute(stmt)
    assessments = result.scalars().all()

    summaries: list[AssessmentSummary] = []
    level_weights = {"low": 1, "medium": 2, "high": 3, "very_high": 4}
    weight_to_level = {1: "low", 2: "medium", 3: "high", 4: "very_high"}

    for a in assessments:
        # Determine highest level across domains
        max_weight = 0
        for ds in a.domain_scores:
            w = level_weights.get(ds.screening_level, 0)
            if w > max_weight:
                max_weight = w
        highest_lvl = weight_to_level.get(max_weight)

        # Extract school stage if available in background responses
        stage = None
        for bg in a.background_responses:
            if bg.field_name == "school_stage":
                stage = bg.value
                break

        has_open_flags = any(sf.status == "open" for sf in a.safety_flags)

        summaries.append(
            AssessmentSummary(
                id=a.id,
                student_id=a.student_id,
                student_name=a.student.name if a.student else "Student",
                submitted_at=a.submitted_at,
                status=a.status,
                has_safety_flags=has_open_flags or (len(a.safety_flags) > 0),
                highest_screening_level=highest_lvl,
                school_stage=stage
            )
        )

    return summaries

@router.get("/{assessment_id}", response_model=AssessmentDetail)
async def get_assessment_detail(
    assessment_id: str,
    current_user: User = Depends(require_counselor),
    session: AsyncSession = Depends(get_db)
):
    """
    Counselor detailed report of an assessment.
    Includes multi-domain profile, percentiles, raw and T-scores, item breakdown, and safety flags.
    Strictly blocked for Students and Admins.
    """
    stmt = (
        select(Assessment)
        .options(
            selectinload(Assessment.student),
            selectinload(Assessment.domain_scores),
            selectinload(Assessment.safety_flags).selectinload(SafetyFlag.reviewer),
            selectinload(Assessment.background_responses),
            selectinload(Assessment.item_responses)
        )
        .where(Assessment.id == assessment_id)
    )
    result = await session.execute(stmt)
    assessment = result.scalar_one_or_none()

    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    # Map background responses
    bg_dict = {bg.field_name: bg.value for bg in assessment.background_responses}

    # Map domain scores
    items_dict = get_items_dict()
    domain_scores_map: dict[str, DomainScoreResult] = {}
    
    level_labels = {
        "low": ("منخفض", "Low"),
        "medium": ("متوسط", "Medium"),
        "high": ("مرتفع", "High"),
        "very_high": ("مرتفع جداً", "Very high")
    }

    for ds in assessment.domain_scores:
        lvl_ar, lvl_en = level_labels.get(ds.screening_level, (ds.screening_level, ds.screening_level))
        cfg = DOMAIN_CONFIGS.get(ds.domain, {})
        domain_scores_map[ds.domain] = DomainScoreResult(
            domain=ds.domain,
            raw_score=ds.raw_score,
            t_score=ds.t_score,
            percentile=ds.percentile,
            screening_level=ds.screening_level,
            screening_level_ar=lvl_ar,
            screening_level_en=lvl_en,
            domain_name_ar=cfg.get("name_ar", ds.domain),
            domain_name_en=cfg.get("name_en", ds.domain)
        )

    # Map item detail responses
    item_details: list[ItemDetailResponse] = []
    # Sort by item number 1..61
    sorted_items = sorted(assessment.item_responses, key=lambda x: x.item_number)
    for ir in sorted_items:
        meta = items_dict.get(ir.item_number, {})
        is_rev = ir.item_number in REVERSE_SCORED_ITEMS
        scored_val = score_item_response(ir.item_number, ir.response_value)
        item_details.append(
            ItemDetailResponse(
                item_number=ir.item_number,
                raw_response=ir.response_value,
                scored_value=scored_val,
                is_reversed=is_rev,
                text_ar=meta.get("text_ar", f"البند {ir.item_number}"),
                gloss_en=meta.get("gloss_en", ""),
                domain=meta.get("domain", "")
            )
        )

    # Map safety flags
    flags_list: list[SafetyFlagResponse] = []
    for sf in assessment.safety_flags:
        flags_list.append(
            SafetyFlagResponse(
                id=sf.id,
                assessment_id=sf.assessment_id,
                student_id=assessment.student_id,
                student_name=assessment.student.name if assessment.student else "Student",
                student_stage=bg_dict.get("school_stage"),
                triggered_by=sf.triggered_by,
                status=sf.status,
                notes=sf.notes,
                created_at=sf.created_at,
                reviewed_by=sf.reviewer.name if sf.reviewer else None,
                reviewed_at=sf.reviewed_at
            )
        )

    # Audit log
    await log_audit_event(
        session=session,
        action="assessment_viewed_by_counselor",
        actor_id=current_user.id,
        target_id=assessment.id,
        details=f"Viewed by {current_user.email}"
    )

    return AssessmentDetail(
        id=assessment.id,
        student_id=assessment.student_id,
        student_name=assessment.student.name if assessment.student else "Student",
        student_email=assessment.student.email if assessment.student else "",
        submitted_at=assessment.submitted_at,
        status=assessment.status,
        background_responses=bg_dict,
        domain_scores=domain_scores_map,
        safety_flags=flags_list,
        items=item_details
    )
