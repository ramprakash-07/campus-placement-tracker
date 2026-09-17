"""
Public router — read-only endpoints for guest (unauthenticated) access.

No JWT / auth required on any route. All responses are capped at 50 records.
User-identifiable information is stripped from placement records.
"""

import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from db.database import get_db
from models.company import Company
from models.placement_record import PlacementRecord
from models.round import Round

router = APIRouter(prefix="/public", tags=["Public"])


# ---------------------------------------------------------------------------
# GET /public/companies — list all companies (no auth)
# ---------------------------------------------------------------------------
@router.get("/companies", summary="List all companies (public)")
def public_list_companies(db: Session = Depends(get_db)):
    """Return up to 50 companies with basic info. No authentication required."""
    companies = db.query(Company).order_by(Company.name).limit(50).all()
    return {
        "data": [
            {
                "id": c.id,
                "name": c.name,
                "sector": c.sector,
                "website": c.website,
            }
            for c in companies
        ],
        "total": len(companies),
    }


# ---------------------------------------------------------------------------
# GET /public/records — anonymized placement records
# ---------------------------------------------------------------------------
@router.get("/records", summary="List placement records (anonymized, public)")
def public_list_records(db: Session = Depends(get_db)):
    """
    Return up to 50 placement records across all users.
    User-identifiable info is stripped — only company, role, year, CTC,
    status, and round count are exposed.
    """
    records = (
        db.query(
            PlacementRecord.id,
            Company.name.label("company_name"),
            PlacementRecord.role_applied,
            PlacementRecord.academic_year,
            PlacementRecord.ctc_offered,
            PlacementRecord.status,
            func.count(Round.id).label("round_count"),
        )
        .join(Company, PlacementRecord.company_id == Company.id)
        .outerjoin(Round, Round.placement_record_id == PlacementRecord.id)
        .group_by(
            PlacementRecord.id,
            Company.name,
            PlacementRecord.role_applied,
            PlacementRecord.academic_year,
            PlacementRecord.ctc_offered,
            PlacementRecord.status,
        )
        .order_by(PlacementRecord.id.desc())
        .limit(50)
        .all()
    )

    return {
        "data": [
            {
                "id": r.id,
                "company_name": r.company_name,
                "role_applied": r.role_applied,
                "academic_year": r.academic_year,
                "ctc_offered": float(r.ctc_offered) if r.ctc_offered else None,
                "status": r.status,
                "round_count": r.round_count,
            }
            for r in records
        ],
        "total": len(records),
    }


# ---------------------------------------------------------------------------
# GET /public/analytics/summary — platform-wide summary
# ---------------------------------------------------------------------------
@router.get("/analytics/summary", summary="Platform-wide summary stats (public)")
def public_analytics_summary(db: Session = Depends(get_db)):
    """
    Platform-wide summary: total records, total companies, avg CTC,
    and selection rate. No authentication required.
    """
    total_records = db.query(func.count(PlacementRecord.id)).scalar() or 0
    total_companies = db.query(func.count(Company.id)).scalar() or 0

    selected_count = (
        db.query(func.count(PlacementRecord.id))
        .filter(PlacementRecord.status == "selected")
        .scalar()
        or 0
    )

    avg_ctc = (
        db.query(func.avg(PlacementRecord.ctc_offered))
        .filter(PlacementRecord.ctc_offered.isnot(None))
        .scalar()
    )

    selection_rate = (
        round((selected_count / total_records) * 100, 2) if total_records else 0.0
    )

    return {
        "total_records": total_records,
        "total_companies": total_companies,
        "avg_ctc": round(float(avg_ctc), 2) if avg_ctc else 0.0,
        "selection_rate": selection_rate,
    }


# ---------------------------------------------------------------------------
# GET /public/analytics/top-companies — top 10 by visit frequency
# ---------------------------------------------------------------------------
@router.get(
    "/analytics/top-companies",
    summary="Top 10 companies by placement frequency (public)",
)
def public_top_companies(db: Session = Depends(get_db)):
    """
    Top 10 companies ranked by number of placement records.
    No authentication required.
    """
    results = (
        db.query(
            Company.name.label("company"),
            func.count(PlacementRecord.id).label("record_count"),
        )
        .join(PlacementRecord, PlacementRecord.company_id == Company.id)
        .group_by(Company.name)
        .order_by(func.count(PlacementRecord.id).desc())
        .limit(10)
        .all()
    )

    return [
        {"company": r.company, "record_count": r.record_count} for r in results
    ]


# ---------------------------------------------------------------------------
# GET /public/question-bank — community interview questions
# ---------------------------------------------------------------------------
@router.get("/question-bank", summary="Interview question bank (public)")
def public_question_bank(
    round_type: str = Query(None, description="Filter by round type"),
    company_id: int = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db),
):
    """
    Aggregated interview questions from all rounds. No user info exposed.
    Filterable by round_type and company_id. Limited to 50 results.
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

    items = base.order_by(Round.id.desc()).limit(50).all()

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
        "total": len(items),
    }
