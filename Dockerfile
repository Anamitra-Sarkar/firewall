# Multi-stage build: Frontend (Bun)
FROM oven/bun:1 AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/bun.lock ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy frontend source
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html frontend/vite.config.js frontend/tailwind.config.js frontend/postcss.config.js ./

# Build frontend with Bun
RUN bun run build

# Main stage: Python Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend ./backend
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Copy built frontend from first stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:7860/health')" || exit 1

# Run the application
CMD ["python", "-m", "backend.main"]
