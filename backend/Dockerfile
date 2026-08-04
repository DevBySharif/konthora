# Use official slim Python image
FROM python:3.11-slim

# Prevent python writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/model_cache

# Set working directory
WORKDIR /app

# Install system dependencies (espeak-ng and ffmpeg are required)
# Also require libsndfile1 for soundfile library
RUN apt-get update && apt-get install -y --no-install-recommends \
    espeak-ng \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first for layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create cache and storage directories, configure non-root runtime user
RUN mkdir -p /app/storage /app/model_cache && \
    useradd -u 10001 -U -d /app -s /bin/bash appuser && \
    chown -R appuser:appuser /app

# Copy application source code
COPY --chown=appuser:appuser app/ /app/app/

# Switch to non-root user
USER appuser

# Expose API port
EXPOSE 8000

# Healthcheck using python standard library to request localhost health
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')"

# Run uvicorn server in production mode
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
