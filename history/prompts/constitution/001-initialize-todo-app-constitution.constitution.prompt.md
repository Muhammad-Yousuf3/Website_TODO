---
id: 001
title: Initialize Todo App Constitution
stage: constitution
date: 2025-12-28
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: muhammad-yousuf
command: /sp.constitution
labels: ["constitution", "initialization", "phase-ii", "todo-app"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

/sp.constitution

Project:
Phase II – Todo Full-Stack Web Application (Spec-Driven, Agentic Development)

Core principles:
- Spec-first development (no code without a written spec)
- Single source of truth (all behavior defined in /specs)
- Agentic Dev Stack discipline: Spec → Plan → Tasks → Implementation
- Zero manual coding (all code generated via Claude Code)
- Security by default (authentication and authorization enforced everywhere)
- Deterministic and reproducible outputs from specs

Key standards:
- Every implemented feature must map to a spec in /specs
- Backend routes must require JWT authentication
- Frontend API calls must attach Authorization: Bearer <JWT>
- REST API must follow documented endpoints exactly
- Database schema must match specs/database/schema.md
- All code must follow rules defined in CLAUDE.md files

Architecture rules:
- Monorepo structure is mandatory
- /frontend: Next.js 16+ (App Router)
- /backend: FastAPI + SQLModel
- /specs: Spec-Kit managed specifications
- Frontend never accesses database directly
- Authentication handled by:
  - Better Auth on frontend
  - JWT verification on backend
- Shared JWT secret via environment variable BETTER_AUTH_SECRET

Authentication & security constraints:
- All API endpoints require a valid JWT token
- Missing or invalid token returns 401 Unauthorized
- Backend must extract user identity from JWT only
- Backend must never trust user_id from request body or params
- Task ownership enforced for all operations (read, update, delete)

Implementation constraints:
- Allowed technologies only:
  - Frontend: Next.js, TypeScript, Tailwind CSS
  - Backend: FastAPI, SQLModel
  - Database: Neon Serverless PostgreSQL
  - Auth: Better Auth with JWT
- No hardcoded secrets
- All credentials via environment variables
- No undocumented libraries or speculative features
- No implementation outside written specs

Quality & validation standards:
- All acceptance criteria in specs must be satisfied
- API responses must be consistent and JSON-based
- Proper HTTP status codes for all errors
- Database operations must be safe and scoped per user
- Code must be readable, structured, and spec-aligned

Change management:
- If behavior changes, update the relevant spec first
- Reference updated spec explicitly before re-implementation
- No patching or hot-fixing without spec updates

Success criteria:
- All Phase II Basic Level features implemented end-to-end
- Multi-user isolation fully enforced
- JWT authentication verified on backend
- Frontend and backend integrated correctly
- Project can be regenerated using specs alone
- Reviewer can audit specs, prompts, and workflow clearly

Non-negotiables:
- Specs are law
- Prompts are auditable
- No manual code edits
- No silent assumptions
- No scope creep

## Response snapshot

Created the project constitution v1.0.0 for Phase II Todo Full-Stack Web Application with:
- 6 Core Principles: Spec-First Development, Agentic Dev Stack Discipline, Zero Manual Coding, Security by Default, Deterministic Reproducibility, Technology Constraints
- Architecture Rules: Monorepo structure, authentication architecture, API standards
- Quality & Change Management: Quality standards, change management protocol, validation checklist
- Governance: Amendment procedure, versioning policy, compliance review, non-negotiables, success criteria

## Outcome

- Impact: Established foundational governance document for Phase II development
- Tests: N/A (constitution document)
- Files: .specify/memory/constitution.md (created/updated)
- Next prompts: Begin feature specification with /sp.specify
- Reflection: Constitution successfully captures all user-provided principles and constraints in declarative, testable form

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, no unexplained brackets, dates in ISO format
- Prompt variant (if applicable): standard constitution initialization
- Next experiment: Validate constitution alignment during first feature spec
