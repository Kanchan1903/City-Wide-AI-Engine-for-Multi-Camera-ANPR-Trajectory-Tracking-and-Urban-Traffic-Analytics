# City-Wide AI Engine for Multi-Camera ANPR - Backend

This is the FastAPI backend that handles real-time YOLOv8 Vehicle & Plate detection, OpenCV image enhancement, and PaddleOCR license plate reading.

## Installation Instructions

1. **Setup Python Virtual Environment**
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   > **Note on PaddleOCR**: Installing PaddleOCR on Windows can sometimes require the Visual Studio C++ Build Tools. If the installation fails, ensure you have the MSVC v143 build tools installed via the Visual Studio Installer.

3. **Configure Environment Variables**
   Copy `.env.example` to `.env` and configure your paths.
   ```bash
   cp .env.example .env
   ```

## Setting up the YOLOv8 Model

The AI engine uses Ultralytics YOLOv8 for detection. Standard COCO `yolov8n.pt` weights only detect generic objects like Cars and Trucks, **but not license plates**. 

You must place a custom-trained License Plate Detection YOLOv8 model inside the `models/` folder.
1. Train or download an ANPR YOLOv8 model.
2. Place the weights file at: `backend/models/anpr_yolov8.pt`
3. Ensure the model detects class `0` (vehicle) and class `1` (license plate), or adjust the classes in `backend/services/detection/yolo_service.py`.

## Running the Application

Start the backend server using the provided batch script or manually:
```bash
uvicorn main:app --reload --port 8001
```

## Testing Real Inference

When processing images via `POST /api/anpr/process-image`, the system will perform actual inference. If PaddleOCR is missing or the YOLO model is missing, it will explicitly fail and log the exception.
