"""Async database setup for Neon PostgreSQL or SQLite (local testing)."""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlmodel import SQLModel

from app.config import get_settings

settings = get_settings()

# Determine engine settings based on database type
db_url = settings.DATABASE_URL
is_sqlite = db_url.startswith("sqlite")

# Create async engine with appropriate settings
if is_sqlite:
    # SQLite for local testing
    engine = create_async_engine(
        db_url,
        echo=False,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL/Neon with optimized settings
    engine = create_async_engine(
        db_url,
        echo=False,
        pool_recycle=300,  # Matches Neon auto-suspend timeout
        pool_pre_ping=True,  # Handles connection drops
    )

# Async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db() -> None:
    """Create all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncSession:
    """Dependency for getting async database session."""
    async with async_session_maker() as session:
        yield session
