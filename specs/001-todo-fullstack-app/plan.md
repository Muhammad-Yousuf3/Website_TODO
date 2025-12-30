# Implementation Plan: Todo Full-Stack Web Application

**Branch**: `001-todo-fullstack-app` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-fullstack-app/spec.md`

---

## Summary

Transform a console-based todo application into a secure, multi-user full-stack web application using:
- **Frontend**: Next.js 16+ (App Router), Better Auth (JWT), Tailwind CSS
- **Backend**: FastAPI, SQLModel, JWT verification via JWKS
- **Database**: Neon Serverless PostgreSQL

Key technical approach: Better Auth issues JWTs on frontend, backend verifies via JWKS endpoint, user_id extracted from JWT claims only (never from request body). Strict task ownership enforcement on all operations.

---

## Technical Context

**Language/Version**: Python 3.9+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, PyJWT, asyncpg
- Frontend: Next.js 16+, Better Auth, Tailwind CSS

**Storage**: Neon Serverless PostgreSQL (pooled connection)
**Testing**: pytest (backend), Jest/Playwright (frontend - optional)
**Target Platform**: Web application (modern browsers)
**Project Type**: Web (frontend + backend monorepo)
**Performance Goals**:
- SC-001: Registration/login < 60 seconds
- SC-002: Task creation < 10 seconds
- SC-003: 100 concurrent users

**Constraints**:
- All API requests require JWT authentication
- User identity from JWT only (never trust client)
- No manual code edits (agentic development)

**Scale/Scope**:
- 2 entities (User, Task)
- 6 API endpoints
- 5-6 frontend pages

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-First Development | PASS | spec.md created before planning |
| II. Agentic Dev Stack Discipline | PASS | Following Spec → Plan → Tasks workflow |
| III. Zero Manual Coding | PASS | All code via Claude Code |
| IV. Security by Default | PASS | JWT required, ownership enforced |
| V. Deterministic Reproducibility | PASS | Specs drive implementation |
| VI. Technology Constraints | PASS | Only permitted technologies used |

**Gate Result**: PASS - Proceed to implementation planning

---

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-fullstack-app/
├── spec.md              # Feature specification
├── plan.md              # This file (Phase 0-1 output)
├── research.md          # Technical research findings
├── data-model.md        # Entity definitions
├── quickstart.md        # Development setup guide
├── contracts/           # API contracts
│   ├── openapi.yaml     # OpenAPI 3.1 specification
│   └── api-summary.md   # Human-readable API summary
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Implementation tasks (/sp.tasks output)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Environment configuration
│   ├── database.py          # Database connection setup
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User SQLModel
│   │   └── task.py          # Task SQLModel
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic request/response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py        # Health check endpoint
│   │   └── tasks.py         # Task CRUD endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py  # Task business logic
│   └── auth/
│       ├── __init__.py
│       └── jwt_verifier.py  # Better Auth JWT verification
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Test fixtures
│   └── test_tasks.py        # Task endpoint tests
└── requirements.txt

frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing/redirect page
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   └── register/
│   │       └── page.tsx     # Registration page
│   ├── (dashboard)/
│   │   ├── layout.tsx       # Protected layout (auth check)
│   │   └── tasks/
│   │       └── page.tsx     # Task dashboard
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts # Better Auth API handler
├── components/
│   ├── ui/                  # UI primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   └── tasks/
│       ├── task-list.tsx
│       ├── task-item.tsx
│       ├── task-form.tsx
│       └── task-actions.tsx
├── lib/
│   ├── auth.ts              # Better Auth server config
│   ├── auth-client.ts       # Better Auth client config
│   └── api-client.ts        # API client with JWT
├── middleware.ts            # Route protection (or proxy.ts for Next.js 16)
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json

.env.example                 # Environment template
.gitignore
CLAUDE.md                    # Root development guidance
frontend/CLAUDE.md           # Frontend-specific guidance
backend/CLAUDE.md            # Backend-specific guidance
```

**Structure Decision**: Web application structure selected. Frontend and backend are separate packages in a monorepo, with shared specs at root level.

---

## Architecture Overview

### System Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (User)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16+)                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   Better Auth   │  │   App Router     │  │  API Client   │  │
│  │  (JWT Plugin)   │  │  (Pages/Layout)  │  │  (fetch+JWT)  │  │
│  └────────┬────────┘  └──────────────────┘  └───────┬───────┘  │
│           │ JWT issued                              │           │
│           ▼                                         │           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              /api/auth/jwks (JWKS endpoint)             │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ Authorization: Bearer <jwt>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                            │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  JWT Verifier   │  │   Task Router    │  │ Task Service  │  │
│  │ (PyJWT + JWKS)  │◄─┤  (Depends auth)  │──┤ (Business)    │  │
│  └────────┬────────┘  └──────────────────┘  └───────┬───────┘  │
│           │ Fetches public keys                     │           │
│           ▼                                         ▼           │
│  ┌─────────────────┐                    ┌───────────────────┐  │
│  │  Frontend JWKS  │                    │   SQLModel ORM    │  │
│  │   (HTTP GET)    │                    │  (async queries)  │  │
│  └─────────────────┘                    └─────────┬─────────┘  │
└────────────────────────────────────────────────────┼────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Neon Serverless PostgreSQL                      │
│  ┌─────────────────┐            ┌──────────────────────────┐   │
│  │   user table    │◄───────────┤      task table          │   │
│  │  (Better Auth)  │ 1        * │  (user_id foreign key)   │   │
│  └─────────────────┘            └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Authentication**:
   - User submits login form → Better Auth (frontend)
   - Better Auth validates credentials → Issues JWT
   - JWT stored in client (localStorage or cookie)

