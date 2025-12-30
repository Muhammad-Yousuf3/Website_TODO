# Quickstart Guide: Todo Full-Stack Web Application

**Feature**: 001-todo-fullstack-app
**Date**: 2025-12-29

---

## Prerequisites

### Required Software
- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- Git

### Required Accounts/Services
- Neon PostgreSQL account (https://neon.tech)
- BETTER_AUTH_SECRET (generate locally)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Web_TODO
git checkout 001-todo-fullstack-app
```

### 2. Create Environment Files

**Root `.env.example`** (copy to `.env`):

```env
# Neon PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:pass@ep-xxx-pooler.neon.tech/dbname?ssl=require

# Better Auth
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=http://localhost:3000

# Backend
BETTER_AUTH_JWKS_URL=http://localhost:3000/api/auth/jwks
BETTER_AUTH_ISSUER=http://localhost:3000
BETTER_AUTH_AUDIENCE=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Generate BETTER_AUTH_SECRET**:

```bash
openssl rand -base64 32
```

### 3. Get Neon Connection String

1. Log in to https://console.neon.tech
2. Create or select a project
3. Copy the **pooled** connection string
4. Update DATABASE_URL in `.env`

---

## Backend Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
.\venv\Scripts\activate  # Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**requirements.txt contents**:
```
fastapi>=0.109.0
uvicorn>=0.27.0
sqlmodel>=0.0.14
asyncpg>=0.29.0
pyjwt[crypto]>=2.8.0
python-dotenv>=1.0.0
httpx>=0.26.0
```

### 3. Run Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

**Verify**: Open http://localhost:8000/health

Expected response:
```json
{"status": "healthy", "timestamp": "2025-01-01T00:00:00Z"}
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

**Verify**: Open http://localhost:3000

---

## Verify Full Stack

### 1. Start Both Servers

**Terminal 1 (Backend)**:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### 2. Test Authentication Flow

1. Navigate to http://localhost:3000
2. Click "Register" or "Sign Up"
3. Enter email and password
4. Verify redirect to dashboard

### 3. Test Task CRUD

1. Create a new task (title required)
2. View task in list
3. Edit task title
4. Mark task as complete
5. Delete task

### 4. Test API Directly

Get JWT token from frontend (via browser DevTools Network tab), then:

```bash
# List tasks
curl -H "Authorization: Bearer <your-jwt>" \
  http://localhost:8000/api/v1/tasks

# Create task
curl -X POST \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task"}' \
  http://localhost:8000/api/v1/tasks
```

---

## Directory Structure

```text
Web_TODO/
├── frontend/                 # Next.js 16+ App Router
│   ├── app/
│   │   ├── (auth)/          # Auth pages (login, register)
│   │   ├── (dashboard)/     # Protected pages
│   │   └── api/
│   │       └── auth/[...all]/route.ts  # Better Auth handler
│   ├── lib/
│   │   ├── auth.ts          # Better Auth server config
│   │   ├── auth-client.ts   # Better Auth client config
│   │   └── api-client.ts    # API client with JWT
│   ├── components/
│   └── package.json
│
├── backend/                  # FastAPI + SQLModel
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models/          # SQLModel models
│   │   ├── routers/         # API route handlers
│   │   ├── services/        # Business logic
│   │   └── auth/            # JWT verification
│   ├── tests/
│   └── requirements.txt
│
├── specs/                    # Spec-Kit Plus specifications
│   └── 001-todo-fullstack-app/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md
│       └── contracts/
│           ├── openapi.yaml
│           └── api-summary.md
│
├── .env.example
├── .gitignore
└── CLAUDE.md
```

---

## Common Issues

### Backend can't reach frontend JWKS

**Symptom**: 401 errors with "Unable to retrieve signing key"

**Solution**: Ensure frontend is running before testing backend auth

### Database connection timeout

**Symptom**: Slow first request or connection errors

**Solution**:
- Verify Neon project is active (not auto-suspended)
- Check DATABASE_URL uses `-pooler` suffix

### CORS errors

**Symptom**: Browser console shows CORS blocked

**Solution**: Verify CORS origins in FastAPI app match frontend URL

### JWT expired

**Symptom**: 401 "Token has expired" after some time

**Solution**: Log in again to get fresh JWT token

---

## Development Workflow

1. **Read spec** before any implementation
2. **Check contracts** for API details
3. **Run tests** after changes
4. **Update spec** if behavior changes
5. **Create PHR** for significant prompts

---

## Useful Commands

```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8000  # Dev server
pytest                                      # Run tests

# Frontend
cd frontend
npm run dev                                 # Dev server
npm run build                               # Production build
npm run lint                                # Lint code

# Database
# Tables created automatically by SQLModel on first run
```

---

## Next Steps

After quickstart verification:

1. Run `/sp.tasks` to generate implementation tasks
2. Follow tasks.md for implementation order
3. Validate against acceptance criteria in spec.md
