import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class BackgroundResponse(Base):
    __tablename__ = "background_responses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id: Mapped[str] = mapped_column(String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    value: Mapped[str] = mapped_column(String(255), nullable=False)

    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="background_responses")
