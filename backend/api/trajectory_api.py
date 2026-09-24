from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from pydantic import BaseModel
from services.map_matching import route_matcher

router = APIRouter(
    prefix="/api/trajectory",
    tags=["trajectory"]
)

class PointCoordinate(BaseModel):
    lat: float
    lon: float

class RouteRequest(BaseModel):
    coordinates: List[PointCoordinate]

@router.post("/route")
async def calculate_route(request: RouteRequest) -> Dict[str, Any]:
    """
    Calculate the actual road network path between a sequence of coordinates.
    """
    if len(request.coordinates) < 2:
        return {"route": []}
        
    coords_dict = [{"lat": pt.lat, "lon": pt.lon} for pt in request.coordinates]
    
    try:
        path = route_matcher.get_route(coords_dict)
        return {"route": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from services.tracking.trajectory_pipeline import TrajectoryPipeline
import datetime

pipeline = TrajectoryPipeline()

@router.get("/{plate_text}")
async def get_trajectory(plate_text: str) -> Dict[str, Any]:
    """
    Returns ordered, timestamped, road-snapped route.
    Module 2 - Trajectory Tracking.
    """
    # Mock historical data for demonstration
    now = datetime.datetime.now()
    historical_detections = [
        {"plate_number": plate_text, "camera_id": "CAM_1", "timestamp": now.isoformat(), "lat": 18.559, "lon": 73.786},
        {"plate_number": plate_text[:3] + "X" + plate_text[4:], "camera_id": "CAM_2", "timestamp": (now + datetime.timedelta(minutes=5)).isoformat(), "lat": 18.525, "lon": 73.855}
    ]
    
    result, error = pipeline.reconstruct_trajectory(plate_text, historical_detections)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
        
    return {
        "plate_text": plate_text,
        "valid_detections": result["valid_detections"],
        "route": result["smoothed_path"]
    }
