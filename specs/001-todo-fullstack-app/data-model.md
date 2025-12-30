# Data Model: Todo Full-Stack Web Application

**Feature**: 001-todo-fullstack-app
**Date**: 2025-12-29
**Source**: spec.md (Key Entities section)

---

## Entity Relationship Overview

```text
┌─────────────────┐         ┌─────────────────┐
│      User       │         │      Task       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────│ user_id (FK)    │
│ email (unique)  │ 1     * │ id (PK)         │
│ name            │         │ title           │
│ created_at      │         │ due_date        │
│                 │         │ status          │
│                 │         │ created_at      │
│                 │         │ updated_at      │
└─────────────────┘         └─────────────────┘
```

**Relationships**:
- User has many Tasks (1:N)
- Task belongs to exactly one User (mandatory)

---

## Entity: User

### Description
Represents a registered user who can create and manage their own tasks. Users are the primary actors in the system and serve as the ownership boundary for task isolation.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier for the user |
| email | String(255) | Unique, Not Null, Indexed | User's email address (login identifier) |
| name | String(255) | Not Null | User's display name |
| created_at | DateTime | Not Null, Default: now() | Account creation timestamp (UTC) |

### Validation Rules
- **email**: Must be valid email format, case-insensitive for lookup
- **name**: Must be 1-255 characters, non-empty after trimming
- **email**: Cannot be changed after registration (per spec assumptions)

### Indexes
- Primary key on `id`
- Unique index on `email`

### Notes
- Password storage handled by Better Auth (not in this model)
- User sessions managed by Better Auth (separate storage)

---

## Entity: Task

### Description
Represents a todo item belonging to a specific user. Tasks are the core data entity of the application and are strictly scoped to their owner.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier for the task |
| title | String(500) | Not Null | Task description/title (max 500 chars) |
| due_date | Date | Nullable | Optional due date (date only, UTC) |
| status | Enum | Not Null, Default: 'pending' | Task status: 'pending' or 'completed' |
| user_id | Integer | Foreign Key → User.id, Not Null, Indexed | Owner of the task |
| created_at | DateTime | Not Null, Default: now() | Task creation timestamp (UTC) |
| updated_at | DateTime | Not Null, Default: now(), On Update: now() | Last modification timestamp (UTC) |

### Validation Rules
- **title**: Required, 1-500 characters, non-empty after trimming
- **due_date**: If provided, must be a valid date (no time component)
- **status**: Must be one of: 'pending', 'completed'
- **user_id**: Must reference a valid User

### Indexes
- Primary key on `id`
- Index on `user_id` (foreign key, query optimization)
- Composite index on `(user_id, status)` for filtered queries

### State Transitions

```text
┌───────────┐     mark complete     ┌───────────┐
│  pending  │ ───────────────────► │ completed │
└───────────┘                       └───────────┘
      ▲                                   │
      │         mark incomplete           │
      └───────────────────────────────────┘
```

- Tasks start in 'pending' status
- Status can toggle between 'pending' and 'completed'
- No terminal states (tasks can always be toggled or deleted)

---

## Ownership Enforcement

### Security Model
All task operations MUST verify ownership before execution:

1. **Read**: `WHERE user_id = <jwt_user_id>`
2. **Update**: Verify `task.user_id == jwt_user_id` before modifying
3. **Delete**: Verify `task.user_id == jwt_user_id` before deleting

### Query Patterns

```sql
-- List user's tasks (paginated)
SELECT * FROM task
WHERE user_id = :user_id
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;

-- Get single task (ownership check)
SELECT * FROM task
WHERE id = :task_id AND user_id = :user_id;

-- Update task (ownership enforced)
UPDATE task
SET title = :title, due_date = :due_date, status = :status, updated_at = NOW()
WHERE id = :task_id AND user_id = :user_id;

-- Delete task (ownership enforced)
DELETE FROM task
WHERE id = :task_id AND user_id = :user_id;
```

---

## SQLModel Implementation Reference

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime, date
from enum import Enum

class TaskStatus(str, Enum):
    pending = "pending"
    completed = "completed"

class User(SQLModel, table=True):
    __tablename__ = "user"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True)
    name: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    tasks: list["Task"] = Relationship(back_populates="user")

class Task(SQLModel, table=True):
    __tablename__ = "task"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=500)
    due_date: Optional[date] = Field(default=None)
    status: TaskStatus = Field(default=TaskStatus.pending)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: Optional[User] = Relationship(back_populates="tasks")
```

---

## Database Schema (PostgreSQL DDL)

```sql
-- User table
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX idx_user_email ON "user"(email);

-- Task status enum
CREATE TYPE task_status AS ENUM ('pending', 'completed');

-- Task table
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    due_date DATE,
    status task_status NOT NULL DEFAULT 'pending',
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_user_status ON task(user_id, status);
```

---

## Pydantic Schemas (API DTOs)

```python
from pydantic import BaseModel, Field, EmailStr
from datetime import date, datetime
from typing import Optional

# Request schemas
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    due_date: Optional[date] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    due_date: Optional[date] = None
    status: Optional[str] = Field(default=None, pattern="^(pending|completed)$")

# Response schemas
class TaskResponse(BaseModel):
    id: int
    title: str
    due_date: Optional[date]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    page: int
    per_page: int
```

---

## Migration Strategy

### Initial Setup
- SQLModel's `SQLModel.metadata.create_all()` for initial schema
- Neon PostgreSQL handles table creation automatically

### Future Migrations
- If schema changes needed, update spec first
- Use Alembic for production migrations
- Document migration in PHR before execution

---

## Notes

- User password/session data managed by Better Auth (separate tables)
- All timestamps stored in UTC
- Task deletion is hard delete (no soft delete per spec)
- Pagination default: 20 items per page (per spec assumptions)
