"""
PlacementRecord router — CRUD endpoints for PlacementRecord resources.

All routes require a valid Bearer JWT (``get_current_user`` dependency).
Ownership checks ensure a user can only access their own records.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from crud.company import get_company
from crud.placement_record import (
    create_placement_record,
    delete_placement_record,
    get_placement_record,
    get_user_placement_records,
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
@router.get("/", response_model=list[PlacementRecordOut])
def list_placement_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return all placement records that belong to the authenticated user.

    Each record includes the nested ``company`` object and its ``rounds``.
    """
    return get_user_placement_records(db, current_user.id)


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
