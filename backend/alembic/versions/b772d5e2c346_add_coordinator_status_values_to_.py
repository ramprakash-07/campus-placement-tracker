"""add coordinator status values to placement_status enum

Revision ID: b772d5e2c346
Revises: e94b11046fcc
Create Date: 2026-05-21 22:16:18.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b772d5e2c346'
down_revision: Union[str, Sequence[str], None] = 'e94b11046fcc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add coordinator_approved and coordinator_rejected to placement_status enum."""
    op.execute("ALTER TYPE placement_status ADD VALUE IF NOT EXISTS 'coordinator_approved'")
    op.execute("ALTER TYPE placement_status ADD VALUE IF NOT EXISTS 'coordinator_rejected'")


def downgrade() -> None:
    """PostgreSQL does not support removing values from an enum type.
    
    To fully downgrade, you would need to:
    1. Create a new enum type without the values
    2. Alter the column to use the new type
    3. Drop the old type
    
    This is intentionally left as a no-op for safety.
    """
    pass
