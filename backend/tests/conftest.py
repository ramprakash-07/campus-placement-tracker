"""
Pytest fixtures — in-memory SQLite database, TestClient, auth helpers.

Every test function gets a fresh database and client via function-scoped
fixtures. The ``get_db`` dependency is overridden so that all FastAPI
endpoints use the test database instead of the real PostgreSQL database.

Rate limiting is disabled for the test suite.
"""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

# ── Override env vars BEFORE importing the app ──────────────────────────
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["ADMIN_EMAIL"] = ""
os.environ["ADMIN_PASSWORD"] = ""

from db.database import Base, get_db  # noqa: E402
from main import app, limiter as main_limiter  # noqa: E402
from routers.auth import limiter as auth_limiter  # noqa: E402

# ── Disable rate limiting for tests ─────────────────────────────────────
main_limiter.enabled = False
auth_limiter.enabled = False


# ── SQLite test engine ──────────────────────────────────────────────────
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
)

# Enable foreign key enforcement in SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Fixtures ────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def db_session():
    """Create all tables, yield a session, then drop everything."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    TestClient that uses the test database.
    Overrides the ``get_db`` dependency with our test session.
    """
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── Helper data ─────────────────────────────────────────────────────────

TEST_USER = {
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "full_name": "Test User",
}

TEST_USER_2 = {
    "email": "another@example.com",
    "password": "AnotherPass456!",
    "full_name": "Another User",
}


@pytest.fixture
def registered_user(client):
    """Register a user and return the response data."""
    resp = client.post("/auth/register", json=TEST_USER)
    assert resp.status_code == 201, f"Registration failed: {resp.json()}"
    return resp.json()


@pytest.fixture
def auth_token(client, registered_user):
    """Login and return the JWT access token string."""
    resp = client.post("/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
    })
    assert resp.status_code == 200, f"Login failed: {resp.json()}"
    return resp.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    """Return Authorization headers dict."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def test_company(client, auth_headers):
    """Create a test company and return the response data."""
    resp = client.post("/companies/", json={
        "name": "Test Corp",
        "sector": "Tech",
        "website": "https://testcorp.com",
    }, headers=auth_headers)
    assert resp.status_code == 201, f"Company creation failed: {resp.json()}"
    return resp.json()


@pytest.fixture
def test_record(client, auth_headers, test_company):
    """Create a test placement record and return the response data."""
    resp = client.post("/placement-records/", json={
        "company_id": test_company["id"],
        "academic_year": "2025-26",
        "role_applied": "Software Engineer",
        "status": "pending",
    }, headers=auth_headers)
    assert resp.status_code == 201, f"Record creation failed: {resp.json()}"
    return resp.json()
