"""Tests for /auth endpoints — register, login, duplicate email, wrong password."""

from tests.conftest import TEST_USER, TEST_USER_2


class TestRegister:
    """POST /auth/register"""

    def test_register_success(self, client):
        resp = client.post("/auth/register", json=TEST_USER)
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == TEST_USER["email"]
        assert data["full_name"] == TEST_USER["full_name"]
        assert data["role"] == "student"
        assert "id" in data
        # password should NOT be in response
        assert "password" not in data
        assert "hashed_password" not in data

    def test_register_duplicate_email(self, client):
        client.post("/auth/register", json=TEST_USER)
        resp = client.post("/auth/register", json=TEST_USER)
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"].lower()

    def test_register_missing_fields(self, client):
        resp = client.post("/auth/register", json={"email": "a@b.com"})
        assert resp.status_code == 422

    def test_register_invalid_email(self, client):
        resp = client.post("/auth/register", json={
            "email": "not-an-email",
            "password": "pass123",
            "full_name": "Test",
        })
        assert resp.status_code == 422

    def test_register_coordinator_without_invite(self, client):
        resp = client.post("/auth/register", json={
            "email": "coord@test.com",
            "password": "Pass123!",
            "full_name": "Coordinator",
            "role": "coordinator",
        })
        # Should fail — either 403 (invalid invite) or 422 (validation)
        assert resp.status_code in (403, 422)

    def test_register_two_users(self, client):
        resp1 = client.post("/auth/register", json=TEST_USER)
        assert resp1.status_code == 201
        resp2 = client.post("/auth/register", json=TEST_USER_2)
        assert resp2.status_code == 201
        assert resp1.json()["id"] != resp2.json()["id"]


class TestLogin:
    """POST /auth/login"""

    def test_login_success(self, client, registered_user):
        resp = client.post("/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, registered_user):
        resp = client.post("/auth/login", json={
            "email": TEST_USER["email"],
            "password": "WrongPassword!",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_email(self, client):
        resp = client.post("/auth/login", json={
            "email": "nobody@example.com",
            "password": "anything",
        })
        assert resp.status_code == 401

    def test_login_missing_password(self, client):
        resp = client.post("/auth/login", json={"email": "a@b.com"})
        assert resp.status_code == 422

    def test_auth_token_works(self, client, auth_headers):
        resp = client.get("/users/me", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["email"] == TEST_USER["email"]

    def test_no_token_returns_401(self, client):
        resp = client.get("/users/me")
        assert resp.status_code == 401
