import json
from pathlib import Path
from app.core.config import settings
from app.schemas.safety import SafetyTrigger, SafetyEvaluationResult, SafetyConfigModel

_SAFETY_CONFIG: SafetyConfigModel | None = None

def get_safety_config_path() -> Path:
    return settings.DATA_DIR / "safety_config.json"

def load_safety_config() -> SafetyConfigModel:
    global _SAFETY_CONFIG
    path = get_safety_config_path()
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            _SAFETY_CONFIG = SafetyConfigModel(**data)
            return _SAFETY_CONFIG
    
    # Default fallback
    default_config = SafetyConfigModel(
        direct_risk_items=[42, 43, 45, 46, 48, 49],
        trigger_threshold=4,
        description="Triggered when any direct-risk item response >= threshold"
    )
    return default_config

def save_safety_config(config: SafetyConfigModel) -> None:
    global _SAFETY_CONFIG
    path = get_safety_config_path()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(config.model_dump(), f, ensure_ascii=False, indent=2)
    _SAFETY_CONFIG = config

def evaluate_safety_override(
    responses: dict[int, int],
    config: SafetyConfigModel | None = None
) -> SafetyEvaluationResult:
    """
    Standalone safety override evaluator.
    Independent of T-score. A case is flagged as special-priority
    whenever a direct-risk item response is >= threshold.
    """
    if config is None:
        config = load_safety_config()
    
    triggers: list[SafetyTrigger] = []
    items_detail = config.items_detail or {}

    scale_labels = {
        1: ("أبدًا", "Never"),
        2: ("نادرًا", "Rarely"),
        3: ("أحيانًا", "Sometimes"),
        4: ("كثيرًا", "Often"),
        5: ("دائمًا", "Always")
    }

    for item_num in config.direct_risk_items:
        val = responses.get(item_num)
        if val is not None and val >= config.trigger_threshold:
            val_label_ar, val_label_en = scale_labels.get(val, (str(val), str(val)))
            item_text = items_detail.get(str(item_num), f"البند {item_num}")
            desc = (
                f"إجابة مرتفعة على البند المباشر {item_num}: '{item_text}' "
                f"بقيمة {val} ({val_label_ar})"
            )
            triggers.append(
                SafetyTrigger(
                    item_number=item_num,
                    response_value=val,
                    item_text_ar=item_text,
                    description=desc
                )
            )

    return SafetyEvaluationResult(
        triggered=len(triggers) > 0,
        triggers=triggers
    )
