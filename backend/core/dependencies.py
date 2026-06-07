"""
FastAPI dependencies — reusable dependency functions for route handlers.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from core.security import decode_access_token
from db.database import get_db
from models.user import User, UserRole

# Bearer-token extraction scheme
_bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that extracts and validates a Bearer JWT from the
    ``Authorization`` header.

    Returns the corresponding :class:`User` ORM instance.

    Raises
    ------
    HTTPException 401
        If the token is missing, invalid, expired, or the user does not exist.
    """
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user


def get_current_coordinator(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    FastAPI dependency that ensures the current user has the **coordinator** role.

    Reuses :func:`get_current_user` for JWT validation — does NOT duplicate
    any token logic.

    Raises
    ------
    HTTPException 403
        If the authenticated user is not a coordinator.
    """
    if current_user.role != UserRole.COORDINATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coordinator access required",
        )
    return current_user


def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    FastAPI dependency that ensures the current user has the **admin** role.

    Raises
    ------
    HTTPException 403
        If the authenticated user is not an admin.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
