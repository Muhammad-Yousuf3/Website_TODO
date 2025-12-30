"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import health_router, tasks_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup: create database tables
    await init_db()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Todo API",
    description="Task management API for the Todo Full-Stack Application",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration - combine main frontend URL with additional origins
allowed_origins = [settings.FRONTEND_URL] + settings.ALLOWED_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(tasks_router)
