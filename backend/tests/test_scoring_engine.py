import pytest
from app.services.scoring_engine import (
    score_item_response,
    calculate_single_domain_score,
    compute_all_domain_scores,
    lookup_percentile,
    get_screening_level,
    REVERSE_SCORED_ITEMS,
    DOMAIN_CONFIGS
)

def test_reverse_scoring_rule():
    """Verify Section 6: Only items 50, 51, 52, 54, 55, 56, 58, 59, 60 are reverse-scored (6 - raw)."""
    expected_reversed = {50, 51, 52, 54, 55, 56, 58, 59, 60}
    assert REVERSE_SCORED_ITEMS == expected_reversed

    # Test reverse transformation: 1 -> 5, 2 -> 4, 3 -> 3, 4 -> 2, 5 -> 1
    for item in expected_reversed:
        assert score_item_response(item, 1) == 5
        assert score_item_response(item, 2) == 4
        assert score_item_response(item, 3) == 3
        assert score_item_response(item, 4) == 2
        assert score_item_response(item, 5) == 1

    # Verify standard items (e.g. 53, 57, 61 in Domain 5, and items from other domains) are not reversed
    standard_items = [1, 13, 14, 27, 28, 39, 40, 49, 53, 57, 61]
    for item in standard_items:
        assert score_item_response(item, 1) == 1
        assert score_item_response(item, 4) == 4
        assert score_item_response(item, 5) == 5

def test_t_score_formulas():
    """
    Verify Section 5 T-score formulas:
    - Anxiety: T = 50 + 10 * (X - 32.56) / 12.40
    - Depression: T = 50 + 10 * (X - 30.70) / 12.96
    - Behavior: T = 50 + 10 * (X - 21.26) / 8.85
    - Self-harm: T = 50 + 10 * (X - 17.94) / 9.34
    - School maladjustment: T = 50 + 10 * (X - 28.09) / 10.30
    """
    # 1. Anxiety: 13 items. Let raw_sum = 45
    # T = 50 + 10 * (45 - 32.56) / 12.40 = 50 + 10 * 12.44 / 12.40 = 50 + 10.0322... = 60.03
    anxiety_responses = {i: 3 for i in range(1, 14)}  # 13 * 3 = 39
    # Add 6 to reach 45 (6 items with 4 instead of 3: 7*3 + 6*4 = 21 + 24 = 45)
    for i in range(1, 7):
        anxiety_responses[i] = 4
    
    anxiety_res = calculate_single_domain_score("anxiety", anxiety_responses)
    assert anxiety_res.raw_score == 45
    expected_t = round(50.0 + 10.0 * (45 - 32.56) / 12.40, 2)
    assert anxiety_res.t_score == expected_t
    assert anxiety_res.t_score == 60.03
    assert anxiety_res.screening_level == "medium"

    # 2. Depression: 14 items. Let all be 1 -> raw_sum = 14
    dep_responses = {i: 1 for i in range(14, 28)}
    dep_res = calculate_single_domain_score("depression", dep_responses)
    assert dep_res.raw_score == 14
    expected_dep_t = round(50.0 + 10.0 * (14 - 30.70) / 12.96, 2)
    assert dep_res.t_score == expected_dep_t
    assert dep_res.screening_level == "low"

    # 3. Behavior: 12 items. Let all be 5 -> raw_sum = 60
    beh_responses = {i: 5 for i in range(28, 40)}
    beh_res = calculate_single_domain_score("behavior", beh_responses)
    assert beh_res.raw_score == 60
    expected_beh_t = round(50.0 + 10.0 * (60 - 21.26) / 8.85, 2)
    assert beh_res.t_score == expected_beh_t
    assert beh_res.screening_level == "very_high"

    # 4. Self-harm: 10 items.
    sh_responses = {i: 2 for i in range(40, 50)}  # raw_sum = 20
    sh_res = calculate_single_domain_score("self_harm", sh_responses)
    assert sh_res.raw_score == 20
    expected_sh_t = round(50.0 + 10.0 * (20 - 17.94) / 9.34, 2)
    assert sh_res.t_score == expected_sh_t

    # 5. School maladjustment with reverse items:
    # 12 items: 50..61.
    # Reversed: 50, 51, 52, 54, 55, 56, 58, 59, 60 (9 items)
    # Normal: 53, 57, 61 (3 items)
    # If student answers '1' to all 12 items:
    # Reversed 9 items: 6 - 1 = 5 each -> 9 * 5 = 45
    # Normal 3 items: 1 each -> 3 * 1 = 3
    # Total raw_sum = 48
    mal_responses = {i: 1 for i in range(50, 62)}
    mal_res = calculate_single_domain_score("school_maladjustment", mal_responses)
    assert mal_res.raw_score == 48
    expected_mal_t = round(50.0 + 10.0 * (48 - 28.09) / 10.30, 2)
    assert mal_res.t_score == expected_mal_t
    assert mal_res.screening_level == "medium" or mal_res.screening_level == "high"

def test_screening_levels_thresholds():
    """Verify Section 5 T-score screening levels: < 60 Low, 60–<65 Medium, 65–<70 High, >= 70 Very high."""
    assert get_screening_level(59.99)[0] == "low"
    assert get_screening_level(60.00)[0] == "medium"
    assert get_screening_level(64.99)[0] == "medium"
    assert get_screening_level(65.00)[0] == "high"
    assert get_screening_level(69.99)[0] == "high"
    assert get_screening_level(70.00)[0] == "very_high"
    assert get_screening_level(85.50)[0] == "very_high"

def test_percentile_reference_lookup():
    """Verify Section 7 percentiles match normative tables exactly."""
    # Anxiety
    assert lookup_percentile("anxiety", 13) == 6.6
    assert lookup_percentile("anxiety", 32) == 50.6
    assert lookup_percentile("anxiety", 45) == 84.1
    assert lookup_percentile("anxiety", 65) == 100.0

    # Depression
    assert lookup_percentile("depression", 14) == 11.0
    assert lookup_percentile("depression", 29) == 50.5
    assert lookup_percentile("depression", 70) == 100.0

    # Self-harm
    assert lookup_percentile("self_harm", 10) == 29.1
    assert lookup_percentile("self_harm", 50) == 100.0

    # Behavior unobserved cases interpolation (54 is missing between 53: 99.2 and 55: 99.3)
    p_54 = lookup_percentile("behavior", 54)
    assert p_54 is not None
    assert 99.2 <= p_54 <= 99.3

def test_no_total_composite_score():
    """Verify that compute_all_domain_scores produces only 5 domain scores and NO composite score."""
    responses = {i: 3 for i in range(1, 62)}
    all_scores = compute_all_domain_scores(responses)
    assert set(all_scores.keys()) == {"anxiety", "depression", "behavior", "self_harm", "school_maladjustment"}
    assert "total" not in all_scores
    assert "composite" not in all_scores
    assert "overall" not in all_scores
