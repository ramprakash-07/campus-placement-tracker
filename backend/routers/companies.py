"""
Companies router — CRUD endpoints for Company resources.

All routes require a valid Bearer JWT (``get_current_user`` dependency).
"""

from typing import Optional

import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from crud.company import (
    create_company,
    delete_company,
    get_companies,
    get_companies_paginated,
    get_company,
    get_company_by_name,
    update_company,
)
from crud.placement_record import get_company_placement_records
from db.database import get_db
from models.user import User
from schemas.company import CompanyCreate, CompanyOut, CompanyUpdate
from schemas.placement_record import PlacementRecordAnonymizedOut

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
    dependencies=[Depends(get_current_user)],
)


# ---------------------------------------------------------------------------
# GET /companies — list all (optional search)
# ---------------------------------------------------------------------------
@router.get("/")
def list_companies(
    search: Optional[str] = Query(None, description="Filter companies by name"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """
    Return a paginated list of companies.

    Pass ``?search=<term>`` to filter by name (case-insensitive partial match).
    Pass ``?page=1&limit=10`` for pagination.
    """
    items, total = get_companies_paginated(db, search=search, page=page, limit=limit)
    return {
        "data": items,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit) if total else 1,
    }


# ---------------------------------------------------------------------------
# GET /companies/{id} — get one
# ---------------------------------------------------------------------------
@router.get("/{company_id}", response_model=CompanyOut)
def read_company(company_id: int, db: Session = Depends(get_db)):
    """Return a single company by ID or **404**."""
    company = get_company(db, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with id {company_id} not found",
        )
    return company


# ---------------------------------------------------------------------------
# GET /companies/{id}/records — anonymized records for a company
# ---------------------------------------------------------------------------
@router.get("/{company_id}/records", response_model=list[PlacementRecordAnonymizedOut])
def list_company_records(company_id: int, db: Session = Depends(get_db)):
    """Return all anonymized placement records for a company (across all users)."""
    company = get_company(db, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with id {company_id} not found",
        )
    return get_company_placement_records(db, company_id)


# ---------------------------------------------------------------------------
# POST /companies — create
# ---------------------------------------------------------------------------
@router.post("/", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
def create_new_company(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new company.

    Returns **400** if a company with the same name already exists.
    """
    if get_company_by_name(db, payload.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A company named '{payload.name}' already exists",
        )
    return create_company(db, payload)


# ---------------------------------------------------------------------------
# PUT /companies/{id} — partial update
# ---------------------------------------------------------------------------
@router.put("/{company_id}", response_model=CompanyOut)
def update_existing_company(
    company_id: int,
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
):
    """
    Partially update an existing company.

    Only fields supplied in the request body are modified.
    Returns **404** if the company does not exist.
    """
    db_company = get_company(db, company_id)
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with id {company_id} not found",
        )

    # If the name is being changed, check for duplicates
    if payload.name and payload.name != db_company.name:
        if get_company_by_name(db, payload.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A company named '{payload.name}' already exists",
            )

    return update_company(db, db_company, payload)


# ---------------------------------------------------------------------------
# DELETE /companies/{id} — delete
# ---------------------------------------------------------------------------
@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_company(company_id: int, db: Session = Depends(get_db)):
    """
    Delete a company by ID.

    Returns **404** if the company does not exist.
    """
    db_company = get_company(db, company_id)
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with id {company_id} not found",
        )
    delete_company(db, db_company)
