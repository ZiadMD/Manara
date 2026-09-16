import json
from pathlib import Path
from typing import NamedTuple
from app.core.config import settings

REVERSE_SCORED_ITEMS = {50, 51, 52, 54, 55, 56, 58, 59, 60}

# Domain definitions and normative constants
DOMAIN_CONFIGS = {
    "anxiety": {
        "name_ar": "القلق",
        "name_en": "Anxiety",
        "item_start": 1,
        "item_end": 13,
        "count": 13,
        "mean": 32.56,
        "sd": 12.40,
    },
    "depression": {
        "name_ar": "الاكتئاب",
        "name_en": "Depression",
        "item_start": 14,
        "item_end": 27,
        "count": 14,
        "mean": 30.70,
        "sd": 12.96,
    },
    "behavior": {
        "name_ar": "مشكلات السلوك والانضباط",
        "name_en": "Behavior and discipline problems",
        "item_start": 28,
        "item_end": 39,
        "count": 12,
        "mean": 21.26,
        "sd": 8.85,
    },
    "self_harm": {
        "name_ar": "إيذاء الذات/الأفكار الانتحارية",
        "name_en": "Self-harm / suicidal ideation",
        "item_start": 40,
        "item_end": 49,
        "count": 10,
        "mean": 17.94,
        "sd": 9.34,
    },
    "school_maladjustment": {
        "name_ar": "ضعف التكيف المدرسي",
        "name_en": "School maladjustment",
        "item_start": 50,
        "item_end": 61,
        "count": 12,
        "mean": 28.09,
        "sd": 10.30,
    },
}

class DomainScoringResult(NamedTuple):
    domain: str
    raw_score: int
    t_score: float
    percentile: float | None
    screening_level: str
    screening_level_ar: str
    screening_level_en: str
    domain_name_ar: str
    domain_name_en: str

# Cache percentiles table from disk
_PERCENTILES_TABLE: dict[str, dict[int, float]] | None = None

def load_percentiles_table() -> dict[str, dict[int, float]]:
    global _PERCENTILES_TABLE
    if _PERCENTILES_TABLE is not None:
        return _PERCENTILES_TABLE
    
    path = settings.DATA_DIR / "percentiles.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    table: dict[str, dict[int, float]] = {}
    for domain, scores in data.items():
        table[domain] = {int(k): float(v) for k, v in scores.items()}
    
    _PERCENTILES_TABLE = table
    return _PERCENTILES_TABLE

def lookup_percentile(domain: str, raw_score: int) -> float | None:
    table = load_percentiles_table().get(domain, {})
    if raw_score in table:
        return table[raw_score]
    
    # If not in table (e.g. unobserved cases in reference sample like 54 or 58 in behavior),
    # interpolate between adjacent keys
    sorted_keys = sorted(table.keys())
    if not sorted_keys:
        return None
    if raw_score < sorted_keys[0]:
        return table[sorted_keys[0]]
    if raw_score > sorted_keys[-1]:
        return table[sorted_keys[-1]]
    
    # Linear interpolation
    lower_k = max(k for k in sorted_keys if k < raw_score)
    upper_k = min(k for k in sorted_keys if k > raw_score)
    lower_p = table[lower_k]
    upper_p = table[upper_k]
    interpolated = lower_p + (raw_score - lower_k) / (upper_k - lower_k) * (upper_p - lower_p)
    return round(interpolated, 1)

def get_screening_level(t_score: float) -> tuple[str, str, str]:
    """
    Screening levels, from the T-score:
    < 60: Low
    60 – < 65: Medium
    65 – < 70: High
    >= 70: Very high
    """
    if t_score < 60.0:
        return "low", "منخفض", "Low"
    elif t_score < 65.0:
        return "medium", "متوسط", "Medium"
    elif t_score < 70.0:
        return "high", "مرتفع", "High"
    else:
        return "very_high", "مرتفع جداً", "Very high"

def score_item_response(item_number: int, raw_value: int) -> int:
    """
    Apply reverse-scoring rule:
    Only items 50, 51, 52, 54, 55, 56, 58, 59, 60 are reverse-scored.
    reversed_value = 6 - raw_response
    """
    if item_number in REVERSE_SCORED_ITEMS:
        return 6 - raw_value
    return raw_value

def calculate_single_domain_score(domain_key: str, responses: dict[int, int]) -> DomainScoringResult:
    """
    Pure function to calculate scores for a single domain.
    responses: dict mapping item_number (1..61) -> raw response value (1..5)
    """
    if domain_key not in DOMAIN_CONFIGS:
        raise ValueError(f"Unknown domain: {domain_key}")
    
    config = DOMAIN_CONFIGS[domain_key]
    item_start = config["item_start"]
    item_end = config["item_end"]
    
    raw_sum = 0
    for num in range(item_start, item_end + 1):
        if num not in responses:
            raise ValueError(f"Missing response for item {num} in domain {domain_key}")
        raw_val = responses[num]
        if raw_val < 1 or raw_val > 5:
            raise ValueError(f"Invalid response value {raw_val} for item {num}; must be 1..5")
        scored_val = score_item_response(num, raw_val)
        raw_sum += scored_val
    
    # T = 50 + 10 * (X - mean) / sd
    mean = config["mean"]
    sd = config["sd"]
    t_score = 50.0 + 10.0 * (raw_sum - mean) / sd
    t_score_rounded = round(t_score, 2)
    
    percentile = lookup_percentile(domain_key, raw_sum)
    lvl_key, lvl_ar, lvl_en = get_screening_level(t_score)
    
    return DomainScoringResult(
        domain=domain_key,
        raw_score=raw_sum,
        t_score=t_score_rounded,
        percentile=percentile,
        screening_level=lvl_key,
        screening_level_ar=lvl_ar,
        screening_level_en=lvl_en,
        domain_name_ar=config["name_ar"],
        domain_name_en=config["name_en"]
    )

def compute_all_domain_scores(responses: dict[int, int]) -> dict[str, DomainScoringResult]:
    """
    Computes deterministic scores for all 5 domains.
    Strictly avoids any total/composite score across domains.
    """
    results: dict[str, DomainScoringResult] = {}
    for domain_key in DOMAIN_CONFIGS:
        results[domain_key] = calculate_single_domain_score(domain_key, responses)
    return results
