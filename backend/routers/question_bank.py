"""
Question Bank router — aggregated interview questions from all rounds.
"""

import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from core.dependencies import get_current_user
from db.database import get_db
from models.company import Company
from models.placement_record import PlacementRecord
from models.round import Round
from models.user import User

router = APIRouter(prefix="/question-bank", tags=["Question Bank"])


@router.get("")
def get_question_bank(
    round_type: str = Query(None, description="Filter by round type"),
    company_id: int = Query(None, description="Filter by company ID"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Aggregate questions_asked from rounds across all users.
    No user info exposed. Filterable by round_type and company_id.
    """
    base = (
        db.query(
            Round.id,
            Company.name.label("company_name"),
            Round.round_type,
            Round.questions_asked,
        )
        .join(PlacementRecord, Round.placement_record_id == PlacementRecord.id)
        .join(Company, PlacementRecord.company_id == Company.id)
        .filter(Round.questions_asked.isnot(None))
        .filter(Round.questions_asked != "")
    )

    if round_type:
        base = base.filter(Round.round_type == round_type)
    if company_id:
        base = base.filter(PlacementRecord.company_id == company_id)

    total = base.count()
    items = (
        base.order_by(Round.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "data": [
            {
                "id": item.id,
                "company_name": item.company_name,
                "round_type": item.round_type,
                "questions_asked": item.questions_asked,
            }
            for item in items
        ],
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit) if total else 1,
    }
