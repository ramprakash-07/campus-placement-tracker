"""
Admin seed script — creates a default admin user from env vars.

Usage:
    python init_db.py

Reads ADMIN_EMAIL and ADMIN_PASSWORD from the environment (or .env file).
If ADMIN_EMAIL is empty, the script is a no-op.
If the admin user already exists, the script skips creation.
"""

from core.config import settings
from core.security import hash_password
from db.database import SessionLocal, engine, Base
from models.user import User, UserRole

# Import all models so Base.metadata knows about every table
import models  # noqa: F401


def seed_admin():
    """Create the default admin user if it doesn't already exist."""
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        print("[SEED] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed.")
        return

    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if existing:
            print(f"[SEED] Admin user '{settings.ADMIN_EMAIL}' already exists — skipping.")
            return

        admin = User(
            email=settings.ADMIN_EMAIL,
            full_name="Admin",
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        print(f"[SEED] Admin user '{settings.ADMIN_EMAIL}' created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
