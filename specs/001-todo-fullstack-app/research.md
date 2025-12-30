# Research Document: Todo Full-Stack Web Application

**Feature**: 001-todo-fullstack-app
**Date**: 2025-12-29
**Branch**: `001-todo-fullstack-app`

## Summary

This research document resolves all technical unknowns for implementing a full-stack todo application with Better Auth (JWT), FastAPI backend, and Next.js frontend.

---

## Decision 1: Better Auth JWT Verification in FastAPI

### Decision
Use JWKS-based JWT verification with PyJWT library. The backend fetches public keys from Better Auth's `/api/auth/jwks` endpoint.

### Rationale
- Better Auth uses EdDSA (Ed25519) by default for JWT signing
- JWKS endpoint provides automatic key rotation support
- No shared secret needed between frontend and backend - verification uses public keys
- Industry-standard approach following OAuth 2.0/OIDC best practices

### Alternatives Considered
1. **Shared secret (HS256)**: Rejected - requires BETTER_AUTH_SECRET on backend, less secure
2. **Manual public key configuration**: Rejected - doesn't support key rotation

### Implementation Pattern

```python
# Backend JWT verification using JWKS
import jwt
from fastapi import Depends, HTTPException, Header

class BetterAuthJWTVerifier:
    def __init__(self, jwks_url: str, issuer: str, audience: str):
        self.jwks_client = jwt.PyJWKClient(jwks_url)
        self.issuer = issuer
        self.audience = audience

    def __call__(self, authorization: str | None = Header(default=None)) -> dict:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing authorization")

        token = authorization.split("Bearer ")[1]
        signing_key = self.jwks_client.get_signing_key_from_jwt(token)

        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA"],
            issuer=self.issuer,
            audience=self.audience
        )
        return claims
```

### Environment Variables (Backend)

```env
BETTER_AUTH_JWKS_URL=http://localhost:3000/api/auth/jwks
BETTER_AUTH_ISSUER=http://localhost:3000
BETTER_AUTH_AUDIENCE=http://localhost:3000
```

---

## Decision 2: SQLModel with Neon PostgreSQL

### Decision
Use SQLModel with asyncpg driver for async database operations. Connect via Neon's pooled connection string with SSL required.

### Rationale
- SQLModel combines Pydantic validation with SQLAlchemy ORM
- Async operations improve FastAPI concurrency
- Neon's connection pooling (PgBouncer) handles serverless scaling
- Pool recycle of 300s matches Neon's auto-suspend timeout

### Alternatives Considered
1. **Synchronous psycopg**: Rejected - limits FastAPI concurrency
2. **Direct SQLAlchemy**: Rejected - SQLModel provides cleaner Pydantic integration
3. **Drizzle ORM**: Rejected - not Python, spec requires SQLModel

### Implementation Pattern

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, Field, Relationship

# Models
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    tasks: list["Task"] = Relationship(back_populates="user")

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=500)
    user_id: int = Field(foreign_key="user.id", index=True)
    user: User | None = Relationship(back_populates="tasks")

# Engine setup
async_engine = create_async_engine(
    DATABASE_URL,
    connect_args={"ssl": "require"},
    pool_recycle=300,
    pool_pre_ping=True
)
```

### Environment Variables (Backend)

```env
# Use pooled connection string (note -pooler suffix)
DATABASE_URL=postgresql+asyncpg://user:pass@ep-xxx-pooler.neon.tech/dbname?ssl=require
```

---

## Decision 3: Better Auth Configuration in Next.js

### Decision
Use Better Auth with JWT plugin and Bearer token plugin. Store Bearer token in localStorage for API client usage.

### Rationale
- Better Auth provides native Next.js App Router support
- JWT plugin allows external API authentication
- Bearer plugin enables token-based API calls
- JWKS endpoint exposes public keys for backend verification

### Alternatives Considered
1. **NextAuth.js**: Rejected - Better Auth specified in requirements
2. **Cookie-only sessions**: Rejected - need JWT for separate backend
3. **Custom JWT implementation**: Rejected - Better Auth handles complexity

### Implementation Pattern

```typescript
// lib/auth.ts (Server)
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  plugins: [
    bearer(),
    jwt({
      jwt: {
        expirationTime: "1h",
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email
        })
      }
    })
  ]
});

