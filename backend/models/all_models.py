from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid
import os

from database.database import Base, SQLALCHEMY_DATABASE_URL

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    from sqlalchemy.types import String
    def GeometryFallback(*args, **kwargs):
        return String(255)
    Geometry = GeometryFallback
else:
    from geoalchemy2 import Geometry

# Enums
class UserRole(enum.Enum):
    ADMIN = 'ADMIN'
    TRAFFIC_OFFICER = 'TRAFFIC_OFFICER'
    ANALYST = 'ANALYST'
    VIEWER = 'VIEWER'

class CameraStatus(enum.Enum):
    ONLINE = 'ONLINE'
    OFFLINE = 'OFFLINE'
    DEGRADED = 'DEGRADED'

class VehicleType(enum.Enum):
    car = 'car'
    bike = 'bike'
    bus = 'bus'
    truck = 'truck'
    other = 'other'

class ConfidenceLevel(enum.Enum):
    HIGH = 'HIGH'
    MEDIUM = 'MEDIUM'
    LOW = 'LOW'

class AlertType(enum.Enum):
    BLACKLIST = 'BLACKLIST'
    LOW_CONFIDENCE = 'LOW_CONFIDENCE'
    ROUTE_ANOMALY = 'ROUTE_ANOMALY'
    CAMERA_OFFLINE = 'CAMERA_OFFLINE'
    CAMERA_DEGRADED = 'CAMERA_DEGRADED'
    CONGESTION = 'CONGESTION'
    TRAFFIC_ANOMALY = 'TRAFFIC_ANOMALY'

# Models
class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))

class Camera(Base):
    __tablename__ = 'cameras'
    id = Column(String(50), primary_key=True) # Let's keep UUID string here if possible, but let's add camera_id
    camera_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location = Column(String(255))
    road_name = Column(String(255))
    direction = Column(String(50))
    status = Column(Enum(CameraStatus), default=CameraStatus.OFFLINE)
    stream_type = Column(String(50), default='DemoVideoSource')
    last_heartbeat = Column(DateTime(timezone=True))
    fps = Column(Integer)
    processing_latency_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    geom = Column(Geometry('POINT', srid=4326))

class Vehicle(Base):
    __tablename__ = 'vehicles'
    plate_number = Column(String(50), primary_key=True)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True))
    predicted_type = Column(Enum(VehicleType))
    predicted_color = Column(String(50))

class Detection(Base):
    __tablename__ = 'detections'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    detection_id = Column(String(100), unique=True, index=True)
    camera_id = Column(String(50), ForeignKey('cameras.id', ondelete='CASCADE'))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    plate_number = Column(String(50), ForeignKey('vehicles.plate_number'))
    raw_ocr_text = Column(String(100))
    normalized_plate_number = Column(String(50))
    detection_confidence = Column(Float)
    ocr_confidence = Column(Float)
    quality_score = Column(Float)
    overall_confidence = Column(Float)
    confidence_level = Column(Enum(ConfidenceLevel))
    vehicle_image_path = Column(String(255))
    plate_crop_path = Column(String(255))
    enhanced_crop_path = Column(String(255))
    track_id = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    format_valid = Column(Boolean)
    processing_mode = Column(String(50)) # e.g., DEMO, REAL
    review_status = Column(String(50), default='PENDING') # PENDING, REVIEWED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    geom = Column(Geometry('POINT', srid=4326))
    
    camera = relationship("Camera")
    vehicle = relationship("Vehicle")

class TrajectoryPoint(Base):
    __tablename__ = 'trajectory_points'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate_number = Column(String(50), ForeignKey('vehicles.plate_number', ondelete='CASCADE'))
    camera_id = Column(String(50), ForeignKey('cameras.id', ondelete='SET NULL'))
    detection_id = Column(UUID(as_uuid=True), ForeignKey('detections.id'))
    timestamp = Column(DateTime(timezone=True))
    sequence_order = Column(Integer, nullable=False)
    geom = Column(Geometry('POINT', srid=4326))

class Blacklist(Base):
    __tablename__ = 'blacklist'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate_number = Column(String(50), unique=True, nullable=False)
    category = Column(String(100))
    reason = Column(Text)
    status = Column(String(50), default='ACTIVE')
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(Enum(AlertType), nullable=False)
    severity = Column(String(20), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    camera_id = Column(String(50), ForeignKey('cameras.id', ondelete='SET NULL'))
    plate_number = Column(String(50))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_resolved = Column(Boolean, default=False)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'))
    resolved_at = Column(DateTime(timezone=True))
    geom = Column(Geometry('POINT', srid=4326))

class TrafficMetric(Base):
    __tablename__ = 'traffic_metrics'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camera_id = Column(String(50), ForeignKey('cameras.id', ondelete='CASCADE'))
    time_bucket = Column(DateTime(timezone=True), nullable=False)
    vehicle_count = Column(Integer, default=0)
    car_count = Column(Integer, default=0)
    bike_count = Column(Integer, default=0)
    bus_count = Column(Integer, default=0)
    truck_count = Column(Integer, default=0)
    average_speed_kmh = Column(Float)
    density_level = Column(String(20))

class ODMovement(Base):
    __tablename__ = 'od_movements'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    origin_camera_id = Column(String(50), ForeignKey('cameras.id', ondelete='CASCADE'))
    destination_camera_id = Column(String(50), ForeignKey('cameras.id', ondelete='CASCADE'))
    time_bucket = Column(DateTime(timezone=True), nullable=False)
    volume = Column(Integer, default=0)
    avg_travel_time_seconds = Column(Float)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'))
    action = Column(String(100), nullable=False)
    resource = Column(String(100))
    resource_id = Column(String(255))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(Text)
    ip_address = Column(String(50))

class SystemSetting(Base):
    __tablename__ = 'system_settings'
    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
