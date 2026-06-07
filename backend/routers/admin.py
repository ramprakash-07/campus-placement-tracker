"""
Admin router — admin-only endpoints for platform management.

All routes require the admin role via ``get_current_admin`` dependency.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.dependencies import get_current_admin
from db.database import get_db
from models.company import Company
from models.placement_record import PlacementRecord
from models.round import Round
from models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin)],
)


# ---------------------------------------------------------------------------
# GET /admin/users — list all users with record counts
# ---------------------------------------------------------------------------
@router.get("/users")
def list_all_users(db: Session = Depends(get_db)):
    """Return all users with their placement record counts."""
    users = db.query(User).order_by(User.id).all()
    result = []
    for user in users:
        record_count = (
            db.query(func.count(PlacementRecord.id))
            .filter(PlacementRecord.user_id == user.id)
            .scalar()
        )
        result.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "created_at": user.created_at.isoformat(),
            "records_count": record_count,
        })
    return result


# ---------------------------------------------------------------------------
# GET /admin/stats — platform-wide stats
# ---------------------------------------------------------------------------
@router.get("/stats")
def platform_stats(db: Session = Depends(get_db)):
    """Return platform-wide statistics."""
    total_users = db.query(func.count(User.id)).scalar()
    total_records = db.query(func.count(PlacementRecord.id)).scalar()
    total_rounds = db.query(func.count(Round.id)).scalar()
    total_companies = db.query(func.count(Company.id)).scalar()
    avg_package = db.query(func.avg(PlacementRecord.ctc_offered)).scalar()

    return {
        "total_users": total_users,
        "total_records": total_records,
        "total_rounds": total_rounds,
        "total_companies": total_companies,
        "avg_package": float(avg_package) if avg_package else 0,
    }


# ---------------------------------------------------------------------------
# DELETE /admin/users/{id} — delete user (cascade)
# ---------------------------------------------------------------------------
@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user and all their data (cascades to records → rounds)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    db.delete(user)
    db.commit()
