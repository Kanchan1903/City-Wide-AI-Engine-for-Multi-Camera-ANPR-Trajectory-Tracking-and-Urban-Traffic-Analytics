from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from database.database import get_db
from models.all_models import User, UserRole, Camera, CameraStatus, Vehicle, VehicleType, Detection, ConfidenceLevel, Blacklist, Alert, AlertType, TrajectoryPoint
from security.auth import get_password_hash
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/demo", tags=["Demo Mode"])

def seed_database(db: Session):
    # Clear existing demo data
    db.query(Alert).delete()
    db.query(Blacklist).delete()
    db.query(TrajectoryPoint).delete()
    db.query(Detection).delete()
    db.query(Vehicle).delete()
    db.query(Camera).delete()
    
    # Create Default Admin & Officer if not exists
    if not db.query(User).filter(User.username == "admin").first():
        db.add(User(username="admin", hashed_password=get_password_hash("admin"), role=UserRole.ADMIN))
    if not db.query(User).filter(User.username == "officer").first():
        db.add(User(username="officer", hashed_password=get_password_hash("officer"), role=UserRole.TRAFFIC_OFFICER))
    
    db.commit()
    
    # Seed 5 Cameras
    cameras = [
        Camera(id="CAM-001", camera_id="CAM-001", name="Main Highway North", latitude=18.5204, longitude=73.8567, location="Pune Center", status=CameraStatus.ONLINE, geom="SRID=4326;POINT(73.8567 18.5204)"),
        Camera(id="CAM-002", camera_id="CAM-002", name="Main Highway South", latitude=18.5254, longitude=73.8600, location="Pune Market", status=CameraStatus.ONLINE, geom="SRID=4326;POINT(73.8600 18.5254)"),
        Camera(id="CAM-003", camera_id="CAM-003", name="East Junction", latitude=18.5300, longitude=73.8650, location="Pune East", status=CameraStatus.ONLINE, geom="SRID=4326;POINT(73.8650 18.5300)"),
        Camera(id="CAM-004", camera_id="CAM-004", name="West Bridge", latitude=18.5220, longitude=73.8450, location="Pune West", status=CameraStatus.ONLINE, geom="SRID=4326;POINT(73.8450 18.5220)"),
        Camera(id="CAM-005", camera_id="CAM-005", name="City Exit", latitude=18.5400, longitude=73.8700, location="Pune Exit", status=CameraStatus.ONLINE, geom="SRID=4326;POINT(73.8700 18.5400)")
    ]
    db.add_all(cameras)
    db.commit()

    # Seed 4 Demo Vehicles
    vehicles = [
        Vehicle(plate_number="MH12AB1234", predicted_type=VehicleType.car),
        Vehicle(plate_number="MH14XY5678", predicted_type=VehicleType.truck),
        Vehicle(plate_number="MH31XX9999", predicted_type=VehicleType.car), # Blacklisted
        Vehicle(plate_number="MH12A?234", predicted_type=VehicleType.car)
    ]
    db.add_all(vehicles)
    
    db.add(Blacklist(plate_number="MH31XX9999", category="STOLEN", reason="Reported stolen 2 days ago"))
    db.commit()

    # Seed Trajectory for MH12AB1234
    base_time = datetime.utcnow() - timedelta(hours=1)
    
    # Det 1 -> CAM-001
    d1 = Detection(camera_id="CAM-001", plate_number="MH12AB1234", timestamp=base_time, ocr_confidence=0.94, confidence_level=ConfidenceLevel.HIGH, geom="SRID=4326;POINT(73.8567 18.5204)")
    db.add(d1)
    db.commit()
    db.refresh(d1)
    db.add(TrajectoryPoint(plate_number="MH12AB1234", camera_id="CAM-001", detection_id=d1.id, timestamp=base_time, sequence_order=1, geom="SRID=4326;POINT(73.8567 18.5204)"))
    
    # Det 2 -> CAM-002
    t2 = base_time + timedelta(minutes=15)
    d2 = Detection(camera_id="CAM-002", plate_number="MH12AB1234", timestamp=t2, ocr_confidence=0.91, confidence_level=ConfidenceLevel.HIGH, geom="SRID=4326;POINT(73.8600 18.5254)")
    db.add(d2)
    db.commit()
    db.refresh(d2)
    db.add(TrajectoryPoint(plate_number="MH12AB1234", camera_id="CAM-002", detection_id=d2.id, timestamp=t2, sequence_order=2, geom="SRID=4326;POINT(73.8600 18.5254)"))
    
    # Det 3 -> CAM-004
    t3 = base_time + timedelta(minutes=28)
    d3 = Detection(camera_id="CAM-004", plate_number="MH12AB1234", timestamp=t3, ocr_confidence=0.95, confidence_level=ConfidenceLevel.HIGH, geom="SRID=4326;POINT(73.8450 18.5220)")
    db.add(d3)
    db.commit()
    db.refresh(d3)
    db.add(TrajectoryPoint(plate_number="MH12AB1234", camera_id="CAM-004", detection_id=d3.id, timestamp=t3, sequence_order=3, geom="SRID=4326;POINT(73.8450 18.5220)"))
    
    # Det 4 -> CAM-005
    t4 = base_time + timedelta(minutes=40)
    d4 = Detection(camera_id="CAM-005", plate_number="MH12AB1234", timestamp=t4, ocr_confidence=0.88, confidence_level=ConfidenceLevel.HIGH, geom="SRID=4326;POINT(73.8700 18.5400)")
    db.add(d4)
    db.commit()
    db.refresh(d4)
    db.add(TrajectoryPoint(plate_number="MH12AB1234", camera_id="CAM-005", detection_id=d4.id, timestamp=t4, sequence_order=4, geom="SRID=4326;POINT(73.8700 18.5400)"))

    # Blacklist Detection
    db.add(Detection(camera_id="CAM-003", plate_number="MH31XX9999", timestamp=datetime.utcnow() - timedelta(minutes=5), ocr_confidence=0.96, confidence_level=ConfidenceLevel.HIGH, geom="SRID=4326;POINT(73.8650 18.5300)"))
    db.add(Alert(type=AlertType.BLACKLIST, severity="CRITICAL", title="BLACKLISTED VEHICLE DETECTED", description="Vehicle MH31XX9999 spotted at CAM-003", camera_id="CAM-003", plate_number="MH31XX9999", geom="SRID=4326;POINT(73.8650 18.5300)"))
    
    # Route Anomaly
    db.add(Alert(type=AlertType.ROUTE_ANOMALY, severity="WARNING", title="SUSPICIOUS ROUTE DEVIATION", description="Vehicle MH14XY5678 performed illegal U-turn followed by unexpected looping.", camera_id="CAM-002", plate_number="MH14XY5678", geom="SRID=4326;POINT(73.8600 18.5254)"))
    
    # Low Confidence Detection (Needs Verification)
    db.add(Detection(camera_id="CAM-001", plate_number="MH12A?234", raw_ocr_text="MH12A?234", timestamp=datetime.utcnow() - timedelta(minutes=10), ocr_confidence=0.52, confidence_level=ConfidenceLevel.LOW, review_status='PENDING', geom="SRID=4326;POINT(73.8567 18.5204)"))
    db.add(Alert(type=AlertType.LOW_CONFIDENCE, severity="INFO", title="Low Confidence OCR", description="OCR Confidence 52% - Reprocess/Verify Required", camera_id="CAM-001", plate_number="MH12A?234", geom="SRID=4326;POINT(73.8567 18.5204)"))

    db.commit()

@router.post("/reset")
def reset_demo_data(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Run synchronously for now to ensure immediately available
    seed_database(db)
    return {"message": "Demo data reset successfully"}
