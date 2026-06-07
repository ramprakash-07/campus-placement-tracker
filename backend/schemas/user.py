"""
User schemas — request / response shapes for User endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from models.user import UserRole


# ── Request schemas ──────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """Payload for registering a new user."""
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.STUDENT
    invite_code: Optional[str] = None


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
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ForgotPasswordRequest(BaseModel):
    """Payload for requesting a password reset OTP."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Payload for resetting the password with an OTP."""
    email: EmailStr
    otp: str
    new_password: str
