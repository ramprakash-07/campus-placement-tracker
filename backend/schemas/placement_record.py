"""
PlacementRecord schemas — request / response shapes for PlacementRecord endpoints.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Literal

from pydantic import BaseModel, ConfigDict

from schemas.company import CompanyOut
from schemas.round import RoundOut


# Re-use the same allowed status values defined in the ORM model.
PlacementStatus = Literal["selected", "rejected", "pending"]


# ── Request schemas ──────────────────────────────────────────────────────

class PlacementRecordCreate(BaseModel):
    """Payload for creating a new placement record."""
    company_id: int
    academic_year: str
    role_applied: str
    ctc_offered: Optional[Decimal] = None
    status: PlacementStatus = "pending"


class PlacementRecordUpdate(BaseModel):
    """Payload for updating an existing placement record (all fields optional)."""
    academic_year: Optional[str] = None
    role_applied: Optional[str] = None
    ctc_offered: Optional[Decimal] = None
    status: Optional[PlacementStatus] = None


# ── Response schemas ─────────────────────────────────────────────────────

class PlacementRecordOut(BaseModel):
    """Public placement-record representation with nested company & rounds."""
    id: int
    user_id: int
    company_id: int
    academic_year: str
    role_applied: str
    ctc_offered: Optional[Decimal] = None
    status: PlacementStatus
    created_at: datetime

    # Nested related objects
    company: CompanyOut
    rounds: List[RoundOut] = []

    model_config = ConfigDict(from_attributes=True)
