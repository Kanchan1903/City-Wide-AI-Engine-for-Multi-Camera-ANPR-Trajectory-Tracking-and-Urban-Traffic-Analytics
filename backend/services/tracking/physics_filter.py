from geopy.distance import geodesic
from datetime import datetime

class PhysicsFilterService:
    def __init__(self, max_speed_kmh=120):
        self.max_speed_kmh = max_speed_kmh

    def is_physically_possible(self, cam1_loc, cam1_time, cam2_loc, cam2_time):
        """
        cam1_loc, cam2_loc: (lat, lon) tuples
        cam1_time, cam2_time: datetime objects or ISO strings
        """
        if isinstance(cam1_time, str):
            cam1_time = datetime.fromisoformat(cam1_time.replace('Z', '+00:00'))
        if isinstance(cam2_time, str):
            cam2_time = datetime.fromisoformat(cam2_time.replace('Z', '+00:00'))
            
        distance_km = geodesic(cam1_loc, cam2_loc).km
        time_hours = abs((cam2_time - cam1_time).total_seconds()) / 3600.0

        if time_hours == 0:
            # Same timestamp, impossible unless distance is 0
            return distance_km == 0, 0.0

        implied_speed = distance_km / time_hours
        is_valid = implied_speed <= self.max_speed_kmh
        
        return is_valid, implied_speed
