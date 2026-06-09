"""add bookmarks and activity_logs tables

Revision ID: a2b3c4d5e6f7
Revises: f1a2b3c4d5e6
Create Date: 2026-06-09 08:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create bookmarks and activity_logs tables."""
    # Bookmarks table
    op.create_table(
        'bookmarks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'company_id', name='uq_user_company_bookmark'),
    )
    op.create_index(op.f('ix_bookmarks_id'), 'bookmarks', ['id'])
    op.create_index(op.f('ix_bookmarks_user_id'), 'bookmarks', ['user_id'])
    op.create_index(op.f('ix_bookmarks_company_id'), 'bookmarks', ['company_id'])

    # Create action_type enum
    action_type = sa.Enum(
        'record_added', 'round_added', 'record_updated', 'record_deleted',
        name='action_type',
    )
    action_type.create(op.get_bind(), checkfirst=True)

    # Activity logs table
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('action_type', action_type, nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_activity_logs_id'), 'activity_logs', ['id'])
    op.create_index(op.f('ix_activity_logs_user_id'), 'activity_logs', ['user_id'])


def downgrade() -> None:
    """Drop bookmarks and activity_logs tables."""
    op.drop_index(op.f('ix_activity_logs_user_id'), table_name='activity_logs')
    op.drop_index(op.f('ix_activity_logs_id'), table_name='activity_logs')
    op.drop_table('activity_logs')
    sa.Enum(name='action_type').drop(op.get_bind(), checkfirst=True)
    op.drop_index(op.f('ix_bookmarks_company_id'), table_name='bookmarks')
    op.drop_index(op.f('ix_bookmarks_user_id'), table_name='bookmarks')
    op.drop_index(op.f('ix_bookmarks_id'), table_name='bookmarks')
    op.drop_table('bookmarks')
