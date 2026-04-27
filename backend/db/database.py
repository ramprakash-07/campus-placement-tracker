"""
PostgreSQL database connection and session management.

Uses SQLAlchemy to create an engine from the DATABASE_URL defined in
core.config.  Provides:
    - ``engine``        – the SQLAlchemy engine bound to PostgreSQL
    - ``SessionLocal``  – a configured session factory
    - ``Base``          – declarative base for ORM models
    - ``get_db()``      – FastAPI dependency that yields a DB session
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from core.config import settings

# ---------------------------------------------------------------------------
# Engine & session factory
# ---------------------------------------------------------------------------
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # verify connections before handing them out
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ---------------------------------------------------------------------------
# Declarative base for all ORM models
# ---------------------------------------------------------------------------
Base = declarative_base()


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------
def get_db():
    """
    Yield a SQLAlchemy session and ensure it is closed after the request.

    Usage::

        @app.get("/items")
        def list_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
