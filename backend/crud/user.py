"""
User CRUD — update logic for user profile and password management.
"""

from sqlalchemy.orm import Session

from core.security import hash_password, verify_password
from models.user import User


def update_user_profile(db: Session, user: User, full_name: str) -> User:
    """
    Update the user's full name.

    Email is immutable and is NOT accepted as an updatable field.

    Parameters
    ----------
    db : Session
        Active database session.
    user : User
        The authenticated user ORM instance.
    full_name : str
        New display name for the user.

    Returns
    -------
    User
        The updated user ORM instance.
    """
    user.full_name = full_name
    db.commit()
    db.refresh(user)
    return user


def update_user_password(
    db: Session, user: User, old_password: str, new_password: str
) -> User:
    """
    Change the user's password after verifying the current (old) one.

    Parameters
    ----------
    db : Session
        Active database session.
    user : User
        The authenticated user ORM instance.
    old_password : str
        The current plaintext password — must match the stored hash.
    new_password : str
        The new plaintext password to hash and store.

    Returns
    -------
    User
        The updated user ORM instance.

    Raises
    ------
    ValueError
        If *old_password* does not match the stored hash.
    """
    if not verify_password(old_password, user.hashed_password):
        raise ValueError("Old password is incorrect")

    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user
