from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.models.assessment import Assessment
from app.models.background import BackgroundResponse
from app.models.domain_score import DomainScore
from app.models.safety_flag import SafetyFlag
from app.schemas.admin import (
    AdminMetricsResponse,
    DomainAggregate,
    ScreeningLevelCount,
    DemographicsAggregate
)
from app.schemas.safety import SafetyConfigModel, SafetyConfigUpdate
from app.services.safety_service import load_safety_config, save_safety_config
from app.services.scoring_engine import DOMAIN_CONFIGS
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/metrics", response_model=AdminMetricsResponse)
async def get_deidentified_metrics(
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """
    Admin aggregate metrics view:
    - Strictly de-identified
    - Domain level counts and percentages
    - Demographics distributions
    - Zero individual psychological data or student identifiers
    """
    # 1. Total assessments
    total_assessments_res = await session.execute(select(func.count(Assessment.id)))
    total_assessments = total_assessments_res.scalar_one() or 0

    # 2. Safety flags counts
    total_flags_res = await session.execute(select(func.count(SafetyFlag.id)))
    total_flags = total_flags_res.scalar_one() or 0

    open_flags_res = await session.execute(
        select(func.count(SafetyFlag.id)).where(SafetyFlag.status == "open")
    )
    open_flags = open_flags_res.scalar_one() or 0

    # 3. Domain score distribution
    # Group by domain and screening_level
    stmt_ds = (
        select(
            DomainScore.domain,
            DomainScore.screening_level,
            func.count(DomainScore.id),
            func.avg(DomainScore.t_score)
        )
        .group_by(DomainScore.domain, DomainScore.screening_level)
    )
    ds_res = await session.execute(stmt_ds)
    
    # Structure domain aggregate data
    domain_counts = defaultdict(lambda: defaultdict(int))
    domain_t_sums = defaultdict(list)
    for dom, lvl, count, avg_t in ds_res.all():
        domain_counts[dom][lvl] = count
        if avg_t is not None:
            domain_t_sums[dom].append(avg_t)

    domains_result: dict[str, DomainAggregate] = {}
    level_keys = ["low", "medium", "high", "very_high"]

    for dom_key, meta in DOMAIN_CONFIGS.items():
        total_for_domain = sum(domain_counts[dom_key].values())
        levels_map: dict[str, ScreeningLevelCount] = {}
        for l_key in level_keys:
            cnt = domain_counts[dom_key][l_key]
            pct = round((cnt / total_for_domain * 100.0), 1) if total_for_domain > 0 else 0.0
            levels_map[l_key] = ScreeningLevelCount(
                level=l_key,
                count=cnt,
                percentage=pct
            )
        
        avg_t_val = round(sum(domain_t_sums[dom_key]) / len(domain_t_sums[dom_key]), 2) if domain_t_sums[dom_key] else None

        domains_result[dom_key] = DomainAggregate(
            domain=dom_key,
            domain_name_ar=meta["name_ar"],
            domain_name_en=meta["name_en"],
            levels=levels_map,
            mean_t_score=avg_t_val
        )

    # 4. Demographics aggregation
    stmt_bg = (
        select(BackgroundResponse.field_name, BackgroundResponse.value, func.count(BackgroundResponse.id))
        .group_by(BackgroundResponse.field_name, BackgroundResponse.value)
    )
    bg_res = await session.execute(stmt_bg)
    
    by_stage = defaultdict(int)
    by_gender = defaultdict(int)
    by_school_type = defaultdict(int)

    for field, val, count in bg_res.all():
        if field == "school_stage":
            by_stage[val] = count
        elif field == "gender":
            by_gender[val] = count
        elif field == "school_type":
            by_school_type[val] = count

    return AdminMetricsResponse(
        total_assessments=total_assessments,
        total_safety_flags=total_flags,
        open_safety_flags=open_flags,
        domains=domains_result,
        demographics=DemographicsAggregate(
            by_stage=dict(by_stage),
            by_gender=dict(by_gender),
            by_school_type=dict(by_school_type)
        )
    )

@router.get("/safety-config", response_model=SafetyConfigModel)
async def get_safety_config(current_user: User = Depends(require_admin)):
    """Retrieve the current safety override candidate items and threshold."""
    return load_safety_config()

@router.put("/safety-config", response_model=SafetyConfigModel)
async def update_safety_config(
    payload: SafetyConfigUpdate,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db)
):
    """
    Update safety override candidate items and threshold.
    Allows adjusting candidate items (e.g. 42, 43, 45, 46, 48, 49) without code changes.
    """
    current_cfg = load_safety_config()
    current_cfg.direct_risk_items = sorted(list(set(payload.direct_risk_items)))
    current_cfg.trigger_threshold = payload.trigger_threshold

    save_safety_config(current_cfg)

    await log_audit_event(
        session=session,
        action="safety_config_updated",
        actor_id=current_user.id,
        details=f"Items: {current_cfg.direct_risk_items}, Threshold: {current_cfg.trigger_threshold}"
    )

    return current_cfg
