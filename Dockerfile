# Dockerfile
# Python base (Debian trixie)
FROM python:3.11-slim

# Install LibreOffice and some common fonts (helps avoid missing-glyph issues)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    libreoffice-calc \
    fonts-dejavu \
    fonts-liberation \
    fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY app ./app

# Expose FastAPI
EXPOSE 8000

# Optional: set a HOME so LibreOffice can create its profile dir
ENV HOME=/tmp

# Start API
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
