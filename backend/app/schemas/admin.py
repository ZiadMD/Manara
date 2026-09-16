from pydantic import BaseModel

class ScreeningLevelCount(BaseModel):
    level: str  # low | medium | high | very_high
    count: int
    percentage: float

class DomainAggregate(BaseModel):
    domain: str
    domain_name_ar: str
    domain_name_en: str
    levels: dict[str, ScreeningLevelCount]
    mean_t_score: float | None = None

class DemographicsAggregate(BaseModel):
    by_stage: dict[str, int]
    by_gender: dict[str, int]
    by_school_type: dict[str, int]

class AdminMetricsResponse(BaseModel):
    total_assessments: int
    total_safety_flags: int
    open_safety_flags: int
    domains: dict[str, DomainAggregate]
    demographics: DemographicsAggregate
