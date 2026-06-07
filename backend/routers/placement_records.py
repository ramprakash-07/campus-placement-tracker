"""
PlacementRecord router — CRUD endpoints for PlacementRecord resources.

All routes require a valid Bearer JWT (``get_current_user`` dependency).
Ownership checks ensure a user can only access their own records.
"""

import csv
import io
import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from crud.company import get_company
from crud.placement_record import (
    create_placement_record,
    delete_placement_record,
    get_placement_record,
    get_user_placement_records,
    get_user_placement_records_paginated,
    update_placement_record,
)
from db.database import get_db
from models.user import User
from schemas.placement_record import (
    PlacementRecordCreate,
    PlacementRecordOut,
    PlacementRecordUpdate,
)

router = APIRouter(
    prefix="/placement-records",
    tags=["Placement Records"],
)


# ---------------------------------------------------------------------------
# GET /placement-records — list current user's records
# ---------------------------------------------------------------------------
@router.get("/")
def list_placement_records(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return a paginated list of placement records for the authenticated user.

    Each record includes the nested ``company`` object and its ``rounds``.
    Pass ``?page=1&limit=10`` for pagination.
    """
    items, total = get_user_placement_records_paginated(
        db, current_user.id, page=page, limit=limit
    )
    return {
        "data": items,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit) if total else 1,
    }


# ---------------------------------------------------------------------------
# GET /placement-records/export — export all records as CSV
# ---------------------------------------------------------------------------
@router.get("/export")
def export_placement_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Export the current user's placement records (with rounds) as a CSV file.

    Columns: Company, Sector, Role, Academic Year, CTC, Status,
    Round 1 Type, Round 1 Outcome, ..., Round 5 Type, Round 5 Outcome.
    """
    records = get_user_placement_records(db, current_user.id)

    # Build CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    headers = [
        "Company", "Sector", "Role Applied", "Academic Year",
        "CTC Offered", "Status",
    ]
    for i in range(1, 6):
        headers.extend([f"Round {i} Type", f"Round {i} Outcome"])
    writer.writerow(headers)

    # Data rows
    for record in records:
        row = [
            record.company.name if record.company else "",
            record.company.sector if record.company else "",
            record.role_applied,
            record.academic_year,
            str(record.ctc_offered) if record.ctc_offered is not None else "",
            record.status,
        ]
        # Sort rounds by round_number and pad up to 5
        sorted_rounds = sorted(record.rounds, key=lambda r: r.round_number)
        for i in range(5):
            if i < len(sorted_rounds):
                row.extend([sorted_rounds[i].round_type, sorted_rounds[i].outcome])
            else:
                row.extend(["", ""])
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=placement_records.csv"
        },
    )


# ---------------------------------------------------------------------------
# GET /placement-records/{id} — get one (ownership check)
# ---------------------------------------------------------------------------
@router.get("/{record_id}", response_model=PlacementRecordOut)
def read_placement_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return a single placement record by ID.

    Returns **404** if the record does not exist.
    Returns **403** if the record does not belong to the current user.
    """
    record = get_placement_record(db, record_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Placement record with id {record_id} not found",
        )
    if record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this record",
        )
    return record


# ---------------------------------------------------------------------------
# POST /placement-records — create
# ---------------------------------------------------------------------------
@router.post("/", response_model=PlacementRecordOut, status_code=status.HTTP_201_CREATED)
def create_new_placement_record(
    payload: PlacementRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new placement record linked to the authenticated user.

    The ``company_id`` in the payload must reference an existing company,
    otherwise **404** is returned.
    """
    # Validate that the company exists
    if not get_company(db, payload.company_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with id {payload.company_id} not found",
        )
    return create_placement_record(db, payload, user_id=current_user.id)


# ---------------------------------------------------------------------------
# PUT /placement-records/{id} — update (ownership check)
# ---------------------------------------------------------------------------
@router.put("/{record_id}", response_model=PlacementRecordOut)
def update_existing_placement_record(
    record_id: int,
    payload: PlacementRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Partially update an existing placement record.

    Only fields supplied in the request body are modified.
    Returns **404** if missing, **403** if not owned by the current user.
    """
    db_record = get_placement_record(db, record_id)
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Placement record with id {record_id} not found",
        )
    if db_record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this record",
        )
    return update_placement_record(db, db_record, payload)


# ---------------------------------------------------------------------------
# DELETE /placement-records/{id} — delete (ownership check)
# ---------------------------------------------------------------------------
@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_placement_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a placement record by ID (cascades to child rounds).

    Returns **404** if missing, **403** if not owned by the current user.
    """
    db_record = get_placement_record(db, record_id)
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Placement record with id {record_id} not found",
        )
    if db_record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this record",
        )
    delete_placement_record(db, db_record)
