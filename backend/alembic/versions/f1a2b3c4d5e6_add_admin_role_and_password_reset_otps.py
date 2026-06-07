"""add admin role and password_reset_otps table

Revision ID: f1a2b3c4d5e6
Revises: b772d5e2c346
Create Date: 2026-06-07 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'b772d5e2c346'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add 'admin' value to userrole enum and create password_reset_otps table."""
    # Add 'admin' to the userrole enum
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'admin'")

    # Create password_reset_otps table
    op.create_table(
        'password_reset_otps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('otp', sa.String(length=6), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_password_reset_otps_email'), 'password_reset_otps', ['email'])
    op.create_index(op.f('ix_password_reset_otps_id'), 'password_reset_otps', ['id'])


def downgrade() -> None:
    """Drop password_reset_otps table. Cannot remove enum value in PostgreSQL."""
    op.drop_index(op.f('ix_password_reset_otps_id'), table_name='password_reset_otps')
    op.drop_index(op.f('ix_password_reset_otps_email'), table_name='password_reset_otps')
    op.drop_table('password_reset_otps')
