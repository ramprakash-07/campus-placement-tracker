"""
Alembic environment configuration.

Imports the SQLAlchemy Base and all ORM models so that ``--autogenerate``
can detect schema changes.  The database URL is pulled from the application
settings (core.config) instead of being hardcoded in alembic.ini.
"""

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# ---------------------------------------------------------------------------
# Application imports
# ---------------------------------------------------------------------------
from core.config import settings          # loads DATABASE_URL from .env
from db.database import Base              # declarative base with metadata

# Import every model so Base.metadata knows about all tables.
import models  # noqa: F401  (models/__init__.py re-exports everything)

# ---------------------------------------------------------------------------
# Alembic Config object — gives access to alembic.ini values
# ---------------------------------------------------------------------------
config = context.config

# Override the sqlalchemy.url from alembic.ini with the app's DATABASE_URL
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# MetaData object for 'autogenerate' support
target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Offline migrations (generate SQL without a live DB connection)
# ---------------------------------------------------------------------------
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online migrations (with a live DB connection)
# ---------------------------------------------------------------------------
def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
