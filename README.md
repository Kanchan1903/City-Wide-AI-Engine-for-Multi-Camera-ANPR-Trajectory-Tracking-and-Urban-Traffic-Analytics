# Unified Multi-Camera ANPR + Trajectory + Traffic Analytics Platform

This repository implements a centralized, software-only traffic intelligence system, integrating ANPR/OCR, Trajectory Tracking, Macro Analytics, a Command Center Dashboard, and an Alert System.

## Prerequisites
- Docker & Docker Compose (for PostgreSQL/PostGIS)
- Python 3.10+
- Node.js 18+

## Setup Instructions

### 1. Database (PostgreSQL + PostGIS)
```bash
cd database
# The docker-compose.yml in the root will spin up the DB with PostGIS
docker-compose up -d
```
*Note: `init.sql` will automatically run and provision the schema on the first boot.*

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Note: The ML endpoints (OCR, Trajectory) are currently running in "Demo/Mock Mode" to ensure the pipeline runs without requiring multi-GB model weights out of the box. You can swap these with the actual YOLOv8 and PaddleOCR models inside `ai_processing.py`.*

### 3. Frontend (React + D3 + Leaflet)
```bash
cd frontend
npm install
npm run dev
```

## System Architecture

1. **Module 1: High-Precision OCR Module** (`/api/ocr/process`)
   - YOLOv8 (Localization) → Quality Checks → DeblurGAN-v2/Real-ESRGAN/LaMa/Zero-DCE (Fixers) → PaddleOCR & VLM → Regex Validation.
2. **Module 2: Trajectory Reconstruction Engine** (`/api/trajectory/{plate_text}`)
   - Uses Levenshtein distance for fuzzy matching, a physics filter for realistic speeds, and a Kalman Filter for route interpolation.
3. **Module 3: City Traffic Analytics Dashboard** (`/api/analytics/*`)
   - Derives density, Origin-Destination pairs, route density, average speeds, and congestion heatmaps purely from Module 1 & 2 trajectory data.
4. **Module 4: UI / Dashboard Interface**
   - Professional dark-mode command center UI using `Space Grotesk` and `JetBrains Mono`. Features Leaflet map layers and D3.js charting.
5. **Module 5: Alert System**
   - WebSocket-based alerting for blacklisted plates and Isolation Forest anomalies (route deviation).
