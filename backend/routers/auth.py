"""
Authentication router — user registration and login.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from core.config import settings
from core.security import hash_password, verify_password, create_access_token
from db.database import get_db
from models.user import User, UserRole
from models.password_reset_otp import PasswordResetOTP
from schemas.user import (
    UserCreate, UserLogin, UserOut,
    ForgotPasswordRequest, ResetPasswordRequest,
)

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def register(request: Request, payload: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    - Checks for duplicate email → **400** if already taken.
    - If role is ``coordinator``, validates the invite code → **403** if invalid.
    - Hashes the password with bcrypt.
    - Returns the newly created user (without the password).
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    # ── Coordinator invite-code gate ────────────────────────────────────
    if payload.role == UserRole.COORDINATOR:
        if (
            not payload.invite_code
            or payload.invite_code != settings.COORDINATOR_INVITE_CODE
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid coordinator invite code",
            )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------
@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT access token.

    - Looks up the user by email → **401** if not found.
    - Verifies the password → **401** if incorrect.
    - Returns ``{"access_token": "...", "token_type": "bearer"}``.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# ---------------------------------------------------------------------------
# POST /auth/forgot-password
# ---------------------------------------------------------------------------
@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generate a 6-digit OTP and send it to the user's email.

    Always returns 200 (even if email not found) to prevent email enumeration.
    """
    import random
    from datetime import datetime, timedelta

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Don't reveal whether the email exists
        return {"message": "If the email exists, a reset OTP has been sent."}

    # Generate 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"

    # Store OTP
    otp = PasswordResetOTP(
        email=payload.email,
        otp=otp_code,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(otp)
    db.commit()

    # Send email (best-effort — don't fail the request if SMTP is not configured)
    try:
        _send_otp_email(payload.email, otp_code)
    except Exception:
        pass  # SMTP may not be configured in dev

    return {"message": "If the email exists, a reset OTP has been sent."}


# ---------------------------------------------------------------------------
# POST /auth/reset-password
# ---------------------------------------------------------------------------
@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validate the OTP and reset the user's password.
    """
    from datetime import datetime

    # Find the most recent unused, non-expired OTP for this email
    otp_record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.email == payload.email,
            PasswordResetOTP.otp == payload.otp,
            PasswordResetOTP.used == False,
            PasswordResetOTP.expires_at > datetime.utcnow(),
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    # Find the user
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Update password
    user.hashed_password = hash_password(payload.new_password)
    otp_record.used = True
    db.commit()

    return {"message": "Password reset successfully"}


# ---------------------------------------------------------------------------
# Helper: send OTP email
# ---------------------------------------------------------------------------
def _send_otp_email(email: str, otp: str):
    """Send the OTP via email using SMTP. Skips if SMTP is not configured."""
    import smtplib
    from email.mime.text import MIMEText

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return

    msg = MIMEText(
        f"Your password reset OTP is: {otp}\n\nThis code expires in 10 minutes.",
        "plain",
    )
    msg["Subject"] = "Password Reset OTP - Campus Placement Tracker"
    msg["From"] = settings.MAIL_FROM or settings.SMTP_USER
    msg["To"] = email

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
