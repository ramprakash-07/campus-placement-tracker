"""
PlacementRecord CRUD — database operations for the PlacementRecord model.

Uses SQLAlchemy eager-loading (``joinedload``) so that the nested ``company``
and ``rounds`` relationships are available without extra queries.
"""

from typing import Optional

from sqlalchemy.orm import Session, joinedload

from models.company import Company
from models.placement_record import PlacementRecord
from models.activity_log import ActivityLog
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


def get_user_placement_records_paginated(
    db: Session,
    user_id: int,
    page: int = 1,
    limit: int = 10,
) -> tuple[list[PlacementRecord], int]:
    """
    Return a page of placement records for *user_id* with the total count.

    Returns a tuple of ``(items, total_count)``.
    """
    base = db.query(PlacementRecord).filter(PlacementRecord.user_id == user_id)
    total = base.count()
    items = (
        base
        .options(joinedload(PlacementRecord.company), joinedload(PlacementRecord.rounds))
        .order_by(PlacementRecord.id)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return items, total


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


def get_company_placement_records(
    db: Session,
    company_id: int,
) -> list[PlacementRecord]:
    """Return all placement records for a given company (across all users)."""
    return (
        db.query(PlacementRecord)
        .options(joinedload(PlacementRecord.rounds))
        .filter(PlacementRecord.company_id == company_id)
        .order_by(PlacementRecord.created_at.desc())
        .all()
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
    # Log activity
    db.add(ActivityLog(
        user_id=user_id,
        action_type="record_added",
        entity_id=record.id,
        description=f"Added placement record for {record.role_applied}",
    ))
    db.commit()
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
    # Log activity
    db.add(ActivityLog(
        user_id=db_record.user_id,
        action_type="record_updated",
        entity_id=db_record.id,
        description=f"Updated placement record for {db_record.role_applied}",
    ))
    db.commit()
    return get_placement_record(db, db_record.id)  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# DELETE
# ---------------------------------------------------------------------------

def delete_placement_record(db: Session, db_record: PlacementRecord) -> None:
    """Hard-delete a placement record row (cascades to rounds)."""
    user_id = db_record.user_id
    record_id = db_record.id
    role = db_record.role_applied
    db.delete(db_record)
    db.commit()
    # Log activity
    db.add(ActivityLog(
        user_id=user_id,
        action_type="record_deleted",
        entity_id=record_id,
        description=f"Deleted placement record for {role}",
    ))
    db.commit()
