"""
Users router — profile viewing, profile update, and password change.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from crud.user import update_user_profile, update_user_password
from db.database import get_db
from models.user import User
from schemas.user import UserOut, UserUpdate, PasswordUpdate

router = APIRouter(prefix="/users", tags=["Users"])


# ---------------------------------------------------------------------------
# GET /users/me — return current user's profile
# ---------------------------------------------------------------------------
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Return the authenticated user's profile.
    """
    return current_user


# ---------------------------------------------------------------------------
# GET /users/me/role — return current user's role (for frontend role checks)
# ---------------------------------------------------------------------------
@router.get("/me/role")
def get_my_role(current_user: User = Depends(get_current_user)):
    """
    Return the authenticated user's role.

    Used by the frontend to determine UI behaviour after login.
    No coordinator guard — any authenticated user can check their own role.
    """
    return {"role": current_user.role.value}


# ---------------------------------------------------------------------------
# PUT /users/me — update current user's full_name (email is immutable)
# ---------------------------------------------------------------------------
@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the authenticated user's profile.

    Only ``full_name`` can be changed — email is immutable.
    """
    return update_user_profile(db, current_user, payload.full_name)


# ---------------------------------------------------------------------------
# PUT /users/me/password — change password (verify old first)
# ---------------------------------------------------------------------------
@router.put("/me/password", response_model=UserOut)
def change_password(
    payload: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change the authenticated user's password.

    - Verifies ``old_password`` against the stored hash → **400** if wrong.
    - Hashes and stores ``new_password``.
    """
    try:
        return update_user_password(
            db, current_user, payload.old_password, payload.new_password
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Old password is incorrect",
        )
