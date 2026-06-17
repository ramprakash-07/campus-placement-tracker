"""
Startup migration runner — runs Alembic migrations before the app starts.

Usage (in deployment start command):
    python alembic_run.py && uvicorn main:app --host 0.0.0.0 --port $PORT

This script:
1. Runs ``alembic upgrade head`` to apply pending migrations.
2. Runs ``init_db.seed_admin()`` to ensure the admin user exists.
"""

import subprocess
import sys


def run_migrations():
    """Execute Alembic migrations."""
    print("[DEPLOY] Running Alembic migrations...")
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        capture_output=True,
        text=True,
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"[DEPLOY] Migration failed:\n{result.stderr}")
        sys.exit(1)
    print("[DEPLOY] Migrations complete.")


def seed_admin():
    """Seed the admin user if configured."""
    print("[DEPLOY] Seeding admin user...")
    from init_db import seed_admin as _seed_admin
    _seed_admin()
    print("[DEPLOY] Admin seed complete.")


if __name__ == "__main__":
    run_migrations()
    seed_admin()
    print("[DEPLOY] Startup tasks finished successfully.")
