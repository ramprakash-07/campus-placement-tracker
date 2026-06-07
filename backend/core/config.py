"""
Application configuration using Pydantic BaseSettings.

All secrets and environment-specific values are loaded from environment
variables (or a .env file). Nothing is hardcoded.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration for the Campus Placement Tracker backend.

    Values are read from environment variables first; if not found, the
    defaults specified here are used.  A ``.env`` file in the project
    root (backend/) is also loaded automatically.
    """

    # --- Database -----------------------------------------------------------
    DATABASE_URL: str  # required — no default so the app fails fast if missing

    # --- Authentication / JWT -----------------------------------------------
    SECRET_KEY: str  # required — must be set in .env or env vars
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # --- CORS ----------------------------------------------------------------
    FRONTEND_URL: str = "http://localhost:5173"

    # --- Coordinator invite code ---------------------------------------------
    COORDINATOR_INVITE_CODE: str = ""

    # --- SMTP / Email --------------------------------------------------------
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_FROM_NAME: str = "Campus Placement Tracker"

    # --- Admin seed -----------------------------------------------------------
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Singleton instance — import this wherever you need config values.
settings = Settings()
