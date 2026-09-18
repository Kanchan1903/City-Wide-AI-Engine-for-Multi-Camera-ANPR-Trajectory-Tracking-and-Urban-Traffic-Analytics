from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database.database import Base

class ProcessingRun(Base):
    __tablename__ = 'processing_runs'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(String(100), unique=True, index=True, nullable=False)
    source_type = Column(String(50)) # e.g. VIDEO_UPLOAD, IMAGE_UPLOAD, RTSP_STREAM
    source_name = Column(String(255))
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True))
    total_frames = Column(Integer, default=0)
    total_detections = Column(Integer, default=0)
    accepted_count = Column(Integer, default=0)
    review_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    processing_status = Column(String(50), default='QUEUED') # QUEUED, PROCESSING, COMPLETED, FAILED
    error_message = Column(Text)

class ReviewAction(Base):
    __tablename__ = 'review_actions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    detection_id = Column(UUID(as_uuid=True), ForeignKey('detections.id', ondelete='CASCADE'), nullable=False)
    reviewer_action = Column(String(50), nullable=False) # ACCEPTED, REJECTED, CORRECTED
    corrected_plate_number = Column(String(50))
    comments = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with Detection will be defined when both are imported, or simply implicitly left.

class ModelConfiguration(Base):
    __tablename__ = 'model_configurations'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_name = Column(String(100), unique=True, nullable=False)
    model_version = Column(String(50))
    confidence_threshold = Column(Float, default=0.7)
    enabled = Column(Boolean, default=True)
    configuration_json = Column(JSON)
