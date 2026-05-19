"""
User model — stores registered user accounts.
"""

import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship

from db.database import Base


class UserRole(enum.Enum):
    """Allowed user roles on the platform."""
    STUDENT = "student"
    COORDINATOR = "coordinator"


class User(Base):
    """Represents a platform user (student / coordinator)."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        SAEnum(UserRole, name="userrole", values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=UserRole.STUDENT,
        server_default="student",
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ────────────────────────────────────────────────────
    placement_records = relationship(
        "PlacementRecord", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role.value!r}>"
