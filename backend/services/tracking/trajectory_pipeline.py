import logging
import json

from .candidate_retrieval import CandidateRetrievalService
from .vehicle_reid import VehicleReIDService
from .physics_filter import PhysicsFilterService
from .trajectory_smoothing import TrajectorySmoothingService
from services.map_matching import route_matcher

try:
    import folium
    FOLIUM_AVAILABLE = True
except ImportError:
    FOLIUM_AVAILABLE = False

logger = logging.getLogger(__name__)

# Distinct colors cycled per segment when debug-plotting — makes it easy to
# spot visually if any single camera-to-camera hop is routing incorrectly.
SEGMENT_DEBUG_COLORS = [
    "green", "blue", "purple", "orange", "darkred",
    "cadetblue", "darkgreen", "black", "pink", "darkblue",
]


class TrajectoryPipeline:
    def __init__(self):
        # Initialize all 5 stages of the pipeline
        self.retrieval = CandidateRetrievalService(threshold=85)
        self.reid = VehicleReIDService()
        self.physics = PhysicsFilterService(max_speed_kmh=120)
        self.smoother = TrajectorySmoothingService(dt=1.0)
        self.map_matcher = route_matcher

    def reconstruct_trajectory(self, target_plate: str, historical_detections: list, vehicle_image=None):
        """
        Reconstructs a vehicle's route across multiple cameras.
        historical_detections: list of dicts with
            'plate_number', 'camera_id', 'timestamp', 'lat', 'lon', 'image_crop'
        """
        logger.info(f"Starting trajectory reconstruction for {target_plate}")

        # Stage 1: Candidate Retrieval (Fuzzy matching for OCR errors)
        candidates = self.retrieval.find_candidates(target_plate, historical_detections)
        if not candidates:
            return None, "No candidates found"

        # Sort chronologically for physics filter
        candidates.sort(key=lambda x: x['timestamp'])

        valid_matches = []

        # Stage 2 & 3: Re-ID & Physics Filter
        for i, curr in enumerate(candidates):
            if i == 0:
                # First detection is assumed valid for base of trajectory
                valid_matches.append(curr)
                continue

            prev = valid_matches[-1]

            # Stage 3: Physics Filter (Is it possible to travel this distance in this time?)
            is_valid_physics, speed = self.physics.is_physically_possible(
                (prev['lat'], prev['lon']), prev['timestamp'],
                (curr['lat'], curr['lon']), curr['timestamp']
            )

            if not is_valid_physics:
                logger.info(f"Rejected match due to physics violation (Implied speed: {speed} km/h)")
                continue

            # Stage 2: Re-ID Filter (Do the vehicles visually match?)
            if vehicle_image is not None and 'image_crop' in curr and curr['image_crop'] is not None:
                sim_score = self.reid.similarity_score(vehicle_image, curr['image_crop'])
                if sim_score < 0.80:
                    logger.info(f"Rejected match due to low Re-ID score ({sim_score})")
                    continue

            valid_matches.append(curr)

        if len(valid_matches) < 2:
            return valid_matches, "Insufficient valid points to reconstruct a trajectory"

        # Stage 4: Road Graph Matching (Snap to OSM roads segment-by-segment)
        coordinates = [{'lat': c['lat'], 'lon': c['lon']} for c in valid_matches]
        road_match_result = self.map_matcher.get_route(coordinates)
        road_matched_path = road_match_result["path"]
        road_matched_segments = road_match_result["segments"]  # one list per camera-to-camera hop

        # Stage 5: Trajectory Smoothing (Kalman Filter to remove jitters)
        final_smoothed_path = self.smoother.smooth_trajectory(road_matched_path)

        return {
            "valid_detections": valid_matches,
            "road_matched_path": road_matched_path,
            "road_matched_segments": road_matched_segments,
            "smoothed_path": final_smoothed_path,
        }, None

    def plot_trajectory(self, route_coords, camera_points, output_file='trajectory_output.html',
                         segments=None, debug=False):
        """
        Generates a Leaflet/Folium interactive map of the final trajectory.

        route_coords: the final path to draw as the primary trajectory line
        camera_points: confirmed camera detections to mark on the map
        segments: optional list of per-hop paths (from road_matched_segments).
                  When provided with debug=True, each hop is drawn in its own
                  color so you can visually confirm every segment follows the
                  correct road, instead of one solid line that hides which
                  hop (if any) is routing incorrectly.
        debug: if True and segments is provided, draw color-coded segments
               instead of a single solid polyline.
        """
        if not FOLIUM_AVAILABLE:
            logger.warning("Folium not installed. Cannot generate HTML map.")
            return False

        if not route_coords:
            return False

        start_loc = route_coords[0]
        m = folium.Map(location=[start_loc[0], start_loc[1]], zoom_start=13, tiles='OpenStreetMap')

        if debug and segments:
            # Draw each camera-to-camera hop in a distinct color so a
            # misrouted segment is immediately visible on the map.
            for i, seg in enumerate(segments):
                if not seg:
                    continue
                color = SEGMENT_DEBUG_COLORS[i % len(SEGMENT_DEBUG_COLORS)]
                folium.PolyLine(
                    seg, color=color, weight=5, opacity=0.85,
                    tooltip=f"Segment {i + 1} ({len(seg)} points)"
                ).add_to(m)
        else:
            # Normal mode: single solid line for the final trajectory
            folium.PolyLine(route_coords, color='green', weight=4, opacity=0.8).add_to(m)

        # Plot actual camera detection points
        for idx, cam in enumerate(camera_points):
            folium.CircleMarker(
                location=(cam['lat'], cam['lon']),
                radius=7, color='blue', fill=True, fill_color='blue', fill_opacity=1.0,
                popup=f"{cam.get('camera_id', f'Cam {idx}')} — {cam.get('timestamp', '')}"
            ).add_to(m)

        m.save(output_file)
        return True
