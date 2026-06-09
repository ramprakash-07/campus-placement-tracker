"""
Round CRUD — database operations for the Round model.

Supports auto-incrementing ``round_number`` when the caller does not supply one.
"""

from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.placement_record import PlacementRecord
from models.round import Round
from models.activity_log import ActivityLog
from schemas.round import RoundCreate, RoundUpdate


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _next_round_number(db: Session, placement_record_id: int) -> int:
    """Return the next ``round_number`` for a given placement record."""
    max_num = (
        db.query(func.max(Round.round_number))
        .filter(Round.placement_record_id == placement_record_id)
        .scalar()
    )
    return (max_num or 0) + 1


def get_parent_record(db: Session, placement_record_id: int) -> Optional[PlacementRecord]:
    """Look up the parent PlacementRecord (used for ownership checks)."""
    return db.query(PlacementRecord).filter(PlacementRecord.id == placement_record_id).first()


# ---------------------------------------------------------------------------
# READ
# ---------------------------------------------------------------------------

def get_rounds_for_record(
    db: Session,
    placement_record_id: int,
) -> list[Round]:
    """Return all rounds belonging to a placement record, ordered by ``round_number``."""
    return (
        db.query(Round)
        .filter(Round.placement_record_id == placement_record_id)
        .order_by(Round.round_number)
        .all()
    )


def get_round(db: Session, round_id: int) -> Optional[Round]:
    """Return a single round by primary key, or ``None``."""
    return db.query(Round).filter(Round.id == round_id).first()


# ---------------------------------------------------------------------------
# CREATE
# ---------------------------------------------------------------------------

def create_round(
    db: Session,
    payload: RoundCreate,
) -> Round:
    """
    Insert a new round.

    If ``round_number`` is not provided in the payload it is auto-incremented
    based on the existing rounds for the parent placement record.
    """
    data = payload.model_dump()
    if data.get("round_number") is None:
        data["round_number"] = _next_round_number(db, data["placement_record_id"])
    round_obj = Round(**data)
    db.add(round_obj)
    db.commit()
    db.refresh(round_obj)
    # Log activity — find the user via parent record
    parent = db.query(PlacementRecord).filter(PlacementRecord.id == round_obj.placement_record_id).first()
    if parent:
        db.add(ActivityLog(
            user_id=parent.user_id,
            action_type="round_added",
            entity_id=round_obj.placement_record_id,
            description=f"Added {round_obj.round_type} round (Round {round_obj.round_number})",
        ))
        db.commit()
    return round_obj


# ---------------------------------------------------------------------------
# UPDATE
# ---------------------------------------------------------------------------

def update_round(
    db: Session,
    db_round: Round,
    payload: RoundUpdate,
) -> Round:
    """
    Apply a partial update to an existing round.

    Only fields explicitly set in *payload* are written.
    """
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_round, field, value)
    db.commit()
    db.refresh(db_round)
    return db_round


# ---------------------------------------------------------------------------
# DELETE
# ---------------------------------------------------------------------------

def delete_round(db: Session, db_round: Round) -> None:
    """Hard-delete a round row."""
    db.delete(db_round)
    db.commit()
