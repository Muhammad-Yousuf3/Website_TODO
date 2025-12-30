<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: N/A (initial) → v1.0.0
Modified Principles: None (initial creation)
Added Sections:
  - Core Principles (6 principles)
  - Architecture Rules
  - Quality & Change Management
  - Governance
Removed Sections: None (initial creation)
Templates Requiring Updates:
  - .specify/templates/plan-template.md ✅ reviewed - compatible
  - .specify/templates/spec-template.md ✅ reviewed - compatible
  - .specify/templates/tasks-template.md ✅ reviewed - compatible
Follow-up TODOs: None
================================================================================
-->

# Phase II – Todo Full-Stack Web Application Constitution

## Core Principles

### I. Spec-First Development

All implementation MUST be preceded by a written specification in `/specs`.

- Every feature MUST map to a spec in `/specs` before any code is written
- The `/specs` directory is the single source of truth for all system behavior
- Backend routes MUST match documented endpoints exactly
- Database schema MUST match `specs/database/schema.md`
- All code MUST follow rules defined in `CLAUDE.md` files
- No implementation is permitted outside written specs

**Rationale**: Specifications provide auditability, reproducibility, and clear contracts between stakeholders. Without specs, implementations become unverifiable.

### II. Agentic Dev Stack Discipline

All features MUST follow the sequential workflow: Spec → Plan → Tasks → Implementation.

- The workflow order is mandatory and MUST NOT be skipped
- Each stage MUST produce artifacts before proceeding to the next
- Plans MUST reference their source spec
- Tasks MUST reference their source plan
- Implementation MUST reference its source tasks

**Rationale**: The disciplined workflow ensures traceability from requirements to code and enables deterministic regeneration of the codebase.

### III. Zero Manual Coding

All production code MUST be generated via Claude Code.

- No manual code edits are permitted
- All prompts MUST be auditable via Prompt History Records (PHRs)
- No silent assumptions; all decisions MUST be documented
- No scope creep; only implement what is specified
- Reviewers MUST be able to audit specs, prompts, and workflow clearly

**Rationale**: Agentic development requires reproducibility. Manual edits break the regeneration guarantee and create untracked divergence.

### IV. Security by Default

Authentication and authorization MUST be enforced on all protected resources.

- All API endpoints MUST require a valid JWT token
- Missing or invalid tokens MUST return 401 Unauthorized
- Backend MUST extract user identity from JWT only
- Backend MUST NEVER trust `user_id` from request body or params
- Task ownership MUST be enforced for all operations (read, update, delete)
- Frontend API calls MUST attach `Authorization: Bearer <JWT>` header
- No hardcoded secrets; all credentials via environment variables
- Shared JWT secret via `BETTER_AUTH_SECRET` environment variable

**Rationale**: Multi-user applications require strict user isolation. Trusting client-provided identity enables trivial privilege escalation attacks.

### V. Deterministic Reproducibility

All outputs MUST be deterministic and reproducible from specs alone.

- The project MUST be fully regenerable using specs alone
- Given the same specs and prompts, the output MUST be consistent
- All behavior changes MUST update the relevant spec first
- No patching or hot-fixing without spec updates
- Reference updated spec explicitly before re-implementation

**Rationale**: Determinism enables validation, debugging, and confidence in the agentic development process.

### VI. Technology Constraints

Only the following technologies are permitted:

**Frontend**:
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
- Better Auth (JWT authentication)

**Backend**:
- FastAPI
- SQLModel

**Database**:
- Neon Serverless PostgreSQL

**Authentication**:
- Better Auth on frontend
- JWT verification on backend

- No undocumented libraries or speculative features
- No implementation using technologies outside this list
- Frontend MUST NEVER access database directly

**Rationale**: Constrained technology choices reduce complexity, ensure team familiarity, and prevent architectural drift.

## Architecture Rules

### Monorepo Structure (Mandatory)

```text
/frontend    Next.js 16+ (App Router)
/backend     FastAPI + SQLModel
/specs       Spec-Kit managed specifications
```

### Authentication Architecture

- Frontend handles authentication via Better Auth
- Backend verifies JWT tokens on every protected route
- Shared JWT secret via `BETTER_AUTH_SECRET` environment variable
- Frontend never accesses database directly; all data flows through backend API

### API Standards

- REST API MUST follow documented endpoints exactly
- API responses MUST be consistent and JSON-based
- Proper HTTP status codes for all errors:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Internal Server Error

## Quality & Change Management

### Quality Standards

- All acceptance criteria in specs MUST be satisfied
- Database operations MUST be safe and scoped per user
- Code MUST be readable, structured, and spec-aligned
- All implemented features MUST map to a spec in `/specs`

### Change Management Protocol

1. If behavior changes, update the relevant spec FIRST
2. Reference the updated spec explicitly before re-implementation
3. No patching or hot-fixing without spec updates
4. Document all changes via PHRs

### Validation Checklist

- [ ] Feature maps to spec in `/specs`
- [ ] All acceptance criteria satisfied
- [ ] API responses are JSON and consistent
- [ ] HTTP status codes are correct
- [ ] Database operations are user-scoped
- [ ] JWT authentication is verified
- [ ] No hardcoded secrets

## Governance

This constitution supersedes all other development practices for this project.

### Amendment Procedure

1. Propose amendment with rationale
2. Document change in constitution
3. Update version number per semantic versioning
4. Update dependent templates if affected
5. Record amendment via PHR

### Versioning Policy

- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review

- All PRs MUST verify compliance with this constitution
- Complexity MUST be justified per constitution principles
- Use `CLAUDE.md` files for runtime development guidance

### Non-Negotiables

- Specs are law
- Prompts are auditable
- No manual code edits
- No silent assumptions
- No scope creep

### Success Criteria (Phase II)

- [ ] All Phase II Basic Level features implemented end-to-end
- [ ] Multi-user isolation fully enforced
- [ ] JWT authentication verified on backend
- [ ] Frontend and backend integrated correctly
- [ ] Project can be regenerated using specs alone
- [ ] Reviewer can audit specs, prompts, and workflow clearly

**Version**: 1.0.0 | **Ratified**: 2025-12-28 | **Last Amended**: 2025-12-28
