# Backend Development Guide

## Overview
FastAPI backend with SQLModel ORM for the Todo Full-Stack Application.

## Tech Stack
- **Framework**: FastAPI
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon PostgreSQL (async via asyncpg)
- **Auth**: JWT verification via JWKS (Better Auth on frontend)

## Directory Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # Async database setup
│   ├── models/              # SQLModel table definitions
│   ├── schemas/             # Pydantic request/response schemas
│   ├── routers/             # API route handlers
│   ├── services/            # Business logic layer
│   └── auth/                # JWT verification
├── tests/
└── requirements.txt
```

## Key Patterns

### JWT Authentication
- All task endpoints require `Authorization: Bearer <token>`
- User ID extracted from JWT `sub` claim only
- NEVER trust user_id from request body

### Database Queries
- Always scope queries with `WHERE user_id = <jwt_user_id>`
- Use async session for all database operations
- Ownership check required before update/delete

### Error Handling
- 401: Missing/invalid JWT
- 403: Task exists but belongs to another user
- 404: Task not found (after ownership check passes)

## Running the Server
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment Variables
See root `.env.example` for required variables:
- `DATABASE_URL`: Neon PostgreSQL pooled connection
- `BETTER_AUTH_JWKS_URL`: Frontend JWKS endpoint
- `BETTER_AUTH_ISSUER`: JWT issuer (frontend URL)
- `BETTER_AUTH_AUDIENCE`: JWT audience (frontend URL)
