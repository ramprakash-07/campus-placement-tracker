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

    # Create action_type enum (idempotent)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE action_type AS ENUM (
                'record_added', 'round_added', 'record_updated', 'record_deleted'
            );
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # Activity logs table
    op.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            action_type action_type NOT NULL,
            entity_id INTEGER,
            description TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT now()
        );
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_activity_logs_id ON activity_logs(id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_activity_logs_user_id ON activity_logs(user_id);")


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
