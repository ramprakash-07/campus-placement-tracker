"""
PlacementRecord model — tracks a student's application to a company.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from db.database import Base

# Allowed status values for a placement application.
PLACEMENT_STATUS = ("selected", "rejected", "pending")


class PlacementRecord(Base):
    """Represents one student ↔ company placement application."""

    __tablename__ = "placement_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    academic_year = Column(String(20), nullable=False)  # e.g. "2025-26"
    role_applied = Column(String(255), nullable=False)
    ctc_offered = Column(Numeric(12, 2), nullable=True)  # LPA / amount
    status = Column(
        Enum(*PLACEMENT_STATUS, name="placement_status"),
        default="pending",
        nullable=False,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ────────────────────────────────────────────────────
    user = relationship("User", back_populates="placement_records")
    company = relationship("Company", back_populates="placement_records")
    rounds = relationship(
        "Round", back_populates="placement_record", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return (
            f"<PlacementRecord id={self.id} user={self.user_id} "
            f"company={self.company_id} status={self.status!r}>"
        )
