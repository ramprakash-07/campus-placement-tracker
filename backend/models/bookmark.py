"""
Bookmark model — allows users to bookmark/wishlist companies.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from db.database import Base


class Bookmark(Base):
    """Represents a user's bookmark of a company."""

    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "company_id", name="uq_user_company_bookmark"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ────────────────────────────────────────────────────
    user = relationship("User", backref="bookmarks")
    company = relationship("Company", backref="bookmarks")

    def __repr__(self) -> str:
        return f"<Bookmark id={self.id} user={self.user_id} company={self.company_id}>"
