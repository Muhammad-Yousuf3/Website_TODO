# Tasks: Todo Full-Stack Web Application

**Input**: Design documents from `/specs/001-todo-fullstack-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Test tasks omitted.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` (FastAPI + SQLModel)
- **Frontend**: `frontend/` (Next.js 16+ App Router)
- **Specs**: `specs/001-todo-fullstack-app/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [X] T001 Create monorepo directory structure per plan.md (backend/, frontend/, specs/)
- [X] T002 [P] Create backend/requirements.txt with FastAPI, SQLModel, PyJWT, asyncpg, python-dotenv, uvicorn, httpx
- [X] T003 [P] Initialize frontend with Next.js 16+, TypeScript, Tailwind CSS in frontend/
- [X] T004 [P] Create root .env.example with DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL environment variables
- [X] T005 [P] Create root .gitignore with Python, Node.js, and environment file patterns
- [X] T006 [P] Create backend/CLAUDE.md with backend-specific development guidance
- [X] T007 [P] Create frontend/CLAUDE.md with frontend-specific development guidance

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [X] T008 Create backend/app/__init__.py (empty package marker)
- [X] T009 Create backend/app/config.py with environment configuration (DATABASE_URL, JWKS_URL, ISSUER, AUDIENCE)
- [X] T010 Create backend/app/database.py with async SQLModel engine setup for Neon PostgreSQL
- [X] T011 [P] Create backend/app/models/__init__.py with package exports
- [X] T012 Create backend/app/models/task.py with Task SQLModel per data-model.md
- [X] T013 [P] Create backend/app/schemas/__init__.py with package exports
- [X] T014 Create backend/app/schemas/task.py with TaskCreate, TaskUpdate, TaskResponse, TaskListResponse Pydantic schemas
- [X] T015 Create backend/app/auth/__init__.py with package exports
- [X] T016 Create backend/app/auth/jwt_verifier.py with BetterAuthJWTVerifier class using JWKS endpoint per research.md
- [X] T017 [P] Create backend/app/routers/__init__.py with package exports
- [X] T018 Create backend/app/routers/health.py with GET /health endpoint (no auth required)
- [X] T019 [P] Create backend/app/services/__init__.py with package exports
- [X] T020 Create backend/app/main.py with FastAPI app, CORS configuration, router includes, and database table creation on startup

### Frontend Foundation

- [X] T021 Create frontend/lib/auth.ts with Better Auth server configuration (email/password, JWT plugin, bearer plugin)
- [X] T022 Create frontend/lib/auth-client.ts with Better Auth client configuration and jwtClient plugin
- [X] T023 Create frontend/app/api/auth/[...all]/route.ts with Better Auth API handler
- [X] T024 Create frontend/lib/api-client.ts with API client class that attaches JWT to requests
- [X] T025 Create frontend/middleware.ts with route protection (redirect unauthenticated to login)
- [X] T026 Create frontend/app/layout.tsx with root layout (HTML structure, Tailwind, auth provider)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1)

**Goal**: Users can register, login, logout, and access protected routes

**Independent Test**: Create account, login, logout, login again. Protected routes redirect unauthenticated users.

### Implementation for User Story 1

- [X] T027 [P] [US1] Create frontend/components/ui/button.tsx with reusable Button component
- [X] T028 [P] [US1] Create frontend/components/ui/input.tsx with reusable Input component
- [X] T029 [P] [US1] Create frontend/components/ui/card.tsx with reusable Card component
- [X] T030 [US1] Create frontend/components/auth/register-form.tsx with registration form (email, password, name, submit)
- [X] T031 [US1] Create frontend/components/auth/login-form.tsx with login form (email, password, submit)
- [X] T032 [US1] Create frontend/app/(auth)/register/page.tsx with registration page using RegisterForm
- [X] T033 [US1] Create frontend/app/(auth)/login/page.tsx with login page using LoginForm
- [X] T034 [US1] Create frontend/app/(dashboard)/layout.tsx with protected layout (auth check, logout button)
- [X] T035 [US1] Create frontend/app/page.tsx with landing page (redirect to login or dashboard based on auth state)
- [X] T036 [US1] Update frontend/middleware.ts to protect /tasks routes and allow /login, /register

**Checkpoint**: User Story 1 complete - Registration, login, logout, route protection working

---

## Phase 4: User Story 2 - Create New Task (Priority: P1)

**Goal**: Authenticated users can create tasks with title and optional due date

**Independent Test**: Login, create task with title, verify it appears in task list

### Backend Implementation for User Story 2

- [X] T037 [US2] Create backend/app/services/task_service.py with create_task function (accepts user_id from JWT, TaskCreate schema)
- [X] T038 [US2] Create backend/app/routers/tasks.py with POST /api/v1/tasks endpoint (depends on jwt_verifier, calls task_service)

### Frontend Implementation for User Story 2

- [X] T039 [US2] Create frontend/components/tasks/task-form.tsx with task creation form (title required, due_date optional)
- [X] T040 [US2] Create frontend/app/(dashboard)/tasks/page.tsx with task dashboard (empty state, task form)

**Checkpoint**: User Story 2 complete - Task creation working end-to-end

---

## Phase 5: User Story 3 - View Task List (Priority: P1)

**Goal**: Authenticated users can view all their tasks with title, status, due date

**Independent Test**: Login with account that has tasks, verify all tasks displayed correctly

### Backend Implementation for User Story 3

- [X] T041 [US3] Add list_tasks function to backend/app/services/task_service.py (user_id scoping, pagination)
- [X] T042 [US3] Add GET /api/v1/tasks endpoint to backend/app/routers/tasks.py (pagination params, status filter)
- [X] T043 [US3] Add get_task function to backend/app/services/task_service.py (single task by ID with ownership check)
- [X] T044 [US3] Add GET /api/v1/tasks/{id} endpoint to backend/app/routers/tasks.py

### Frontend Implementation for User Story 3

- [X] T045 [US3] Create frontend/components/tasks/task-item.tsx with task display (title, status, due date)
- [X] T046 [US3] Create frontend/components/tasks/task-list.tsx with task list component (maps tasks to TaskItem)
- [X] T047 [US3] Update frontend/app/(dashboard)/tasks/page.tsx to fetch and display task list with empty state

**Checkpoint**: User Story 3 complete - Task list viewing working end-to-end

---

## Phase 6: User Story 4 - Mark Task as Complete (Priority: P2)

**Goal**: Authenticated users can toggle task completion status

**Independent Test**: Create task, mark complete, verify visual change and persistence

### Backend Implementation for User Story 4

- [X] T048 [US4] Add toggle_task_complete function to backend/app/services/task_service.py (ownership check, status toggle)
- [X] T049 [US4] Add PATCH /api/v1/tasks/{id}/complete endpoint to backend/app/routers/tasks.py

### Frontend Implementation for User Story 4

- [X] T050 [US4] Create frontend/components/tasks/task-actions.tsx with completion toggle button
- [X] T051 [US4] Update frontend/components/tasks/task-item.tsx to include completion toggle and visual feedback (strikethrough, checkmark)

**Checkpoint**: User Story 4 complete - Task completion toggle working

---

## Phase 7: User Story 5 - Edit Task (Priority: P2)

**Goal**: Authenticated users can edit task title, due date, and status

**Independent Test**: Create task, edit title, verify change persists

### Backend Implementation for User Story 5

- [X] T052 [US5] Add update_task function to backend/app/services/task_service.py (ownership check, partial update)
- [X] T053 [US5] Add PUT /api/v1/tasks/{id} endpoint to backend/app/routers/tasks.py

### Frontend Implementation for User Story 5

- [X] T054 [US5] Update frontend/components/tasks/task-form.tsx to support edit mode (pre-fill values, update action)
- [X] T055 [US5] Update frontend/components/tasks/task-actions.tsx to include edit button
- [X] T056 [US5] Update frontend/app/(dashboard)/tasks/page.tsx to handle edit modal/inline editing

**Checkpoint**: User Story 5 complete - Task editing working

---

## Phase 8: User Story 6 - Delete Task (Priority: P2)

**Goal**: Authenticated users can permanently delete their tasks

**Independent Test**: Create task, delete it, verify it no longer appears

### Backend Implementation for User Story 6

- [X] T057 [US6] Add delete_task function to backend/app/services/task_service.py (ownership check, hard delete)
- [X] T058 [US6] Add DELETE /api/v1/tasks/{id} endpoint to backend/app/routers/tasks.py (returns 204)

### Frontend Implementation for User Story 6

- [X] T059 [US6] Update frontend/components/tasks/task-actions.tsx to include delete button with confirmation
- [X] T060 [US6] Update frontend/app/(dashboard)/tasks/page.tsx to handle task deletion and list refresh

**Checkpoint**: User Story 6 complete - Task deletion working

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [X] T061 Add proper error handling to frontend/lib/api-client.ts (401 → redirect to login, 403 → show error)
- [X] T062 [P] Add loading states to frontend/components/tasks/task-list.tsx
- [X] T063 [P] Add form validation feedback to frontend/components/tasks/task-form.tsx (title required, max 500 chars)
- [X] T064 [P] Add proper CORS configuration to backend/app/main.py (allow frontend origin)
- [X] T065 Update frontend/app/(dashboard)/tasks/page.tsx with proper empty state message per spec edge cases
- [X] T066 Run quickstart.md validation - verify both servers start and basic flow works
- [X] T067 Verify multi-user isolation - create 2 users, ensure no cross-access to tasks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Authentication must work first
- **User Story 2-6 (Phase 4-8)**: Depend on User Story 1 (need authentication to test)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Parallelize With |
|-------|----------|--------------|---------------------|
| US1 - Auth | P1 | Foundational | None (required first) |
| US2 - Create Task | P1 | US1 | US3 (backend) |
| US3 - View Tasks | P1 | US1 | US2 (backend) |
| US4 - Complete Task | P2 | US2, US3 | US5, US6 |
| US5 - Edit Task | P2 | US2, US3 | US4, US6 |
| US6 - Delete Task | P2 | US2, US3 | US4, US5 |

### Within Each User Story

1. Backend models/schemas (if new)
2. Backend services
3. Backend endpoints
4. Frontend components
5. Frontend integration

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# All setup tasks marked [P] can run together:
T002, T003, T004, T005, T006, T007
```

