"""
Bookmark router — toggle and list bookmarked companies.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from core.dependencies import get_current_user
from db.database import get_db
from models.bookmark import Bookmark
from models.company import Company
from models.user import User

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])


@router.post("")
def toggle_bookmark(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Toggle a bookmark. Creates if missing, deletes if exists.
    Returns {"bookmarked": true/false}.
    """
    existing = (
        db.query(Bookmark)
        .filter(
            Bookmark.user_id == current_user.id,
            Bookmark.company_id == company_id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False}
    else:
        bookmark = Bookmark(user_id=current_user.id, company_id=company_id)
        db.add(bookmark)
        db.commit()
        return {"bookmarked": True}


@router.get("")
def list_bookmarks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all bookmarked companies for the current user."""
    bookmarks = (
        db.query(Bookmark)
        .options(joinedload(Bookmark.company))
        .filter(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
        .all()
    )
    return [
        {
            "id": b.company.id,
            "name": b.company.name,
            "sector": b.company.sector,
            "website": b.company.website,
            "created_at": b.company.created_at.isoformat() if b.company.created_at else None,
            "bookmarked_at": b.created_at.isoformat(),
        }
        for b in bookmarks
        if b.company
    ]
