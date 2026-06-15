"""Tests for /placement-records endpoints — CRUD + ownership enforcement."""

from tests.conftest import TEST_USER_2


class TestCreateRecord:
    """POST /placement-records/"""

    def test_create_record_success(self, client, auth_headers, test_company):
        resp = client.post("/placement-records/", json={
            "company_id": test_company["id"],
            "academic_year": "2025-26",
            "role_applied": "Backend Dev",
            "status": "pending",
        }, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["role_applied"] == "Backend Dev"
        assert data["status"] == "pending"
        assert data["company_id"] == test_company["id"]

    def test_create_record_with_ctc(self, client, auth_headers, test_company):
        resp = client.post("/placement-records/", json={
            "company_id": test_company["id"],
            "academic_year": "2025-26",
            "role_applied": "SDE",
            "ctc_offered": 12.5,
            "status": "selected",
        }, headers=auth_headers)
        assert resp.status_code == 201
        assert float(resp.json()["ctc_offered"]) == 12.5

    def test_create_record_unauthorized(self, client, test_company):
        resp = client.post("/placement-records/", json={
            "company_id": 1,
            "academic_year": "2025-26",
            "role_applied": "Intern",
        })
        assert resp.status_code == 401


class TestGetRecords:
    """GET /placement-records/"""

    def test_list_records_empty(self, client, auth_headers):
        resp = client.get("/placement-records/", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data

    def test_list_records_with_data(self, client, auth_headers, test_record):
        resp = client.get("/placement-records/", headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.json()["data"]) >= 1


class TestGetRecordById:
    """GET /placement-records/{id}"""

    def test_get_record_success(self, client, auth_headers, test_record):
        rid = test_record["id"]
        resp = client.get(f"/placement-records/{rid}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["role_applied"] == test_record["role_applied"]

    def test_get_record_not_found(self, client, auth_headers):
        resp = client.get("/placement-records/99999", headers=auth_headers)
        assert resp.status_code == 404


class TestUpdateRecord:
    """PUT /placement-records/{id}"""

    def test_update_record_success(self, client, auth_headers, test_record):
        rid = test_record["id"]
        resp = client.put(f"/placement-records/{rid}", json={
            "status": "selected",
            "ctc_offered": 15.0,
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "selected"

    def test_update_record_not_found(self, client, auth_headers):
        resp = client.put("/placement-records/99999", json={
            "status": "rejected",
        }, headers=auth_headers)
        assert resp.status_code == 404


class TestDeleteRecord:
    """DELETE /placement-records/{id}"""

    def test_delete_record_success(self, client, auth_headers, test_record):
        rid = test_record["id"]
        resp = client.delete(f"/placement-records/{rid}", headers=auth_headers)
        assert resp.status_code == 204
        # Verify it's gone
        resp2 = client.get(f"/placement-records/{rid}", headers=auth_headers)
        assert resp2.status_code == 404

    def test_delete_record_not_found(self, client, auth_headers):
        resp = client.delete("/placement-records/99999", headers=auth_headers)
        assert resp.status_code == 404


class TestOwnershipEnforcement:
    """Verify users can only see/modify their own records."""

    def test_other_user_cannot_get_record(self, client, auth_headers, test_record):
        # Register a second user
        client.post("/auth/register", json=TEST_USER_2)
        resp = client.post("/auth/login", json={
            "email": TEST_USER_2["email"],
            "password": TEST_USER_2["password"],
        })
        token2 = resp.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        # Second user should not be able to access first user's record
        rid = test_record["id"]
        resp = client.get(f"/placement-records/{rid}", headers=headers2)
        # Should be 404 (record not found for this user) or 403
        assert resp.status_code in (403, 404)
