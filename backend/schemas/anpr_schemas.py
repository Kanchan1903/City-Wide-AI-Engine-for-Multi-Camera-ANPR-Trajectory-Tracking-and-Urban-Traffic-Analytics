from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID

class DetectionBase(BaseModel):
    detection_id: str
    camera_id: str
    plate_number: Optional[str] = None
    raw_ocr_text: Optional[str] = None
    normalized_plate_number: Optional[str] = None
    plate_detection_confidence: Optional[float] = None
    ocr_confidence: Optional[float] = None
    final_confidence: Optional[float] = None
    quality_score: Optional[float] = None
    overall_confidence: Optional[float] = None
    confidence_level: Optional[str] = None
    vehicle_image_url: Optional[str] = None
    plate_crop_url: Optional[str] = None
    enhanced_crop_url: Optional[str] = None
    format_valid: Optional[bool] = None
    processing_mode: Optional[str] = None
    review_status: Optional[str] = None
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ProcessingJobResponse(BaseModel):
    job_id: str
    status: str
    source_name: str
    message: str

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    total_frames: int
    total_detections: int
    start_time: datetime
    end_time: Optional[datetime] = None
    error_message: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ReviewRequest(BaseModel):
    action: str # ACCEPT, REJECT, CORRECT
    corrected_plate_number: Optional[str] = None
    comments: Optional[str] = None
