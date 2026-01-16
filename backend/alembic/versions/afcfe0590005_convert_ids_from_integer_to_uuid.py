"""Convert IDs from Integer to UUID

Revision ID: afcfe0590005
Revises:
Create Date: 2026-01-16 01:10:05.405773

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'afcfe0590005'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop existing tables if they exist (for fresh UUID setup)
    op.execute('DROP TABLE IF EXISTS payment_submissions CASCADE')
    op.execute('DROP TABLE IF EXISTS categories CASCADE')
    op.execute('DROP TABLE IF EXISTS users CASCADE')

    # Create users table with UUID
    op.create_table('users',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create categories table with UUID
    op.create_table('categories',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('admin_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('amount_expected', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('public_token', sa.String(length=64), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['admin_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('public_token')
    )
    op.create_index(op.f('ix_categories_admin_id'), 'categories', ['admin_id'], unique=False)
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_public_token'), 'categories', ['public_token'], unique=False)

    # Create payment_submissions table with UUID
    op.create_table('payment_submissions',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('student_name', sa.String(length=255), nullable=False),
    sa.Column('student_phone', sa.String(length=20), nullable=False),
    sa.Column('amount_paid', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('receipt_url', sa.Text(), nullable=False),
    sa.Column('status', sa.Enum('PENDING', 'CONFIRMED', 'REJECTED', name='submissionstatus'), nullable=False),
    sa.Column('admin_note', sa.Text(), nullable=True),
    sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('reviewed_by', postgresql.UUID(as_uuid=True), nullable=True),
    sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payment_submissions_category_id'), 'payment_submissions', ['category_id'], unique=False)
    op.create_index(op.f('ix_payment_submissions_id'), 'payment_submissions', ['id'], unique=False)
    op.create_index(op.f('ix_payment_submissions_status'), 'payment_submissions', ['status'], unique=False)


def downgrade() -> None:
    # Drop all tables
    op.drop_table('payment_submissions')
    op.drop_table('categories')
    op.drop_table('users')
