"""
Coordinator router — student management endpoints (coordinator-only).

All routes require the ``get_current_coordinator`` dependency.
"""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.dependencies import get_current_coordinator
from db.database import get_db
from models.placement_record import PlacementRecord
from models.round import Round
from models.user import User, UserRole

router = APIRouter(prefix="/coordinator", tags=["Coordinator"])


# ── Request schemas (local to this router) ───────────────────────────────

class StatusUpdatePayload(BaseModel):
    """Payload for updating a placement record's coordinator status."""
    status: Literal["coordinator_approved", "coordinator_rejected"]


# ---------------------------------------------------------------------------
# GET /coordinator/students — list all students with record counts
# ---------------------------------------------------------------------------
@router.get("/students")
def list_students(
    db: Session = Depends(get_db),
    _coordinator: User = Depends(get_current_coordinator),
):
    """
    Return all users with role ``student``, each annotated with their
    placement record count.
    """
    # Subquery: count of placement_records per user
    record_count_sq = (
        db.query(
            PlacementRecord.user_id,
            func.count(PlacementRecord.id).label("record_count"),
        )
        .group_by(PlacementRecord.user_id)
        .subquery()
    )

    rows = (
        db.query(
            User.id,
            User.email,
            User.full_name,
            User.created_at,
            func.coalesce(record_count_sq.c.record_count, 0).label("record_count"),
        )
        .outerjoin(record_count_sq, User.id == record_count_sq.c.user_id)
        .filter(User.role == UserRole.STUDENT)
        .order_by(User.created_at.desc())
        .all()
    )

    return [
        {
            "id": row.id,
            "email": row.email,
            "full_name": row.full_name,
            "created_at": row.created_at.isoformat(),
            "record_count": row.record_count,
        }
        for row in rows
    ]


# ---------------------------------------------------------------------------
# PATCH /coordinator/records/{record_id}/status — approve or reject a record
# ---------------------------------------------------------------------------
@router.patch("/records/{record_id}/status")
def update_record_status(
    record_id: int,
    payload: StatusUpdatePayload,
    db: Session = Depends(get_db),
    _coordinator: User = Depends(get_current_coordinator),
):
    """
    Set a placement record's status to ``coordinator_approved`` or
    ``coordinator_rejected``.

    Raises 404 if the record does not exist.
    """
    record = db.query(PlacementRecord).filter(PlacementRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Placement record not found",
        )

    record.status = payload.status
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "status": record.status,
        "message": f"Record {record_id} status updated to {payload.status}",
    }


# ---------------------------------------------------------------------------
# DELETE /coordinator/students/{user_id} — delete a student and cascade
# ---------------------------------------------------------------------------
@router.delete("/students/{user_id}")
def delete_student(
    user_id: int,
    db: Session = Depends(get_db),
    _coordinator: User = Depends(get_current_coordinator),
):
    """
    Delete a student user and all associated data (placement records, rounds).

    - Raises 404 if user not found or if the target is a coordinator.
    - Manually deletes rounds → placement_records → user to ensure clean cascade.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role == UserRole.COORDINATOR:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",  # don't reveal coordinator existence
        )

    # Manually cascade: rounds → placement_records → user
    record_ids = [
        r.id
        for r in db.query(PlacementRecord.id)
        .filter(PlacementRecord.user_id == user_id)
        .all()
    ]
    if record_ids:
        db.query(Round).filter(Round.placement_record_id.in_(record_ids)).delete(
            synchronize_session=False
        )
        db.query(PlacementRecord).filter(
            PlacementRecord.user_id == user_id
        ).delete(synchronize_session=False)

    db.delete(user)
    db.commit()

    return {"message": f"Student {user_id} and all related data deleted"}
