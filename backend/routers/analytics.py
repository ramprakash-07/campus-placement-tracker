"""
Analytics router — aggregate placement statistics and company frequency data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from db.database import get_db
from models.company import Company
from models.placement_record import PlacementRecord
from models.round import Round
from models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ---------------------------------------------------------------------------
# GET /analytics/summary
# ---------------------------------------------------------------------------
@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Summary stats for the current user:

    - **total_companies**: distinct companies applied to
    - **total_rounds**: total interview rounds attended
    - **selection_rate**: percentage of applications with status ``selected``
    """
    total_records = (
        db.query(func.count(PlacementRecord.id))
        .filter(PlacementRecord.user_id == current_user.id)
        .scalar()
    ) or 0

    total_companies = (
        db.query(func.count(func.distinct(PlacementRecord.company_id)))
        .filter(PlacementRecord.user_id == current_user.id)
        .scalar()
    ) or 0

    total_rounds = (
        db.query(func.count(Round.id))
        .join(PlacementRecord, Round.placement_record_id == PlacementRecord.id)
        .filter(PlacementRecord.user_id == current_user.id)
        .scalar()
    ) or 0

    selected_count = (
        db.query(func.count(PlacementRecord.id))
        .filter(
            PlacementRecord.user_id == current_user.id,
            PlacementRecord.status == "selected",
        )
        .scalar()
    ) or 0

    selection_rate = round((selected_count / total_records) * 100, 2) if total_records else 0.0

    return {
        "total_companies": total_companies,
        "total_rounds": total_rounds,
        "selection_rate": selection_rate,
    }


# ---------------------------------------------------------------------------
# GET /analytics/packages
# ---------------------------------------------------------------------------
@router.get("/packages")
def get_packages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    CTC package statistics for the current user's *selected* records,
    grouped by company.

    Returns average, minimum, and maximum ``ctc_offered`` per company.
    """
    rows = (
        db.query(
            Company.name.label("company"),
            func.avg(PlacementRecord.ctc_offered).label("avg_ctc"),
            func.min(PlacementRecord.ctc_offered).label("min_ctc"),
            func.max(PlacementRecord.ctc_offered).label("max_ctc"),
        )
        .join(PlacementRecord, PlacementRecord.company_id == Company.id)
        .filter(
            PlacementRecord.user_id == current_user.id,
            PlacementRecord.status == "selected",
            PlacementRecord.ctc_offered.isnot(None),
        )
        .group_by(Company.name)
        .all()
    )

    return [
        {
            "company": row.company,
            "avg_ctc": float(row.avg_ctc) if row.avg_ctc else None,
            "min_ctc": float(row.min_ctc) if row.min_ctc else None,
            "max_ctc": float(row.max_ctc) if row.max_ctc else None,
        }
        for row in rows
    ]


# ---------------------------------------------------------------------------
# GET /analytics/company-frequency
# ---------------------------------------------------------------------------
@router.get("/company-frequency")
def get_company_frequency(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # auth guard only
):
    """
    Count of placement records per company across **all users** (anonymized).
    """
    rows = (
        db.query(
            Company.name.label("company"),
            func.count(PlacementRecord.id).label("record_count"),
        )
        .join(PlacementRecord, PlacementRecord.company_id == Company.id)
        .group_by(Company.name)
        .order_by(func.count(PlacementRecord.id).desc())
        .all()
    )

    return [
        {"company": row.company, "record_count": row.record_count}
        for row in rows
    ]


# ---------------------------------------------------------------------------
# GET /analytics/top-companies
# ---------------------------------------------------------------------------
@router.get("/top-companies")
def get_top_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # auth guard only
):
    """
    Top 10 companies by visit frequency (number of placement records across
    all users).
    """
    rows = (
        db.query(
            Company.name.label("company"),
            func.count(PlacementRecord.id).label("visit_count"),
        )
        .join(PlacementRecord, PlacementRecord.company_id == Company.id)
        .group_by(Company.name)
        .order_by(func.count(PlacementRecord.id).desc())
        .limit(10)
        .all()
    )

    return [
        {"company": row.company, "visit_count": row.visit_count}
        for row in rows
    ]
