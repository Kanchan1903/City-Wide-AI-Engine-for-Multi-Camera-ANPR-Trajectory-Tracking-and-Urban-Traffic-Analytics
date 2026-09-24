from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/api/analytics", tags=["Macro Analytics"])

@router.get("/density")
async def get_density() -> Dict[str, Any]:
    """
    Returns density: grouped trajectory_points by camera_id + 5-min bucket.
    """
    return {
        "status": "success",
        "data": [
            {"camera_id": "CAM-001", "time_bucket": "2026-09-03T10:00:00Z", "vehicle_count": 45},
            {"camera_id": "CAM-002", "time_bucket": "2026-09-03T10:00:00Z", "vehicle_count": 82}
        ]
    }

@router.get("/od-pairs")
async def get_od_pairs() -> Dict[str, Any]:
    """
    Returns Origin-Destination pairs from vehicle_tracks.
    """
    return {
        "status": "success",
        "data": [
            {"origin": "CAM-001", "destination": "CAM-005", "volume": 120},
            {"origin": "CAM-003", "destination": "CAM-001", "volume": 85}
        ]
    }

@router.get("/congestion")
async def get_congestion() -> Dict[str, Any]:
    """
    Returns congestion score (actual travel time vs expected).
    """
    return {
        "status": "success",
        "data": [
            {
                "corridor": "Main St - CAM-001 to CAM-002", 
                "expected_time_s": 120, 
                "actual_time_s": 250, 
                "status": "CONGESTED",
                "score": 2.1,
                "current_speed_kmh": 20,
                "path": [[18.5204, 73.8567], [18.5254, 73.8600]]
            },
            {
                "corridor": "Highway - CAM-003 to CAM-004", 
                "expected_time_s": 300, 
                "actual_time_s": 310, 
                "status": "CLEAR",
                "score": 1.03,
                "current_speed_kmh": 65,
                "path": [[18.5300, 73.8650], [18.5220, 73.8450]]
            },
            {
                "corridor": "North Exit - CAM-005 to City Border", 
                "expected_time_s": 180, 
                "actual_time_s": 410, 
                "status": "CONGESTED",
                "score": 2.28,
                "current_speed_kmh": 15,
                "path": [[18.5400, 73.8700], [18.5500, 73.8800]]
            }
        ]
    }

@router.get("/heatmap")
async def get_heatmap() -> Dict[str, Any]:
    """
    Grid-based heatmap rendering for Kepler.gl or Leaflet.heat
    """
    import random
    
    # Generate random points around Pune to simulate dense traffic heatmap
    base_lat, base_lon = 18.5204, 73.8567
    points = []
    
    # Main St cluster (Dense)
    for _ in range(300):
        points.append([
            base_lat + random.uniform(-0.01, 0.01),
            base_lon + random.uniform(-0.01, 0.01),
            random.uniform(0.5, 1.0)
        ])
        
    # East Junction (Moderate)
    for _ in range(150):
        points.append([
            18.5300 + random.uniform(-0.01, 0.01),
            73.8650 + random.uniform(-0.01, 0.01),
            random.uniform(0.3, 0.7)
        ])
        
    # West Bridge (Light)
    for _ in range(50):
        points.append([
            18.5220 + random.uniform(-0.005, 0.005),
            73.8450 + random.uniform(-0.005, 0.005),
            random.uniform(0.1, 0.4)
        ])

    return {
        "status": "success",
        "type": "HeatmapData",
        "data": points
    }

@router.get("/avg-speed")
async def get_avg_speed() -> Dict[str, Any]:
    """
    Returns average vehicle speed across segments.
    """
    return {
        "status": "success",
        "data": [
            {"segment": "CAM-001 -> CAM-002", "average_speed_kmh": 42},
            {"segment": "CAM-003 -> CAM-004", "average_speed_kmh": 15},
            {"segment": "CAM-004 -> CAM-005", "average_speed_kmh": 65}
        ]
    }

@router.get("/route-density")
async def get_route_density() -> Dict[str, Any]:
    """
    Returns vehicle count / density per route.
    """
    return {
        "status": "success",
        "data": [
            {"route": "Downtown Corridor", "vehicle_count": 1250, "density": "HIGH"},
            {"route": "Expressway Outbound", "vehicle_count": 800, "density": "MEDIUM"},
            {"route": "North Suburbs", "vehicle_count": 300, "density": "LOW"}
        ]
    }
