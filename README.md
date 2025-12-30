---
title: Web Todo
emoji: ✅
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
---

# Todo Full-Stack Application

A modern, full-stack todo application with user authentication and persistent task management.

## Tech Stack

### Frontend
- **Next.js 16+** - React framework with App Router
- **Better Auth** - Authentication with email/password and JWT
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type-safe development

### Backend
- **FastAPI** - High-performance Python API framework
- **SQLModel** - ORM combining SQLAlchemy and Pydantic
- **asyncpg** - Async PostgreSQL driver
- **JWT/JWKS** - Token verification

### Database
- **Neon PostgreSQL** - Serverless Postgres

## Features

- User registration and login
- JWT-based API authentication
- Create, read, update, delete tasks
- Mark tasks as complete/incomplete
- User-scoped data isolation
- Responsive UI design

## Project Structure

```
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   └── lib/             # Auth & API clients
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── auth/            # JWT verification
│   │   ├── models/          # SQLModel definitions
│   │   ├── routers/         # API endpoints
│   │   ├── schemas/         # Request/response schemas
│   │   └── services/        # Business logic
│   └── requirements.txt
│
└── specs/                    # Project specifications
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Neon PostgreSQL database (or local PostgreSQL)

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your values:
   ```env
   # Database
   DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

   # Better Auth
   BETTER_AUTH_SECRET=your-32-character-secret-key
   BETTER_AUTH_URL=http://localhost:3000

   # Backend JWT Verification
   BETTER_AUTH_JWKS_URL=http://localhost:3000/api/auth/jwks
   BETTER_AUTH_ISSUER=http://localhost:3000
   BETTER_AUTH_AUDIENCE=http://localhost:3000

   # Frontend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Copy `.env` to both frontend and backend directories:
   ```bash
   cp .env frontend/.env.local
   cp .env backend/.env
   ```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Register new user |
| POST | `/api/auth/sign-in/email` | Login user |
| GET | `/api/tasks` | Get user's tasks |
| POST | `/api/tasks` | Create new task |
| PATCH | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

## Security

- All task endpoints require JWT authentication
- Tasks are scoped to the authenticated user
- Passwords are hashed using Better Auth defaults
- JWT tokens expire after 1 hour

## License

MIT