**Phase 2 (Foundational)**:
```bash
# Backend foundation tasks marked [P]:
T011, T013, T015, T017, T019

# After T020 (main.py), frontend foundation can start in parallel
```

**Phase 3 (US1)**:
```bash
# UI components can be built in parallel:
T027, T028, T029
```

**Phase 4-6 (US2-US3-US4 Backend)**:
```bash
# Backend work for US2 and US3 can parallelize after US1:
# Developer A: T037, T038 (Create Task)
# Developer B: T041, T042, T043, T044 (View Tasks)
```

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Auth) - **STOP AND VALIDATE**
4. Complete Phase 4: User Story 2 (Create Task)
5. Complete Phase 5: User Story 3 (View Tasks)
6. **STOP AND VALIDATE**: Core create-view cycle working
7. Add User Stories 4-6 incrementally

### Incremental Delivery

| Milestone | Stories Complete | Value Delivered |
|-----------|------------------|-----------------|
| MVP Auth | US1 | Users can register and login |
| MVP Core | US1 + US2 + US3 | Users can create and view tasks |
| Full CRUD | US1-6 | Complete task management |
| Production | All + Polish | Polished, error-handled app |

---

## Task Summary

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Setup | 7 | 6 |
| Foundational | 13 | 6 |
| US1 - Auth | 10 | 3 |
| US2 - Create | 4 | 0 |
| US3 - View | 7 | 0 |
| US4 - Complete | 4 | 0 |
| US5 - Edit | 5 | 0 |
| US6 - Delete | 4 | 0 |
| Polish | 7 | 3 |
| **Total** | **61** | **18** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Backend and frontend can often progress in parallel once foundational is done
- Test each endpoint with curl before frontend integration
- Verify JWKS endpoint accessible before testing backend JWT verification
