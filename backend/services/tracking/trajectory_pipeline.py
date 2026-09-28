import logging
import json
from typing import List, Dict, Any, Tuple, Optional

from .candidate_retrieval import CandidateRetrievalService
from .vehicle_reid import VehicleReIDService
from .physics_filter import PhysicsFilterService, haversine_distance, format_travel_time
from .trajectory_smoothing import TrajectorySmoothingService
from services.map_matching import route_matcher

try:
    import folium
    FOLIUM_AVAILABLE = True
except ImportError:
    FOLIUM_AVAILABLE = False

logger = logging.getLogger(__name__)

SEGMENT_DEBUG_COLORS = [
    "green", "blue", "purple", "orange", "darkred",
    "cadetblue", "darkgreen", "black", "pink", "darkblue",
]

class TrajectoryPipeline:
    """
    Complete Multi-Camera Vehicle Trajectory Tracking Pipeline for Problem 2.
    
    Includes:
    1. Fuzzy candidate retrieval (OCR error matching)
    2. Haversine geographic distance calculation
    3. Travel-time & estimated speed calculation
    4. Spatio-temporal validation (flagging invalid/suspicious transitions)
    5. 4D Kalman Filter trajectory smoothing & state estimation
    """
    def __init__(self, max_speed_kmh: float = 120.0):
        self.retrieval = CandidateRetrievalService(threshold=85)
        self.reid = VehicleReIDService()
        self.physics = PhysicsFilterService(max_speed_kmh=max_speed_kmh)
        self.smoother = TrajectorySmoothingService(dt=1.0)
        self.map_matcher = route_matcher

    def reconstruct_trajectory(
        self,
        target_plate: str,
        historical_detections: List[Dict[str, Any]],
        vehicle_image=None
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Reconstructs a vehicle's route across multiple camera detections.
        """
        logger.info(f"Starting trajectory reconstruction for {target_plate}")

        # Step 1: Candidate Retrieval
        candidates = self.retrieval.find_candidates(target_plate, historical_detections)
        if not candidates:
            return None, f"No detections found for plate {target_plate}"

        # Sort chronologically by timestamp
        from .physics_filter import parse_timestamp
        candidates.sort(key=lambda x: parse_timestamp(x.get('timestamp', '00:00:00')))

        # Step 2: Transitions & Spatio-Temporal Validation
        transitions = []
        valid_count = 0
        suspicious_count = 0
        total_distance_km = 0.0
        total_time_seconds = 0.0

        for i in range(1, len(candidates)):
            prev = candidates[i - 1]
            curr = candidates[i]

            prev_cam = prev.get('camera_id') or prev.get('cameraId') or f"CAM_{i}"
            curr_cam = curr.get('camera_id') or curr.get('cameraId') or f"CAM_{i+1}"

            prev_loc = (
                float(prev.get('lat') if 'lat' in prev else prev.get('latitude', 0.0)),
                float(prev.get('lon') if 'lon' in prev else prev.get('longitude', 0.0))
            )
            curr_loc = (
                float(curr.get('lat') if 'lat' in curr else curr.get('latitude', 0.0)),
                float(curr.get('lon') if 'lon' in curr else curr.get('longitude', 0.0))
            )

            validation = self.physics.validate_transition(
                prev_cam, prev_loc, prev['timestamp'],
                curr_cam, curr_loc, curr['timestamp']
            )

            transitions.append(validation)
            total_distance_km += validation['distance_km']
            total_time_seconds += max(0.0, validation['travel_time_seconds'])

            if validation['status'] == 'VALID':
                valid_count += 1
            else:
                suspicious_count += 1

        # Step 3: Kalman Filtering (State estimation: pos & velocity)
        kalman_detections = self.smoother.process_detections_kalman(candidates)

        # Attach transition speeds back to kalman detections if available
        for i, k_det in enumerate(kalman_detections):
            if i > 0 and i - 1 < len(transitions):
                k_det['estimated_speed_kmh'] = transitions[i - 1]['estimated_speed_kmh']
                k_det['transition_status'] = transitions[i - 1]['status']

        # Step 4: Map Matching (Road graph snapping)
        coordinates = [
            {'lat': k['filtered_latitude'], 'lon': k['filtered_longitude']}
            for k in kalman_detections
        ]
        
        road_matched_path = []
        road_matched_segments = []
        if len(coordinates) >= 2:
            try:
                road_match_result = self.map_matcher.get_route(coordinates)
                road_matched_path = road_match_result.get("path", [])
                road_matched_segments = road_match_result.get("segments", [])
            except Exception as e:
                logger.warning(f"Map matching failed: {e}")
                road_matched_path = [[c['lat'], c['lon']] for c in coordinates]
        else:
            road_matched_path = [[c['lat'], c['lon']] for c in coordinates]

        overall_status = "VALID" if suspicious_count == 0 else "SUSPICIOUS"

        result = {
            "plate_text": target_plate.upper(),
            "description": "Trajectory smoothing and state estimation from noisy multi-camera observations.",
            "detections": kalman_detections,
            "transitions": transitions,
            "summary": {
                "total_distance_km": round(total_distance_km, 2),
                "total_travel_time_seconds": round(total_time_seconds, 1),
                "total_travel_time_formatted": format_travel_time(total_time_seconds),
                "overall_status": overall_status,
                "valid_transitions_count": valid_count,
                "suspicious_transitions_count": suspicious_count
            },
            "road_matched_path": road_matched_path,
            "road_matched_segments": road_matched_segments,
            "smoothed_path": [[k['filtered_latitude'], k['filtered_longitude']] for k in kalman_detections]
        }

        return result, None

    def plot_trajectory(self, route_coords, camera_points, output_file='trajectory_output.html', segments=None, debug=False):
        if not FOLIUM_AVAILABLE or not route_coords:
            return False

        start_loc = route_coords[0]
        m = folium.Map(location=[start_loc[0], start_loc[1]], zoom_start=13, tiles='OpenStreetMap')

        if debug and segments:
            for i, seg in enumerate(segments):
                if not seg:
                    continue
                color = SEGMENT_DEBUG_COLORS[i % len(SEGMENT_DEBUG_COLORS)]
                folium.PolyLine(
                    seg, color=color, weight=5, opacity=0.85,
                    tooltip=f"Segment {i + 1} ({len(seg)} points)"
                ).add_to(m)
        else:
            folium.PolyLine(route_coords, color='green', weight=4, opacity=0.8).add_to(m)

        for idx, cam in enumerate(camera_points):
            lat = cam.get('lat') if 'lat' in cam else cam.get('latitude', 0.0)
            lon = cam.get('lon') if 'lon' in cam else cam.get('longitude', 0.0)
            folium.CircleMarker(
                location=(lat, lon),
                radius=7, color='blue', fill=True, fill_color='blue', fill_opacity=1.0,
                popup=f"{cam.get('camera_id', f'Cam {idx}')} — {cam.get('timestamp', '')}"
            ).add_to(m)

        m.save(output_file)
        return True
