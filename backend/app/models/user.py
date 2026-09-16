import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # student | counselor | admin
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assessments: Mapped[list["Assessment"]] = relationship("Assessment", back_populates="student", cascade="all, delete-orphan")
