import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class SafetyFlag(Base):
    __tablename__ = "safety_flags"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id: Mapped[str] = mapped_column(String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    triggered_by: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="open", index=True)  # open | reviewed | escalated
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    reviewed_by: Mapped[str | None] = mapped_column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="safety_flags")
    reviewer: Mapped["User | None"] = relationship("User", foreign_keys=[reviewed_by])
