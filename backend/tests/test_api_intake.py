import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_student_intake_submission_flow(
    client: AsyncClient,
    student_token: str,
    counselor_token: str,
    admin_token: str
):
    student_headers = {"Authorization": f"Bearer {student_token}"}
    counselor_headers = {"Authorization": f"Bearer {counselor_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Prepare 61 items payload
    # Let item 42 have value 4 (to trigger safety override)
    items = []
    for i in range(1, 62):
        val = 4 if i == 42 else 2
        items.append({"item_number": i, "response_value": val})

    background = [
        {"field_name": "name", "value": "أحمد"},
        {"field_name": "age", "value": "15"},
        {"field_name": "gender", "value": "male"},
        {"field_name": "school_stage", "value": "middle"},
        {"field_name": "school_type", "value": "public"}
    ]

    payload = {
        "background_responses": background,
        "item_responses": items
    }

    # Submit assessment as student
    res = await client.post("/api/assessments/submit", json=payload, headers=student_headers)
    assert res.status_code == 200
    receipt = res.json()
    assert "assessment_id" in receipt
    assessment_id = receipt["assessment_id"]
    assert receipt["status"] == "flagged"

    # CRITICAL: Verify student receipt NEVER exposes raw scores, T-scores, or screening levels
    assert "t_score" not in receipt
    assert "raw_score" not in receipt
    assert "screening_level" not in receipt
    assert "domain_scores" not in receipt

    # 2. Counselor lists assessments and verifies the new submission is present
    list_res = await client.get("/api/assessments/", headers=counselor_headers)
    assert list_res.status_code == 200
    assessments_list = list_res.json()
    assert any(a["id"] == assessment_id for a in assessments_list)

    # 3. Counselor inspects student detailed profile
    detail_res = await client.get(f"/api/assessments/{assessment_id}", headers=counselor_headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == assessment_id
    assert "domain_scores" in detail
    assert set(detail["domain_scores"].keys()) == {"anxiety", "depression", "behavior", "self_harm", "school_maladjustment"}
    
    # Check that safety flag was generated for item 42
    assert len(detail["safety_flags"]) >= 1
    flag = detail["safety_flags"][0]
    assert "42" in flag["triggered_by"]
    assert flag["status"] == "open"

    # 4. Counselor reviews / resolves the safety flag
    flag_id = flag["id"]
    patch_res = await client.patch(
        f"/api/safety-flags/{flag_id}",
        json={"status": "reviewed", "notes": "Contacted student for supportive check-in"},
        headers=counselor_headers
    )
    assert patch_res.status_code == 200
    updated_flag = patch_res.json()
    assert updated_flag["status"] == "reviewed"
    assert updated_flag["notes"] == "Contacted student for supportive check-in"

    # 5. Admin checks de-identified aggregate metrics
    metrics_res = await client.get("/api/admin/metrics", headers=admin_headers)
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert metrics["total_assessments"] >= 1
    assert "anxiety" in metrics["domains"]
    assert metrics["demographics"]["by_stage"].get("middle", 0) >= 1

@pytest.mark.asyncio
async def test_incomplete_assessment_rejected(client: AsyncClient, student_token: str):
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    # Missing item 61 (only 60 items provided)
    items = [{"item_number": i, "response_value": 3} for i in range(1, 61)]
    payload = {
        "background_responses": [{"field_name": "school_stage", "value": "high"}],
        "item_responses": items
    }
    res = await client.post("/api/assessments/submit", json=payload, headers=student_headers)
    assert res.status_code == 422
    assert "Missing items: [61]" in res.json()["detail"]
