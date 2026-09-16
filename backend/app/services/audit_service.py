from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog

async def log_audit_event(
    session: AsyncSession,
    action: str,
    actor_id: str | None = None,
    target_id: str | None = None,
    details: str | None = None
) -> AuditLog:
    audit = AuditLog(
        actor_id=actor_id,
        action=action,
        target_id=target_id,
        details=details
    )
    session.add(audit)
    await session.commit()
    return audit
