from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from models.all_models import CameraStatus, VehicleType, ConfidenceLevel, AlertType

# Camera Schemas
class CameraBase(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    road_name: Optional[str] = None
    direction: Optional[str] = None
    status: Optional[CameraStatus] = CameraStatus.OFFLINE
    source_type: Optional[str] = 'DemoVideoSource'

class CameraCreate(CameraBase):
    pass

class CameraResponse(CameraBase):
    last_heartbeat: Optional[datetime] = None
    fps: Optional[int] = None
    processing_latency_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Blacklist Schemas
class BlacklistBase(BaseModel):
    plate_number: str
    category: Optional[str] = None
    reason: Optional[str] = None
    status: Optional[str] = 'ACTIVE'
    notes: Optional[str] = None

class BlacklistCreate(BlacklistBase):
    pass

class BlacklistResponse(BlacklistBase):
    id: UUID
    created_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    type: AlertType
    severity: str
    title: str
    description: Optional[str] = None
    camera_id: Optional[str] = None
    plate_number: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: UUID
    timestamp: datetime
    is_resolved: bool
    resolved_by: Optional[UUID] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
# Vehicle and Trajectory
class TrajectoryPointResponse(BaseModel):
    id: UUID
    camera_id: Optional[str] = None
    timestamp: datetime
    sequence_order: int
    ocr_confidence: float
    latitude: float
    longitude: float

    class Config:
        from_attributes = True
