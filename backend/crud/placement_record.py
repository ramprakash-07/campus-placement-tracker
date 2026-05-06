"""
PlacementRecord CRUD — database operations for the PlacementRecord model.

Uses SQLAlchemy eager-loading (``joinedload``) so that the nested ``company``
and ``rounds`` relationships are available without extra queries.
"""

from typing import Optional

from sqlalchemy.orm import Session, joinedload

from models.company import Company
from models.placement_record import PlacementRecord
from schemas.placement_record import PlacementRecordCreate, PlacementRecordUpdate


# ---------------------------------------------------------------------------
# READ
# ---------------------------------------------------------------------------

def get_user_placement_records(
    db: Session,
    user_id: int,
) -> list[PlacementRecord]:
    """
    Return every placement record that belongs to *user_id*.

    Eagerly loads the related ``company`` and ``rounds`` so the response
    serialiser can embed them without triggering lazy-load queries.
    """
    return (
        db.query(PlacementRecord)
        .options(joinedload(PlacementRecord.company), joinedload(PlacementRecord.rounds))
        .filter(PlacementRecord.user_id == user_id)
        .order_by(PlacementRecord.id)
        .all()
    )


def get_placement_record(
    db: Session,
    record_id: int,
) -> Optional[PlacementRecord]:
    """Return a single placement record by primary key (with nested data), or ``None``."""
    return (
        db.query(PlacementRecord)
        .options(joinedload(PlacementRecord.company), joinedload(PlacementRecord.rounds))
        .filter(PlacementRecord.id == record_id)
        .first()
    )


# ---------------------------------------------------------------------------
# CREATE
# ---------------------------------------------------------------------------

def create_placement_record(
    db: Session,
    payload: PlacementRecordCreate,
    user_id: int,
) -> PlacementRecord:
    """
    Insert a new placement record linked to *user_id*.

    The caller is responsible for validating that ``company_id`` exists.
    """
    record = PlacementRecord(
        **payload.model_dump(),
        user_id=user_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    # Re-fetch with eager-loading so nested objects are populated
    return get_placement_record(db, record.id)  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# UPDATE
# ---------------------------------------------------------------------------

def update_placement_record(
    db: Session,
    db_record: PlacementRecord,
    payload: PlacementRecordUpdate,
) -> PlacementRecord:
    """
    Apply a partial update to an existing placement record.

    Only fields explicitly set in *payload* are written to the DB.
    """
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_record, field, value)
    db.commit()
    db.refresh(db_record)
    return get_placement_record(db, db_record.id)  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# DELETE
# ---------------------------------------------------------------------------

def delete_placement_record(db: Session, db_record: PlacementRecord) -> None:
    """Hard-delete a placement record row (cascades to rounds)."""
    db.delete(db_record)
    db.commit()
