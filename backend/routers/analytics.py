"""
Analytics router — aggregate placement statistics and company frequency data.

All endpoints are accessible by any authenticated user. The query scope depends
on the user's role:
  - **coordinator** → platform-wide data (no user_id filter)
  - **student**     → personal data only (WHERE user_id = current_user.id)

All endpoints accept an optional ``academic_year`` query parameter to filter
placement records by academic year before aggregation.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from db.database import get_db
from models.company import Company
from models.placement_record import PlacementRecord
from models.round import Round
from models.user import User, UserRole

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ---------------------------------------------------------------------------
# Helper — check if user is a coordinator
# ---------------------------------------------------------------------------
def _is_coordinator(user: User) -> bool:
    return user.role == UserRole.COORDINATOR


# ---------------------------------------------------------------------------
# Helper — apply common filters (role scope + academic year)
# ---------------------------------------------------------------------------
def _apply_filters(query, user: User, academic_year: str | None = None):
    """Apply user-scope and academic_year filters to a query on PlacementRecord."""
    if not _is_coordinator(user):
        query = query.filter(PlacementRecord.user_id == user.id)
    if academic_year:
        query = query.filter(PlacementRecord.academic_year == academic_year)
    return query


# ---------------------------------------------------------------------------
# GET /analytics/summary
# ---------------------------------------------------------------------------
@router.get("/summary")
def get_summary(
    academic_year: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Summary stats scoped by role.

    - **coordinator** → platform-wide totals (scope: "platform")
    - **student** → personal totals (scope: "personal")
    """
    is_coord = _is_coordinator(current_user)

    records_query = db.query(func.count(PlacementRecord.id))
    companies_query = db.query(func.count(func.distinct(PlacementRecord.company_id)))
    rounds_query = (
        db.query(func.count(Round.id))
        .join(PlacementRecord, Round.placement_record_id == PlacementRecord.id)
    )
    selected_query = db.query(func.count(PlacementRecord.id)).filter(
        PlacementRecord.status == "selected",
    )

    records_query = _apply_filters(records_query, current_user, academic_year)
    companies_query = _apply_filters(companies_query, current_user, academic_year)
    rounds_query = _apply_filters(rounds_query, current_user, academic_year)
    selected_query = _apply_filters(selected_query, current_user, academic_year)

    total_records = records_query.scalar() or 0
    total_companies = companies_query.scalar() or 0
    total_rounds = rounds_query.scalar() or 0
    selected_count = selected_query.scalar() or 0

    # Average CTC
    avg_ctc_query = db.query(func.avg(PlacementRecord.ctc_offered)).filter(
        PlacementRecord.ctc_offered.isnot(None),
    )
    avg_ctc_query = _apply_filters(avg_ctc_query, current_user, academic_year)
    avg_ctc = avg_ctc_query.scalar()

    return {
        "total_records": total_records,
        "total_companies": total_companies,
        "total_rounds": total_rounds,
        "selection_rate": selection_rate,
        "avg_ctc": round(float(avg_ctc), 2) if avg_ctc else 0.0,
        "scope": "platform" if is_coord else "personal",
    }


