# Frontend Development Guide

## Overview
Next.js 15+ App Router frontend with Better Auth for the Todo Full-Stack Application.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Auth**: Better Auth (email/password + JWT plugin)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Directory Structure
```
frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Protected pages
│   └── api/auth/[...all]/   # Better Auth handler
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── auth/                # Auth forms
│   └── tasks/               # Task components
├── lib/
│   ├── auth.ts              # Better Auth server config
│   ├── auth-client.ts       # Better Auth client config
│   └── api-client.ts        # API client with JWT
└── middleware.ts            # Route protection
```

## Key Patterns

### Authentication
- Better Auth handles user registration/login
- JWT plugin issues tokens for backend API calls
- Use `authClient.token()` to get JWT for API requests

### Protected Routes
- Middleware redirects unauthenticated users to /login
- Dashboard layout verifies session on server

### API Calls
- Always attach JWT to Authorization header
- Handle 401 by redirecting to login
- Handle 403 by showing error message

## Running the Server
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
See root `.env.example` for required variables:
- `BETTER_AUTH_SECRET`: 32+ character secret
- `BETTER_AUTH_URL`: Frontend URL (http://localhost:3000)
- `DATABASE_URL`: Neon PostgreSQL connection
- `NEXT_PUBLIC_API_URL`: Backend API URL
