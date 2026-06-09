"""
ActivityLog model — tracks user actions for activity feed.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from db.database import Base

ACTION_TYPES = (
    "record_added",
    "round_added",
    "record_updated",
    "record_deleted",
)


class ActivityLog(Base):
    """Records a user action for the activity feed."""

    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    action_type = Column(
        Enum(*ACTION_TYPES, name="action_type"),
        nullable=False,
    )
    entity_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ────────────────────────────────────────────────────
    user = relationship("User", backref="activity_logs")

    def __repr__(self) -> str:
        return f"<ActivityLog id={self.id} user={self.user_id} action={self.action_type!r}>"