// lib/auth-client.ts (Client)
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [jwtClient()]
});

// Get JWT for external API
const { data } = await authClient.token();
const jwtToken = data.token;
```

### Environment Variables (Frontend)

```env
BETTER_AUTH_SECRET=<32-character-minimum-secret>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@host/db
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Decision 4: Frontend-Backend Authentication Flow

### Decision
Frontend issues JWT via Better Auth, attaches to Authorization header. Backend verifies via JWKS, extracts user_id from claims.

### Rationale
- Stateless authentication - backend doesn't store sessions
- User identity derived from JWT claims only
- Follows security requirement: never trust user_id from request body
- CORS configured to allow frontend origin

### Flow Diagram

```text
1. User logs in → Better Auth (Next.js)
2. Better Auth issues JWT → Stored in client
3. API request → Authorization: Bearer <jwt>
4. FastAPI middleware → Fetches JWKS from Next.js
5. Verifies JWT → Extracts user_id from 'sub' claim
6. Database query → WHERE user_id = jwt.sub
7. Response → JSON to frontend
```

---

## Decision 5: Monorepo Structure

### Decision
Single repository with `/frontend` and `/backend` directories. Shared environment at root, separate configs per app.

### Rationale
- Single Claude Code context for full-stack development
- Shared specs directory at root
- Independent deployment of frontend/backend
- Matches constitution's mandatory monorepo structure

### Structure

```text
/
├── frontend/           # Next.js 16+ App Router
│   ├── app/
│   ├── lib/
│   └── package.json
├── backend/            # FastAPI + SQLModel
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── specs/              # Spec-Kit Plus specifications
│   └── 001-todo-fullstack-app/
├── .env.example        # Shared environment template
└── CLAUDE.md           # Root development guidance
```

---

## Decision 6: API Endpoint Design

### Decision
RESTful API at `/api/v1/tasks` with standard CRUD operations. All endpoints require JWT authentication.

### Rationale
- REST provides clear, predictable patterns
- Version prefix allows future API evolution
- Consistent with spec requirements (FR-012)
- Standard HTTP status codes per constitution

### Endpoint Summary

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/v1/tasks | Create task | Required |
| GET | /api/v1/tasks | List user's tasks | Required |
| GET | /api/v1/tasks/{id} | Get single task | Required |
| PUT | /api/v1/tasks/{id} | Update task | Required |
| DELETE | /api/v1/tasks/{id} | Delete task | Required |
| PATCH | /api/v1/tasks/{id}/complete | Toggle completion | Required |

---

## Dependencies Summary

### Backend (Python)
```
fastapi>=0.109.0
uvicorn>=0.27.0
sqlmodel>=0.0.14
asyncpg>=0.29.0
pyjwt[crypto]>=2.8.0
python-dotenv>=1.0.0
httpx>=0.26.0
```

### Frontend (Node.js)
```
next@16.x
better-auth
typescript
tailwindcss
```

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| JWKS endpoint unavailable | Implement retry with exponential backoff |
| Neon cold start latency | pool_pre_ping=True, connection timeout handling |
| JWT expiration during editing | Frontend handles 401 with re-auth prompt |
| CORS misconfiguration | Explicit origin allowlist, test early |

---

## References

- Better Auth Documentation: https://www.better-auth.com/docs
- SQLModel Documentation: https://sqlmodel.tiangolo.com/
- Neon Connection Guide: https://neon.tech/docs/connect
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
- PyJWT Documentation: https://pyjwt.readthedocs.io/
