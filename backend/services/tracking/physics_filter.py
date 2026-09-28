import math
from datetime import datetime
from typing import Tuple, Dict, Any, Union

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> Tuple[float, float]:
    """
    Calculate geographic distance between two coordinates using the Haversine formula.
    Input: (lat1, lon1), (lat2, lon2) in decimal degrees.
    Output: (distance in meters, distance in kilometers).
    Uses Earth radius R = 6,371,000 meters.
    """
    R_m = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance_m = R_m * c
    distance_km = distance_m / 1000.0
    return distance_m, distance_km

def format_travel_time(seconds: float) -> str:
    """Format seconds into human readable 'XX min XX sec' or 'XX sec'."""
    sec = int(round(seconds))
    if sec < 0:
        return "0 sec"
    mins = sec // 60
    rem_sec = sec % 60
    if mins > 0:
        return f"{mins} min {rem_sec} sec"
    return f"{rem_sec} sec"

def parse_timestamp(ts: Union[str, datetime, float, int]) -> datetime:
    """Parse various timestamp formats into a datetime object."""
    if isinstance(ts, datetime):
        return ts
    if isinstance(ts, (int, float)):
        return datetime.fromtimestamp(ts)
    if isinstance(ts, str):
        # Clean ISO Z timezone
        cleaned = ts.replace('Z', '+00:00')
        try:
            return datetime.fromisoformat(cleaned)
        except ValueError:
            pass
        # Handle 'HH:MM:SS' time format by anchoring to today
        parts = ts.split(':')
        if len(parts) == 3:
            h, m, s = map(int, parts)
            today = datetime.now()
            return datetime(today.year, today.month, today.day, h, m, s)
    raise ValueError(f"Unrecognized timestamp format: {ts}")

class PhysicsFilterService:
    def __init__(self, max_speed_kmh: float = 120.0):
        self.max_speed_kmh = max_speed_kmh

    def validate_transition(
        self,
        cam1_id: str,
        cam1_loc: Tuple[float, float],
        cam1_time: Union[str, datetime],
        cam2_id: str,
        cam2_loc: Tuple[float, float],
        cam2_time: Union[str, datetime]
    ) -> Dict[str, Any]:
        """
        Spatio-temporal validation between two camera detections.
        Calculates Haversine distance, travel time, estimated speed,
        and assigns transition status: VALID or SUSPICIOUS.
        """
        dt1 = parse_timestamp(cam1_time)
        dt2 = parse_timestamp(cam2_time)
        time_diff_seconds = (dt2 - dt1).total_seconds()

        distance_m, distance_km = haversine_distance(cam1_loc[0], cam1_loc[1], cam2_loc[0], cam2_loc[1])

        if time_diff_seconds <= 0:
            speed_kmh = 0.0
            if cam1_id == cam2_id and distance_km == 0.0:
                status = "SUSPICIOUS"
                reason = "Duplicate detection"
                detail = "Duplicate detection at same camera"
            else:
                status = "SUSPICIOUS"
                reason = "Temporally inconsistent"
                detail = f"Non-positive time interval ({time_diff_seconds:.1f}s)"
        else:
            speed_kmh = (distance_km / time_diff_seconds) * 3600.0
            if speed_kmh > self.max_speed_kmh:
                status = "SUSPICIOUS"
                reason = "Unrealistic travel speed"
                detail = f"Estimated speed {speed_kmh:.1f} km/h exceeds maximum limit of {self.max_speed_kmh} km/h"
            else:
                status = "VALID"
                reason = "Physically plausible transition"
                detail = f"Speed {speed_kmh:.1f} km/h is within realistic thresholds"

        return {
            "from_camera": cam1_id,
            "to_camera": cam2_id,
            "distance_m": round(distance_m, 1),
            "distance_km": round(distance_km, 2),
            "travel_time_seconds": round(time_diff_seconds, 1),
            "travel_time_formatted": format_travel_time(time_diff_seconds),
            "estimated_speed_kmh": round(speed_kmh, 1),
            "status": status,
            "validation_reason": reason,
            "detail": detail
        }

    def is_physically_possible(self, cam1_loc, cam1_time, cam2_loc, cam2_time) -> Tuple[bool, float]:
        """Backward-compatible helper method."""
        res = self.validate_transition("CAM_1", cam1_loc, cam1_time, "CAM_2", cam2_loc, cam2_time)
        return res["status"] == "VALID", res["estimated_speed_kmh"]
