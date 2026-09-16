from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.scoring import DomainScoreResult
from app.schemas.safety import SafetyFlagResponse

class ItemAnswer(BaseModel):
    item_number: int = Field(..., ge=1, le=61)
    response_value: int = Field(..., ge=1, le=5)

class BackgroundAnswer(BaseModel):
    field_name: str
    value: str

class AssessmentCreate(BaseModel):
    background_responses: list[BackgroundAnswer]
    item_responses: list[ItemAnswer]

class AssessmentReceipt(BaseModel):
    assessment_id: str
    status: str
    submitted_at: datetime
    message_ar: str = "شكرًا لك على إكمال الاستبيان. تم استلام إجاباتك بنجاح."
    message_en: str = "Thank you for completing the questionnaire. Your responses have been successfully received."

class AssessmentSummary(BaseModel):
    id: str
    student_id: str
    student_name: str
    submitted_at: datetime
    status: str
    has_safety_flags: bool
    highest_screening_level: str | None = None
    school_stage: str | None = None

class ItemDetailResponse(BaseModel):
    item_number: int
    raw_response: int
    scored_value: int
    is_reversed: bool
    text_ar: str
    gloss_en: str
    domain: str

class AssessmentDetail(BaseModel):
    id: str
    student_id: str
    student_name: str
    student_email: str
    submitted_at: datetime
    status: str
    background_responses: dict[str, str]
    domain_scores: dict[str, DomainScoreResult]
    safety_flags: list[SafetyFlagResponse]
    items: list[ItemDetailResponse]
