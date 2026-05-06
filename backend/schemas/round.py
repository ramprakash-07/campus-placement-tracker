"""
Round schemas — request / response shapes for Round endpoints.
"""

from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict


# Re-use the same allowed values defined in the ORM model.
RoundType = Literal["aptitude", "technical", "hr", "group_discussion", "coding"]
RoundOutcome = Literal["passed", "failed", "pending"]


# ── Request schemas ──────────────────────────────────────────────────────

class RoundCreate(BaseModel):
    """Payload for creating a new round."""
    placement_record_id: int
    round_number: Optional[int] = None
    round_type: RoundType
    questions_asked: Optional[str] = None
    outcome: RoundOutcome = "pending"


class RoundUpdate(BaseModel):
    """Payload for updating an existing round (all fields optional)."""
    round_number: Optional[int] = None
    round_type: Optional[RoundType] = None
    questions_asked: Optional[str] = None
    outcome: Optional[RoundOutcome] = None


# ── Response schemas ─────────────────────────────────────────────────────

class RoundOut(BaseModel):
    """Public round representation."""
    id: int
    placement_record_id: int
    round_number: int
    round_type: RoundType
    questions_asked: Optional[str] = None
    outcome: RoundOutcome
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
