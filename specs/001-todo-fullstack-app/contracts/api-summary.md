# API Contract Summary: Todo Full-Stack Application

**Feature**: 001-todo-fullstack-app
**Date**: 2025-12-29
**OpenAPI Spec**: [openapi.yaml](./openapi.yaml)

---

## Authentication

All task endpoints require JWT authentication.

**Header Format**:
```
Authorization: Bearer <jwt_token>
```

**Token Source**: Better Auth JWT plugin on Next.js frontend

**Verification**: Backend fetches public keys from `/api/auth/jwks` endpoint

---

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8000` |
| Production | `https://api.example.com` |

---

## Endpoints

### Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | API health status |

### Task Operations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/tasks` | Yes | Create a new task |
| GET | `/api/v1/tasks` | Yes | List user's tasks (paginated) |
| GET | `/api/v1/tasks/{id}` | Yes | Get single task |
| PUT | `/api/v1/tasks/{id}` | Yes | Update task |
| DELETE | `/api/v1/tasks/{id}` | Yes | Delete task |
| PATCH | `/api/v1/tasks/{id}/complete` | Yes | Toggle completion status |

---

## Request/Response Examples

### Create Task

**Request**:
```http
POST /api/v1/tasks
Authorization: Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries",
  "due_date": "2025-01-15"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "due_date": "2025-01-15",
  "status": "pending",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

### List Tasks

**Request**:
```http
GET /api/v1/tasks?page=1&per_page=20&status=pending
Authorization: Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "due_date": "2025-01-15",
      "status": "pending",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "per_page": 20
}
```

### Update Task

**Request**:
```http
PUT /api/v1/tasks/1
Authorization: Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries and cook dinner",
  "status": "completed"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Buy groceries and cook dinner",
  "due_date": "2025-01-15",
  "status": "completed",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T12:30:00Z"
}
```

### Toggle Completion

**Request**:
```http
PATCH /api/v1/tasks/1/complete
Authorization: Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "due_date": "2025-01-15",
  "status": "completed",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T14:00:00Z"
}
```

### Delete Task

**Request**:
```http
DELETE /api/v1/tasks/1
Authorization: Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

**Response** (204 No Content): *(empty body)*

---

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Title is required"
}
```

### 401 Unauthorized

```json
{
  "detail": "Missing authorization header"
}
```

```json
{
  "detail": "Token has expired"
}
```

### 403 Forbidden

```json
{
  "detail": "You do not have permission to access this task"
}
```

### 404 Not Found

```json
{
  "detail": "Task not found"
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Access to another user's task |
| 404 | Not Found | Task doesn't exist |
| 500 | Internal Server Error | Unexpected errors |

---

## Validation Rules

### Task Title
- Required on create
- 1-500 characters
- Non-empty after trimming whitespace

### Due Date
- Optional
- Format: `YYYY-MM-DD` (ISO 8601 date)
- No time component

### Status
- Values: `pending`, `completed`
- Default: `pending` on create
- Toggles between values via `/complete` endpoint

---

## Pagination

Default values:
- `page`: 1
- `per_page`: 20

Maximum `per_page`: 100

Response includes:
- `tasks`: Array of task objects
- `total`: Total count of user's tasks (matching filter)
- `page`: Current page number
- `per_page`: Items per page

---

## Security Notes

1. **User ID from JWT only**: Backend extracts `user_id` from JWT `sub` claim
2. **No user_id in request body**: Never trust client-provided user identity
3. **Ownership validation**: All task operations verify `task.user_id == jwt.sub`
4. **403 vs 404**: Return 403 if task exists but belongs to another user
