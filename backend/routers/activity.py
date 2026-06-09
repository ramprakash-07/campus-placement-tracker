"""
Activity router — user activity feed endpoint.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from db.database import get_db
from models.activity_log import ActivityLog
from models.user import User

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.get("")
def get_activity_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current user's last 20 actions, newest first."""
    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": log.id,
            "action_type": log.action_type,
            "entity_id": log.entity_id,
            "description": log.description,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]
