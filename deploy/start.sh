#!/bin/bash
set -e

# Create nginx temp directories
mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi

# Set environment variables from HF Spaces secrets
export DATABASE_URL="${DATABASE_URL:-sqlite+aiosqlite:///./todo.db}"
export BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-default-secret-change-me}"
export BETTER_AUTH_URL="${BETTER_AUTH_URL:-http://localhost:7860}"
export BETTER_AUTH_JWKS_URL="${BETTER_AUTH_URL}/api/auth/jwks"
export BETTER_AUTH_ISSUER="${BETTER_AUTH_URL}"
export BETTER_AUTH_AUDIENCE="${BETTER_AUTH_URL}"
export ALLOWED_ORIGINS="${BETTER_AUTH_URL}"

echo "Starting Todo App..."
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://127.0.0.1:3000"
echo "Nginx: http://0.0.0.0:7860"

# Start supervisor (manages nginx, backend, frontend)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
