from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SafetyTrigger(BaseModel):
    item_number: int
    response_value: int
    item_text_ar: str
    description: str

class SafetyEvaluationResult(BaseModel):
    triggered: bool
    triggers: list[SafetyTrigger]

class SafetyConfigModel(BaseModel):
    direct_risk_items: list[int]
    trigger_threshold: int
    description: str | None = None
    items_detail: dict[str, str] | None = None

class SafetyConfigUpdate(BaseModel):
    direct_risk_items: list[int]
    trigger_threshold: int

class SafetyFlagResponse(BaseModel):
    id: str
    assessment_id: str
    student_id: str
    student_name: str
    student_stage: str | None = None
    triggered_by: str
    status: str
    notes: str | None = None
    created_at: datetime
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

class SafetyFlagStatusUpdate(BaseModel):
    status: str  # open | reviewed | escalated
    notes: str | None = None
