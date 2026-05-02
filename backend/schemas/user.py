"""
User schemas — request / response shapes for User endpoints.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


# ── Request schemas ──────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """Payload for registering a new user."""
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    """Payload for authenticating an existing user."""
    email: EmailStr
    password: str


# ── Response schemas ─────────────────────────────────────────────────────

class UserOut(BaseModel):
    """Public user representation (no password)."""
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
