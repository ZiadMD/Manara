import uuid
from sqlalchemy import String, Integer, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class DomainScore(Base):
    __tablename__ = "domain_scores"
    __table_args__ = (
        UniqueConstraint("assessment_id", "domain", name="uq_assessment_domain"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id: Mapped[str] = mapped_column(String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    domain: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    raw_score: Mapped[int] = mapped_column(Integer, nullable=False)
    t_score: Mapped[float] = mapped_column(Float, nullable=False)
    percentile: Mapped[float | None] = mapped_column(Float, nullable=True)
    screening_level: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # low | medium | high | very_high

    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="domain_scores")
