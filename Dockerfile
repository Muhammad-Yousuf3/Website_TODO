# Simplified HuggingFace Spaces deployment - Backend only
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app ./app

# Create non-root user for HF Spaces
RUN useradd -m -u 1000 user
RUN chown -R user:user /app
USER user

# HuggingFace Spaces uses port 7860
EXPOSE 7860

# Start FastAPI directly
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
