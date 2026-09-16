import uuid
from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class ItemResponse(Base):
    __tablename__ = "item_responses"
    __table_args__ = (
        UniqueConstraint("assessment_id", "item_number", name="uq_assessment_item"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id: Mapped[str] = mapped_column(String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    item_number: Mapped[int] = mapped_column(Integer, nullable=False)  # 1–61
    response_value: Mapped[int] = mapped_column(Integer, nullable=False)  # 1–5

    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="item_responses")
