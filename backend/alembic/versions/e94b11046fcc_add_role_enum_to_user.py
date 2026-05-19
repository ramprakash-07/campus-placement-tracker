"""add role enum to user

Revision ID: e94b11046fcc
Revises: bad474440027
Create Date: 2026-05-19 18:43:07.829349

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e94b11046fcc'
down_revision: Union[str, Sequence[str], None] = 'bad474440027'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Define the enum type so it can be created/dropped explicitly
userrole_enum = sa.Enum('student', 'coordinator', name='userrole')


def upgrade() -> None:
    """Upgrade schema."""
    # Create the PostgreSQL enum type first
    userrole_enum.create(op.get_bind(), checkfirst=True)
    # Then add the column referencing it
    op.add_column('users', sa.Column('role', userrole_enum, server_default='student', nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')
    # Drop the enum type after the column is gone
    userrole_enum.drop(op.get_bind(), checkfirst=True)

