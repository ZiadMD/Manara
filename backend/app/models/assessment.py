import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    status: Mapped[str] = mapped_column(String(50), default="completed", index=True)  # completed | flagged

    student: Mapped["User"] = relationship("User", back_populates="assessments")
    background_responses: Mapped[list["BackgroundResponse"]] = relationship("BackgroundResponse", back_populates="assessment", cascade="all, delete-orphan")
    item_responses: Mapped[list["ItemResponse"]] = relationship("ItemResponse", back_populates="assessment", cascade="all, delete-orphan")
    domain_scores: Mapped[list["DomainScore"]] = relationship("DomainScore", back_populates="assessment", cascade="all, delete-orphan")
    safety_flags: Mapped[list["SafetyFlag"]] = relationship("SafetyFlag", back_populates="assessment", cascade="all, delete-orphan")