2. **API Request**:
   - Frontend makes API call with `Authorization: Bearer <jwt>`
   - FastAPI JWT verifier fetches JWKS from frontend
   - JWT verified, user_id extracted from `sub` claim
   - Database query scoped to `WHERE user_id = jwt.sub`

3. **Response**:
   - FastAPI returns JSON response
   - Frontend updates UI state

---

## Implementation Phases

### Phase 1: Foundation (Backend)

**Objective**: Set up backend infrastructure with database connection and JWT verification.

**Deliverables**:
- FastAPI application skeleton
- Database connection (Neon PostgreSQL)
- SQLModel models (User reference, Task)
- JWT verification dependency
- Health check endpoint

**Acceptance Criteria**:
- `/health` returns 200 OK
- Database tables created on startup
- JWT verification rejects invalid tokens

### Phase 2: Backend API

**Objective**: Implement task CRUD endpoints per OpenAPI contract.

**Deliverables**:
- Task router with all CRUD operations
- Ownership enforcement on all endpoints
- Proper HTTP status codes
- Pagination support

**Acceptance Criteria**:
- All endpoints in `contracts/openapi.yaml` implemented
- 401 for missing/invalid JWT
- 403 for accessing another user's task
- Tasks filtered by authenticated user

### Phase 3: Frontend Foundation

**Objective**: Set up Next.js with Better Auth and protected routing.

**Deliverables**:
- Next.js 16+ with App Router
- Better Auth configuration (email/password + JWT plugin)
- Protected route middleware
- Basic layout structure

**Acceptance Criteria**:
- Registration creates user account
- Login issues JWT token
- Unauthenticated users redirected to login
- JWKS endpoint accessible at `/api/auth/jwks`

### Phase 4: Frontend UI

**Objective**: Implement task management UI.

**Deliverables**:
- Login/Register pages
- Task dashboard page
- Task list component
- Task creation form
- Edit/delete/complete actions

**Acceptance Criteria**:
- All task CRUD operations via UI
- Visual feedback on status changes
- Empty state for no tasks
- Form validation (title required)

### Phase 5: Integration & Validation

**Objective**: Connect frontend to backend, validate end-to-end.

**Deliverables**:
- API client with JWT attachment
- Error handling (401 → re-auth, 403 → error message)
- End-to-end testing

**Acceptance Criteria**:
- All success criteria from spec.md validated
- Multi-user isolation verified
- No cross-user data access possible

---

## Architectural Decisions

### Decision 1: JWT Verification via JWKS

**Context**: Backend needs to verify JWTs issued by Better Auth on frontend.

**Decision**: Use JWKS endpoint for public key retrieval (not shared secret).

**Rationale**:
- Better Auth uses EdDSA by default (asymmetric)
- JWKS supports automatic key rotation
- Industry-standard approach (OAuth 2.0/OIDC)
- More secure than shared HS256 secret

**Consequences**:
- Frontend must be running for backend JWT verification
- Need to handle JWKS fetch failures gracefully
- PyJWKClient caches keys (performance benefit)

### Decision 2: User ID from JWT Only

**Context**: Need to associate tasks with users securely.

**Decision**: Extract user_id exclusively from JWT `sub` claim, never from request body.

**Rationale**:
- Prevents user impersonation attacks
- Matches constitution security requirements
- Simplifies API contract (no user_id in requests)

**Consequences**:
- Backend must validate JWT on every request
- Cannot perform operations "on behalf of" other users
- Ownership enforced at database query level

### Decision 3: Async Database Operations

**Context**: FastAPI supports async, Neon is serverless.

**Decision**: Use asyncpg driver with async SQLModel queries.

**Rationale**:
- Better concurrency under load
- Matches Neon's serverless model
- FastAPI async handlers benefit from async DB

**Consequences**:
- Need async session management
- Slightly more complex query patterns
- Better performance under concurrent load

---

## Complexity Tracking

> **No violations requiring justification**

All implementation choices follow constitution principles. The architecture uses exactly two components (frontend, backend) as required by the monorepo structure.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JWKS endpoint unreachable | Medium | High | Retry logic, graceful error handling |
| Neon cold start latency | Medium | Low | pool_pre_ping, timeout configuration |
| JWT expiration during edit | Low | Low | Frontend handles 401 with re-auth |
| CORS misconfiguration | Low | Medium | Explicit origin allowlist |
| Schema drift | Low | High | SQLModel creates tables, no manual SQL |

---

## Validation Checklist

Pre-implementation validation (after Phase 5):

- [ ] All spec.md acceptance scenarios pass
- [ ] All success criteria (SC-001 to SC-008) verified
- [ ] JWT required on all task endpoints
- [ ] Multi-user isolation tested (create 2 users, verify no cross-access)
- [ ] 403 returned for unauthorized task access
- [ ] Empty state displayed for new users
- [ ] Form validation prevents empty title
- [ ] Tasks persist across sessions
- [ ] Application regenerable from specs

---

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete |
| Data Model | [data-model.md](./data-model.md) | Complete |
| OpenAPI Contract | [contracts/openapi.yaml](./contracts/openapi.yaml) | Complete |
| API Summary | [contracts/api-summary.md](./contracts/api-summary.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |
| Tasks | tasks.md | Pending (`/sp.tasks`) |

---

## Next Steps

1. Run `/sp.tasks` to generate implementation task list
2. Follow tasks in dependency order
3. Validate against acceptance criteria after each phase
4. Create PHR for significant implementation prompts

---

## ADR Suggestions

The following architectural decisions warrant formal ADR documentation:

1. **JWT Verification Strategy** - Using JWKS vs shared secret
2. **Async Database Architecture** - Using asyncpg with SQLModel
3. **User Identity Handling** - JWT-only user identification

Run `/sp.adr <decision-title>` to create formal ADR if needed.
