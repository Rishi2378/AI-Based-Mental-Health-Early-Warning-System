# Multi-stage Dockerfile for MindGuard AI (Build Frontend + Run Production WSGI)
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Production Runtime
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for audio analysis
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code & data
COPY backend/ ./backend/
COPY data/ ./data/
COPY wsgi.py ./wsgi.py

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure model artifacts exist or train if missing
RUN python backend/ml/generate_datasets.py && \
    python backend/ml/train_text_model.py && \
    python backend/ml/train_voice_model.py

ENV PORT=5000
ENV FLASK_ENV=production
EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "3", "--timeout", "120", "wsgi:app"]
