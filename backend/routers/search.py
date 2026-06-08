"""
Search router — global search across companies, records, and rounds.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from core.dependencies import get_current_user
from db.database import get_db
from models.company import Company
from models.placement_record import PlacementRecord
from models.round import Round
from models.user import User

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
def global_search(
    q: str = Query(..., min_length=2, description="Search query (min 2 chars)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Search across companies (by name, sector), placement records (by role_applied,
    scoped to current user), and rounds (by questions_asked, scoped to current user).

    Returns results grouped by type.
    """
    like_q = f"%{q}%"

    # ── Companies (global) ──────────────────────────────────────────────
    companies = (
        db.query(Company)
        .filter(
            (Company.name.ilike(like_q)) | (Company.sector.ilike(like_q))
        )
        .limit(10)
        .all()
    )
    company_results = [
        {"id": c.id, "label": f"{c.name} ({c.sector})", "type": "company"}
        for c in companies
    ]

    # ── Placement records (user-scoped) ─────────────────────────────────
    records = (
        db.query(PlacementRecord)
        .options(joinedload(PlacementRecord.company))
        .filter(
            PlacementRecord.user_id == current_user.id,
            PlacementRecord.role_applied.ilike(like_q),
        )
        .limit(10)
        .all()
    )
    record_results = [
        {
            "id": r.id,
            "label": f"{r.role_applied} at {r.company.name if r.company else 'Unknown'}",
            "type": "record",
        }
        for r in records
    ]

    # ── Rounds (user-scoped via placement record) ───────────────────────
    rounds = (
        db.query(Round)
        .join(PlacementRecord, Round.placement_record_id == PlacementRecord.id)
        .options(joinedload(Round.placement_record).joinedload(PlacementRecord.company))
        .filter(
            PlacementRecord.user_id == current_user.id,
            Round.questions_asked.ilike(like_q),
        )
        .limit(10)
        .all()
    )
    round_results = [
        {
            "id": r.placement_record_id,
            "label": f"Round {r.round_number} ({r.round_type}) — {(r.questions_asked or '')[:60]}",
            "type": "round",
        }
        for r in rounds
    ]

    return {
        "companies": company_results,
        "records": record_results,
        "rounds": round_results,
    }