# ---------------------------------------------------------------------------
# GET /analytics/packages
# ---------------------------------------------------------------------------
@router.get("/packages")
def get_packages(
    academic_year: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    CTC package statistics grouped by company.

    - **coordinator** → all selected records platform-wide
    - **student** → only the current user's selected records
    """
    query = (
        db.query(
            Company.name.label("company"),
            func.avg(PlacementRecord.ctc_offered).label("avg_ctc"),
            func.min(PlacementRecord.ctc_offered).label("min_ctc"),
            func.max(PlacementRecord.ctc_offered).label("max_ctc"),
        )
        .join(PlacementRecord, PlacementRecord.company_id == Company.id)
        .filter(
            PlacementRecord.status == "selected",
            PlacementRecord.ctc_offered.isnot(None),
        )
    )

    query = _apply_filters(query, current_user, academic_year)
    rows = query.group_by(Company.name).all()

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
    academic_year: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Count of placement records per company.

    - **coordinator** → all users' records
    - **student** → only the current user's records
    """
    query = (
        db.query(
            Company.name.label("company"),
            func.count(PlacementRecord.id).label("record_count"),
        )
        .join(PlacementRecord, PlacementRecord.company_id == Company.id)
    )

    query = _apply_filters(query, current_user, academic_year)

    rows = (
        query
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
    academic_year: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Top 10 companies by visit frequency.

    - **coordinator** → across all users
    - **student** → only the current user's records
    """
    query = (
        db.query(
            Company.name.label("company"),
            func.count(PlacementRecord.id).label("visit_count"),
        )
        .join(PlacementRecord, PlacementRecord.company_id == Company.id)
    )

    query = _apply_filters(query, current_user, academic_year)

    rows = (
        query
        .group_by(Company.name)
        .order_by(func.count(PlacementRecord.id).desc())
        .limit(10)
        .all()
    )

    return [
        {"company": row.company, "visit_count": row.visit_count}
        for row in rows
    ]


# ---------------------------------------------------------------------------
# Helper — build dropout-rate breakdown from a base query filter
# ---------------------------------------------------------------------------
def _build_dropout_stats(
    db: Session,
    user_id: int | None = None,
    academic_year: str | None = None,
):
    """
    Return per-round-type dropout statistics.

    If *user_id* is provided the stats are scoped to that user's records;
    otherwise they cover all records in the system.
    """
    base = db.query(
        Round.round_type.label("round_type"),
        func.count(Round.id).label("total"),
        func.count(
            func.nullif(Round.outcome != "failed", True)
        ).label("failed"),
    ).join(PlacementRecord, Round.placement_record_id == PlacementRecord.id)

    if user_id is not None:
        base = base.filter(PlacementRecord.user_id == user_id)

    if academic_year:
        base = base.filter(PlacementRecord.academic_year == academic_year)

    rows = base.group_by(Round.round_type).all()

    return [
        {
            "round_type": row.round_type,
            "total": row.total,
            "failed": row.failed,
            "dropout_rate_percent": round((row.failed / row.total) * 100, 2)
            if row.total
            else 0.0,
        }
        for row in rows
    ]


# ---------------------------------------------------------------------------
# GET /analytics/dropout-rates
# ---------------------------------------------------------------------------
@router.get("/dropout-rates")
def get_dropout_rates(
    academic_year: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Round-wise dropout / failure rates.

    - **coordinator** → platform-wide across all users
    - **student** → scoped to the current user's records
    """
    if _is_coordinator(current_user):
        return _build_dropout_stats(db, academic_year=academic_year)
    else:
        return _build_dropout_stats(db, user_id=current_user.id, academic_year=academic_year)


# ---------------------------------------------------------------------------
# GET /analytics/my-round-performance
# ---------------------------------------------------------------------------
@router.get("/my-round-performance")
def get_my_round_performance(
    academic_year: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Round-wise dropout / failure rates.

    - **coordinator** → platform-wide (same as dropout-rates for coordinators)
    - **student** → scoped to the current user's placement records
    """
    if _is_coordinator(current_user):
        return _build_dropout_stats(db, academic_year=academic_year)
    else:
        return _build_dropout_stats(db, user_id=current_user.id, academic_year=academic_year)


# ---------------------------------------------------------------------------
# GET /analytics/records-by-year
# ---------------------------------------------------------------------------
@router.get("/records-by-year")
def get_records_by_year(
    academic_year: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Count of placement records grouped by academic year.
    """
    query = (
        db.query(
            PlacementRecord.academic_year.label("year"),
            func.count(PlacementRecord.id).label("count"),
        )
    )
    if not _is_coordinator(current_user):
        query = query.filter(PlacementRecord.user_id == current_user.id)

    rows = (
        query
        .group_by(PlacementRecord.academic_year)
        .order_by(PlacementRecord.academic_year)
        .all()
    )

    return [
        {"year": row.year, "count": row.count}
        for row in rows
    ]
