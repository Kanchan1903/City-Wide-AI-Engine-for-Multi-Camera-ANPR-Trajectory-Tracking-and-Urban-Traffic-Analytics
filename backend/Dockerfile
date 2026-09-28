FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and GeoAlchemy/PostGIS
RUN apt-get update && apt-get install -y \
    libpq-dev gcc libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install CPU version of PyTorch first (~180MB instead of 2.5GB CUDA package)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install remaining backend requirements using CPU index fallback for torch
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

COPY . .

# Bind to PORT env var provided dynamically by Render, fallback to 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
