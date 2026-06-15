"""Tests for /companies endpoints — CRUD happy paths, 404, unauthorized."""


class TestCreateCompany:
    """POST /companies/"""

    def test_create_company_success(self, client, auth_headers):
        resp = client.post("/companies/", json={
            "name": "Google",
            "sector": "Tech",
            "website": "https://google.com",
        }, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Google"
        assert data["sector"] == "Tech"
        assert "id" in data

    def test_create_company_minimal(self, client, auth_headers):
        resp = client.post("/companies/", json={
            "name": "Startup Inc",
        }, headers=auth_headers)
        assert resp.status_code == 201
        assert resp.json()["name"] == "Startup Inc"

    def test_create_company_unauthorized(self, client):
        resp = client.post("/companies/", json={"name": "NoAuth Corp"})
        assert resp.status_code == 401

    def test_create_company_missing_name(self, client, auth_headers):
        resp = client.post("/companies/", json={
            "sector": "Finance",
        }, headers=auth_headers)
        assert resp.status_code == 422


class TestGetCompanies:
    """GET /companies/"""

    def test_list_companies_empty(self, client, auth_headers):
        resp = client.get("/companies/", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert isinstance(data["data"], list)

    def test_list_companies_with_data(self, client, auth_headers, test_company):
        resp = client.get("/companies/", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) >= 1

    def test_list_companies_unauthorized(self, client):
        resp = client.get("/companies/")
        assert resp.status_code == 401


class TestGetCompanyById:
    """GET /companies/{id}"""

    def test_get_company_success(self, client, auth_headers, test_company):
        cid = test_company["id"]
        resp = client.get(f"/companies/{cid}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == test_company["name"]

    def test_get_company_not_found(self, client, auth_headers):
        resp = client.get("/companies/99999", headers=auth_headers)
        assert resp.status_code == 404


class TestUpdateCompany:
    """PUT /companies/{id}"""

    def test_update_company_success(self, client, auth_headers, test_company):
        cid = test_company["id"]
        resp = client.put(f"/companies/{cid}", json={
            "name": "Updated Corp",
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Corp"

    def test_update_company_not_found(self, client, auth_headers):
        resp = client.put("/companies/99999", json={
            "name": "Nope",
        }, headers=auth_headers)
        assert resp.status_code == 404
