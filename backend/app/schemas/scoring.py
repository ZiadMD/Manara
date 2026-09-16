from pydantic import BaseModel

class DomainScoreResult(BaseModel):
    domain: str
    raw_score: int
    t_score: float
    percentile: float | None
    screening_level: str  # low | medium | high | very_high
    screening_level_ar: str
    screening_level_en: str
    domain_name_ar: str
    domain_name_en: str

class ScoringOutput(BaseModel):
    domain_scores: dict[str, DomainScoreResult]
