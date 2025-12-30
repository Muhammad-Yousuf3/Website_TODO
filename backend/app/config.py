"""Environment configuration for the backend application."""

import os
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables from root .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"))


def _get_async_database_url() -> str:
    """Convert database URL to async format for asyncpg."""
    url = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/dbname")

    # Convert postgresql:// to postgresql+asyncpg://
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Convert sslmode=require to ssl=require for asyncpg
    if "sslmode=require" in url:
        url = url.replace("sslmode=require", "ssl=require")

    # Remove channel_binding parameter (not supported by asyncpg)
    if "&channel_binding=require" in url:
        url = url.replace("&channel_binding=require", "")
    if "?channel_binding=require&" in url:
        url = url.replace("?channel_binding=require&", "?")

    return url


class Settings:
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = _get_async_database_url()

    # JWT Verification (Better Auth)
    JWKS_URL: str = os.getenv(
        "BETTER_AUTH_JWKS_URL",
        "http://localhost:3000/api/auth/jwks"
    )
    JWT_ISSUER: str = os.getenv(
        "BETTER_AUTH_ISSUER",
        "http://localhost:3000"
    )
    JWT_AUDIENCE: str = os.getenv(
        "BETTER_AUTH_AUDIENCE",
        "http://localhost:3000"
    )

    # CORS - supports multiple origins for dev and production
    FRONTEND_URL: str = os.getenv(
        "BETTER_AUTH_URL",
        "http://localhost:3000"
    )

    # Additional allowed origins (comma-separated)
    ALLOWED_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
        if origin.strip()
    ]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
