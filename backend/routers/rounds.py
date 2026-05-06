"""
Round router — CRUD endpoints for Round resources.

All routes require a valid Bearer JWT. Ownership is enforced through the
parent ``PlacementRecord`` — only the user who owns the record can create,
update, or delete its rounds.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from crud.round import (
    create_round,
    delete_round,
    get_parent_record,
    get_round,
    get_rounds_for_record,
    update_round,
)
from db.database import get_db
from models.user import User
from schemas.round import RoundCreate, RoundOut, RoundUpdate

router = APIRouter(
    prefix="/rounds",
    tags=["Rounds"],
)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _verify_record_ownership(
    db: Session,
    placement_record_id: int,
    current_user: User,
):
    """
    Verify that the placement record exists and belongs to the current user.

    Raises **404** if the record is missing, **403** if ownership fails.
    Returns the parent record on success.
    """
    parent = get_parent_record(db, placement_record_id)
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Placement record with id {placement_record_id} not found",
        )
    if parent.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this placement record",
        )
    return parent


# ---------------------------------------------------------------------------
# POST /rounds — create
# ---------------------------------------------------------------------------
@router.post("/", response_model=RoundOut, status_code=status.HTTP_201_CREATED)
def create_new_round(
    payload: RoundCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new round linked to a placement record.

    The current user must own the parent placement record.
    If ``round_number`` is omitted, it is auto-incremented.
    """
    _verify_record_ownership(db, payload.placement_record_id, current_user)
    return create_round(db, payload)


# ---------------------------------------------------------------------------
# GET /rounds/{placement_record_id} — list rounds for a record
# ---------------------------------------------------------------------------
@router.get("/{placement_record_id}", response_model=list[RoundOut])
def list_rounds(
    placement_record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return all rounds for a given placement record, ordered by ``round_number``.

    The current user must own the parent placement record.
    """
    _verify_record_ownership(db, placement_record_id, current_user)
    return get_rounds_for_record(db, placement_record_id)


# ---------------------------------------------------------------------------
# PUT /rounds/{id} — update
# ---------------------------------------------------------------------------
@router.put("/{round_id}", response_model=RoundOut)
def update_existing_round(
    round_id: int,
    payload: RoundUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Partially update a round.

    Ownership is verified through the parent placement record.
    """
    db_round = get_round(db, round_id)
    if not db_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Round with id {round_id} not found",
        )
    _verify_record_ownership(db, db_round.placement_record_id, current_user)
    return update_round(db, db_round, payload)


# ---------------------------------------------------------------------------
# DELETE /rounds/{id} — delete
# ---------------------------------------------------------------------------
@router.delete("/{round_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_round(
    round_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a round by ID.

    Ownership is verified through the parent placement record.
    """
    db_round = get_round(db, round_id)
    if not db_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Round with id {round_id} not found",
        )
    _verify_record_ownership(db, db_round.placement_record_id, current_user)
    delete_round(db, db_round)
