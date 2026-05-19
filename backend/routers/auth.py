"""
Authentication router — user registration and login.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from core.security import hash_password, verify_password, create_access_token
from db.database import get_db
from models.user import User, UserRole
from schemas.user import UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
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
def login(payload: UserLogin, db: Session = Depends(get_db)):
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
