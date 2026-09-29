import os
import uuid
import cv2
import shutil
import numpy as np
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Form
from sqlalchemy.orm import Session
from pathlib import Path

from database.database import get_db
from models.all_models import Detection
from models.processing_models import ProcessingRun, ReviewAction
from schemas.anpr_schemas import DetectionBase, ProcessingJobResponse, JobStatusResponse, ReviewRequest
from services.pipeline import ANPRPipeline

router = APIRouter(prefix="/api/anpr", tags=["ANPR"])
_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = ANPRPipeline()
    return _pipeline

UPLOAD_DIR = Path("data/uploads")
PROCESSED_DIR = Path("data/processed")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".mp4", ".avi", ".mkv", ".webp"}
ALLOWED_VIDEO_EXT = {".mp4", ".avi", ".mkv"}

def secure_filename(filename: str) -> str:
    """Generate a secure filename"""
    ext = Path(filename).suffix.lower()
    return f"{uuid.uuid4().hex}{ext}"

@router.post("/process-image", response_model=list[DetectionBase])
async def process_image(file: UploadFile = File(...), camera_id: str = Form("CAM_UPLOAD"), db: Session = Depends(get_db)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid image extension.")
        
    safe_name = secure_filename(file.filename)
    file_path = UPLOAD_DIR / safe_name
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Read image
    img = cv2.imread(str(file_path))
    if img is None:
        # If it's a video or invalid image, use a dummy image so Demo Mode can still trigger
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        
    # Process
    pipeline = get_pipeline()
    results = pipeline.process_image(img, camera_id=camera_id)
    
    saved_detections = []
    
    # Save to DB
    for res in results:
        # In a real system, save the crops here
        res["vehicle_image_url"] = f"/data/uploads/{safe_name}"
        
        det_record = Detection(
            detection_id=res["detection_id"],
            camera_id=res["camera_id"],
            plate_number=res.get("plate_number"),
            raw_ocr_text=res.get("raw_ocr_text"),
            normalized_plate_number=res.get("normalized_plate_number"),
            detection_confidence=res.get("plate_detection_confidence"),
            ocr_confidence=res.get("ocr_confidence"),
            quality_score=res.get("quality_score"),
            overall_confidence=res.get("overall_confidence"),
            confidence_level=res.get("confidence_level"),
            vehicle_image_path=res.get("vehicle_image_url"),
            format_valid=res.get("format_valid"),
            processing_mode=res.get("processing_mode"),
            review_status=res.get("review_status")
        )
        db.add(det_record)
        saved_detections.append(res)
        
    db.commit()
    
    return saved_detections

def process_video_background(job_id: str, file_path: str, camera_id: str, db: Session):
    try:
        run = db.query(ProcessingRun).filter(ProcessingRun.job_id == job_id).first()
        if not run: return
        
        run.processing_status = 'PROCESSING'
        db.commit()
        
        cap = cv2.VideoCapture(file_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        frame_idx = 0
        all_detections = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            
            # Simple frame skipping for MVP (process 1 frame per sec, assuming 30fps)
            if frame_idx % 30 == 0:
                pipeline = get_pipeline()
                results = pipeline.process_image(frame, camera_id=camera_id)
                all_detections.extend(results)
                
            frame_idx += 1
            
        cap.release()
        
        # Save detections
        for res in all_detections:
            det_record = Detection(
                detection_id=res["detection_id"],
                camera_id=res["camera_id"],
                plate_number=res.get("plate_number"),
                raw_ocr_text=res.get("raw_ocr_text"),
                normalized_plate_number=res.get("normalized_plate_number"),
                detection_confidence=res.get("plate_detection_confidence"),
                ocr_confidence=res.get("ocr_confidence"),
                quality_score=res.get("quality_score"),
                overall_confidence=res.get("overall_confidence"),
                confidence_level=res.get("confidence_level"),
                format_valid=res.get("format_valid"),
                processing_mode=res.get("processing_mode"),
                review_status=res.get("review_status")
            )
            db.add(det_record)
            
        run.total_frames = total_frames
        run.total_detections = len(all_detections)
        run.end_time = datetime.now(timezone.utc)
        run.processing_status = 'COMPLETED'
        db.commit()
        
    except Exception as e:
        logger.error(f"Video processing failed: {e}")
        run = db.query(ProcessingRun).filter(ProcessingRun.job_id == job_id).first()
        if run:
            run.processing_status = 'FAILED'
            run.error_message = str(e)
            run.end_time = datetime.now(timezone.utc)
            db.commit()

@router.post("/process-video", response_model=ProcessingJobResponse)
async def process_video(background_tasks: BackgroundTasks, file: UploadFile = File(...), camera_id: str = "CAM_UPLOAD", db: Session = Depends(get_db)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_VIDEO_EXT:
        raise HTTPException(status_code=400, detail="Invalid video extension.")
        
    safe_name = secure_filename(file.filename)
    file_path = UPLOAD_DIR / safe_name
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    
    run = ProcessingRun(
        job_id=job_id,
        source_type="VIDEO_UPLOAD",
        source_name=file.filename,
        processing_status="QUEUED"
    )
    db.add(run)
    db.commit()
    
    background_tasks.add_task(process_video_background, job_id, str(file_path), camera_id, db)
    
    return {"job_id": job_id, "status": "QUEUED", "source_name": file.filename, "message": "Video queued for processing"}

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    run = db.query(ProcessingRun).filter(ProcessingRun.job_id == job_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Job not found")
    return run

@router.get("/detections")
def get_detections(limit: int = 50, skip: int = 0, db: Session = Depends(get_db)):
    dets = db.query(Detection).order_by(Detection.timestamp.desc()).offset(skip).limit(limit).all()
    return dets

@router.get("/detections/{detection_id}")
def get_detection_by_id(detection_id: str, db: Session = Depends(get_db)):
    det = db.query(Detection).filter(Detection.detection_id == detection_id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detection not found")
    return det

@router.patch("/detections/{detection_id}/review")
def review_detection(detection_id: str, request: ReviewRequest, db: Session = Depends(get_db)):
    det = db.query(Detection).filter(Detection.detection_id == detection_id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detection not found")
        
    # Create review action
    action = ReviewAction(
        detection_id=det.id, # Foreign key to the UUID primary key
        reviewer_action=request.action,
        corrected_plate_number=request.corrected_plate_number,
        comments=request.comments
    )
    db.add(action)
    
    if request.action == "CORRECT" and request.corrected_plate_number:
        det.normalized_plate_number = request.corrected_plate_number
        det.plate_number = request.corrected_plate_number
        
    det.review_status = "REVIEWED"
    db.commit()
    
    return {"message": "Review saved"}
