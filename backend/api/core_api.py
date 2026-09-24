from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from models.all_models import Camera, Blacklist, Alert, User, UserRole, TrajectoryPoint, Detection
from schemas.api_schemas import CameraResponse, CameraCreate, BlacklistResponse, BlacklistCreate, AlertResponse, TrajectoryPointResponse
from security.auth import get_current_user, require_role

router = APIRouter(tags=["Core APIs"])

# --- CAMERAS ---
@router.get("/cameras", response_model=List[CameraResponse])
def get_cameras(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cameras = db.query(Camera).all()
    return cameras

@router.post("/cameras", response_model=CameraResponse)
def create_camera(camera_in: CameraCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role([UserRole.ADMIN]))):
    # Setup PostGIS point string based on lat/lon
    geom_str = f"SRID=4326;POINT({camera_in.longitude} {camera_in.latitude})"
    db_camera = Camera(**camera_in.dict(), geom=geom_str)
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    return db_camera

@router.get("/cameras/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera

# --- BLACKLIST ---
@router.get("/blacklist", response_model=List[BlacklistResponse])
def get_blacklist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Blacklist).all()

@router.post("/blacklist", response_model=BlacklistResponse)
def add_to_blacklist(blacklist_in: BlacklistCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TRAFFIC_OFFICER]))):
    existing = db.query(Blacklist).filter(Blacklist.plate_number == blacklist_in.plate_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Plate already blacklisted")
    db_item = Blacklist(**blacklist_in.dict(), created_by=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/blacklist/{plate_number}")
def remove_from_blacklist(plate_number: str, db: Session = Depends(get_db), current_user: User = Depends(require_role([UserRole.ADMIN]))):
    item = db.query(Blacklist).filter(Blacklist.plate_number == plate_number).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found in blacklist")
    db.delete(item)
    db.commit()
    return {"detail": "Removed from blacklist"}

# --- ALERTS ---
@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(limit).all()
    return alerts

# --- VEHICLE TRAJECTORY ---
@router.get("/vehicles/{plate}/trajectory", response_model=List[TrajectoryPointResponse])
def get_vehicle_trajectory(plate: str, db: Session = Depends(get_db), current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TRAFFIC_OFFICER]))):
    points = db.query(TrajectoryPoint, Detection.ocr_confidence, Camera.latitude, Camera.longitude)\
        .join(Detection, TrajectoryPoint.detection_id == Detection.id)\
        .join(Camera, TrajectoryPoint.camera_id == Camera.id)\
        .filter(TrajectoryPoint.plate_number == plate)\
        .order_by(TrajectoryPoint.sequence_order)\
        .all()
    
    result = []
    for tp, conf, lat, lon in points:
        result.append({
            "id": tp.id,
            "camera_id": tp.camera_id,
            "timestamp": tp.timestamp,
            "sequence_order": tp.sequence_order,
            "ocr_confidence": conf,
            "latitude": lat,
            "longitude": lon
        })
    return result
