import pytest
from app.schemas.safety import SafetyConfigModel
from app.services.safety_service import evaluate_safety_override
from app.services.scoring_engine import calculate_single_domain_score

def test_safety_override_triggered_when_t_score_is_low():
    """
    Verify Section 8:
    Safety override is independent of the domain T-score.
    A case is flagged as special-priority even if the T-score doesn't reach 'very high'.
    """
    # 9 items in self-harm with value 1, only item 42 with value 4
    # Raw sum = 9*1 + 4 = 13.
    # T = 50 + 10 * (13 - 17.94) / 9.34 = 44.71 (Low level)
    responses = {i: 1 for i in range(40, 50)}
    responses[42] = 4

    sh_score = calculate_single_domain_score("self_harm", responses)
    assert sh_score.t_score < 60.0
    assert sh_score.screening_level == "low"

    config = SafetyConfigModel(
        direct_risk_items=[42, 43, 45, 46, 48, 49],
        trigger_threshold=4
    )
    result = evaluate_safety_override(responses, config)
    assert result.triggered is True
    assert len(result.triggers) == 1
    assert result.triggers[0].item_number == 42
    assert result.triggers[0].response_value == 4

def test_safety_override_not_triggered_below_threshold():
    """Verify that responses of 1, 2, or 3 on direct-risk items do not trigger the safety flag."""
    responses = {i: 3 for i in range(40, 50)}
    config = SafetyConfigModel(
        direct_risk_items=[42, 43, 45, 46, 48, 49],
        trigger_threshold=4
    )
    result = evaluate_safety_override(responses, config)
    assert result.triggered is False
    assert len(result.triggers) == 0

def test_configurable_safety_parameters():
    """Verify that direct-risk item list and trigger threshold can be configured dynamically."""
    responses = {42: 3, 43: 3, 45: 3}
    
    # With threshold 4, this should not trigger
    config_default = SafetyConfigModel(direct_risk_items=[42, 43, 45], trigger_threshold=4)
    assert evaluate_safety_override(responses, config_default).triggered is False

    # When adjusted to threshold 3, this triggers
    config_strict = SafetyConfigModel(direct_risk_items=[42, 43, 45], trigger_threshold=3)
    res_strict = evaluate_safety_override(responses, config_strict)
    assert res_strict.triggered is True
    assert len(res_strict.triggers) == 3
