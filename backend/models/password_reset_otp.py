"""
PasswordResetOTP model — stores OTPs for password reset flow.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean

from db.database import Base


class PasswordResetOTP(Base):
    """Stores a 6-digit OTP for password reset."""

    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    otp = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<PasswordResetOTP id={self.id} email={self.email!r} used={self.used}>"
