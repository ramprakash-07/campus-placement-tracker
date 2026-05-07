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


class UserUpdate(BaseModel):
    """Payload for updating the current user's profile (email is immutable)."""
    full_name: str


class PasswordUpdate(BaseModel):
    """Payload for changing the current user's password."""
    old_password: str
    new_password: str


# ── Response schemas ─────────────────────────────────────────────────────

class UserOut(BaseModel):
    """Public user representation (no password)."""
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
