# Hugging Face Spaces Docker deployment
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./

# Build args for frontend
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Python backend + serve frontend
FROM python:3.11-slim

WORKDIR /app

# Install Node.js for running Next.js
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app ./app

# Copy frontend standalone build (correct structure)
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Copy configuration files
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create user for HF Spaces (runs as user 1000)
RUN useradd -m -u 1000 user
RUN chown -R user:user /app
RUN mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi
RUN chown -R user:user /tmp
RUN chown -R user:user /var/log/nginx /var/lib/nginx /run

# Hugging Face Spaces uses port 7860
EXPOSE 7860

USER user

# Start services
CMD ["/app/start.sh"]

