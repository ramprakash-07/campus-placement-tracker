"""
Round model — individual interview / assessment round within a placement record.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from db.database import Base

# Allowed round types.
ROUND_TYPES = ("aptitude", "technical", "hr", "group_discussion", "coding")

# Outcome values for a single round.
ROUND_OUTCOMES = ("passed", "failed", "pending")


class Round(Base):
    """Represents a single interview / assessment round."""

    __tablename__ = "rounds"

    id = Column(Integer, primary_key=True, index=True)
    placement_record_id = Column(
        Integer,
        ForeignKey("placement_records.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    round_number = Column(Integer, nullable=False)
    round_type = Column(
        Enum(*ROUND_TYPES, name="round_type"),
        nullable=False,
    )
    questions_asked = Column(Text, nullable=True)
    outcome = Column(
        Enum(*ROUND_OUTCOMES, name="round_outcome"),
        default="pending",
        nullable=False,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ────────────────────────────────────────────────────
    placement_record = relationship("PlacementRecord", back_populates="rounds")

    def __repr__(self) -> str:
        return (
            f"<Round id={self.id} record={self.placement_record_id} "
            f"round_number={self.round_number} type={self.round_type!r}>"
        )
