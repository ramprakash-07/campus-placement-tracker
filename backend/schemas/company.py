"""
Company schemas — request / response shapes for Company endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Request schemas ──────────────────────────────────────────────────────

class CompanyCreate(BaseModel):
    """Payload for creating a new company."""
    name: str
    sector: Optional[str] = None
    website: Optional[str] = None


class CompanyUpdate(BaseModel):
    """Payload for updating an existing company (all fields optional)."""
    name: Optional[str] = None
    sector: Optional[str] = None
    website: Optional[str] = None


# ── Response schemas ─────────────────────────────────────────────────────

class CompanyOut(BaseModel):
    """Public company representation."""
    id: int
    name: str
    sector: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
