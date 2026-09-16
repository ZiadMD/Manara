import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    target_id: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
