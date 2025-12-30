#!/bin/bash
set -e

# Set environment variables from HF Spaces secrets
export DATABASE_URL="${DATABASE_URL:-sqlite+aiosqlite:///./todo.db}"
export BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-default-secret-change-me}"
export BETTER_AUTH_URL="${BETTER_AUTH_URL:-http://localhost:7860}"
export BETTER_AUTH_JWKS_URL="${BETTER_AUTH_URL}/api/auth/jwks"
export BETTER_AUTH_ISSUER="${BETTER_AUTH_URL}"
export BETTER_AUTH_AUDIENCE="${BETTER_AUTH_URL}"
export ALLOWED_ORIGINS="${BETTER_AUTH_URL}"

echo "========================================"
echo "Starting Todo App..."
echo "========================================"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "BETTER_AUTH_URL: ${BETTER_AUTH_URL}"
echo "========================================"
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://127.0.0.1:3000"
echo "Nginx: http://0.0.0.0:7860"
echo "========================================"

# Start supervisor (manages nginx, backend, frontend)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
