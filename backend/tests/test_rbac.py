import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_student_cannot_access_counselor_or_admin_endpoints(client: AsyncClient, student_token: str):
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Counselor list view
    res_list = await client.get("/api/assessments/", headers=headers)
    assert res_list.status_code == 403

    # Counselor detail view
    res_detail = await client.get("/api/assessments/some-id", headers=headers)
    assert res_detail.status_code == 403

    # Counselor safety flags
    res_flags = await client.get("/api/safety-flags/", headers=headers)
    assert res_flags.status_code == 403

    # Admin metrics
    res_admin = await client.get("/api/admin/metrics", headers=headers)
    assert res_admin.status_code == 403

@pytest.mark.asyncio
async def test_admin_cannot_access_individual_student_data(client: AsyncClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin CANNOT view individual student clinical profile
    res_detail = await client.get("/api/assessments/some-id", headers=headers)
    assert res_detail.status_code == 403

    # Admin CAN view de-identified aggregate metrics
    res_admin = await client.get("/api/admin/metrics", headers=headers)
    assert res_admin.status_code == 200

    # Admin CAN view/update safety configuration
    res_cfg = await client.get("/api/admin/safety-config", headers=headers)
    assert res_cfg.status_code == 200

@pytest.mark.asyncio
async def test_counselor_cannot_access_admin_config(client: AsyncClient, counselor_token: str):
    headers = {"Authorization": f"Bearer {counselor_token}"}

    # Counselor CANNOT update admin safety config
    res_admin_cfg = await client.get("/api/admin/safety-config", headers=headers)
    assert res_admin_cfg.status_code == 403

    # Counselor CAN list assessments and safety flags
    res_list = await client.get("/api/assessments/", headers=headers)
    assert res_list.status_code == 200
    res_flags = await client.get("/api/safety-flags/", headers=headers)
    assert res_flags.status_code == 200
