"""Tests for /analytics endpoints — summary, packages, response shape."""


class TestAnalyticsSummary:
    """GET /analytics/summary"""

    def test_summary_empty(self, client, auth_headers):
        resp = client.get("/analytics/summary", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_records" in data
        assert "total_companies" in data
        assert "total_rounds" in data
        assert "selection_rate" in data
        assert "avg_ctc" in data
        assert "scope" in data

    def test_summary_with_data(self, client, auth_headers, test_record):
        resp = client.get("/analytics/summary", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_records"] >= 1
        assert isinstance(data["selection_rate"], (int, float))
        assert isinstance(data["avg_ctc"], (int, float))

    def test_summary_unauthorized(self, client):
        resp = client.get("/analytics/summary")
        assert resp.status_code == 401


class TestAnalyticsPackages:
    """GET /analytics/packages"""

    def test_packages_empty(self, client, auth_headers):
        resp = client.get("/analytics/packages", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_packages_response_shape(self, client, auth_headers, test_company):
        # Create a selected record with CTC
        client.post("/placement-records/", json={
            "company_id": test_company["id"],
            "academic_year": "2025-26",
            "role_applied": "SDE",
            "ctc_offered": 20.0,
            "status": "selected",
        }, headers=auth_headers)

        resp = client.get("/analytics/packages", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        if len(data) > 0:
            item = data[0]
            assert "company" in item
            assert "avg_ctc" in item
            assert "min_ctc" in item
            assert "max_ctc" in item


class TestAnalyticsRecordsByYear:
    """GET /analytics/records-by-year"""

    def test_records_by_year_empty(self, client, auth_headers):
        resp = client.get("/analytics/records-by-year", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_records_by_year_with_data(self, client, auth_headers, test_record):
        resp = client.get("/analytics/records-by-year", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert "year" in data[0]
        assert "count" in data[0]


class TestAnalyticsCompanyFrequency:
    """GET /analytics/company-frequency"""

    def test_company_frequency(self, client, auth_headers, test_record):
        resp = client.get("/analytics/company-frequency", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "company" in data[0]
            assert "record_count" in data[0]
