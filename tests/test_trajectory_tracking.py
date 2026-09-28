import unittest
import math
from datetime import datetime

from backend.services.tracking.physics_filter import (
    haversine_distance,
    format_travel_time,
    PhysicsFilterService
)
from backend.services.tracking.trajectory_smoothing import (
    VehicleKalmanFilter,
    TrajectorySmoothingService
)
from backend.services.tracking.trajectory_pipeline import TrajectoryPipeline

class TestTrajectoryTracking(unittest.TestCase):
    """
    Comprehensive Test Suite for Problem 2: Vehicle Trajectory Tracking.
    Verifies ANPR detection -> Camera coordinates -> Haversine distance -> Time diff ->
    Speed calculation -> Spatio-temporal validation -> Kalman prediction ->
    Kalman filtering -> Final Trajectory.
    """

    def test_1_haversine_distance_calculation(self):
        """
        Verify Haversine formula calculation between geographic coordinates.
        Input: Hinjawadi (18.5590, 73.7860) -> Shivajinagar (18.5250, 73.8550).
        Output: Distance in meters and kilometers.
        """
        lat1, lon1 = 18.5590, 73.7860
        lat2, lon2 = 18.5250, 73.8550

        dist_m, dist_km = haversine_distance(lat1, lon1, lat2, lon2)

        # Haversine distance for Hinjawadi -> Shivajinagar is ~8.2 km (8200 m)
        self.assertAlmostEqual(dist_km, 8.20, delta=0.1)
        self.assertAlmostEqual(dist_m, 8198.0, delta=100.0)

        # Verify Haversine is NOT Euclidean distance (sqrt(dx^2 + dy^2))
        euclidean_dist = math.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2)
        self.assertNotEqual(round(dist_km, 2), round(euclidean_dist, 2))

    def test_2_travel_time_and_speed_calculation(self):
        """
        Verify travel time in seconds, formatted string, and estimated speed in km/h.
        """
        physics = PhysicsFilterService(max_speed_kmh=120.0)
        cam1_loc = (18.5590, 73.7860) # Hinjawadi
        cam2_loc = (18.5250, 73.8550) # Shivajinagar

        # 10:00:12 -> 10:05:14 (302 seconds = 5 min 2 sec)
        validation = physics.validate_transition(
            "CAM_001", cam1_loc, "10:00:12",
            "CAM_002", cam2_loc, "10:05:14"
        )

        self.assertEqual(validation["travel_time_seconds"], 302.0)
        self.assertEqual(validation["travel_time_formatted"], "5 min 2 sec")
        self.assertEqual(validation["distance_km"], 8.20)
        self.assertAlmostEqual(validation["estimated_speed_kmh"], 97.7, delta=1.0)
        self.assertEqual(validation["status"], "VALID")

    def test_3_spatio_temporal_validation(self):
        """
        Verify rejection/flagging of physically implausible transitions:
        - Non-positive time difference: 'Temporally inconsistent'
        - Unrealistic travel speed (>120 km/h): 'Unrealistic travel speed'
        - Duplicate detection at same camera: 'Duplicate detection'
        """
        physics = PhysicsFilterService(max_speed_kmh=120.0)
        cam1_loc = (18.5270, 73.8580) # JM Road
        cam2_loc = (18.5800, 73.9780) # Wagholi (14 km away)

        # 1. Unrealistic speed case (14 km in 375 sec = 134.8 km/h)
        speed_val = physics.validate_transition(
            "CAM_003", cam1_loc, "10:12:30",
            "CAM_004", cam2_loc, "10:18:45"
        )
        self.assertEqual(speed_val["status"], "SUSPICIOUS")
        self.assertEqual(speed_val["validation_reason"], "Unrealistic travel speed")

        # 2. Non-positive time difference
        time_val = physics.validate_transition(
            "CAM_001", cam1_loc, "10:15:00",
            "CAM_002", cam2_loc, "10:10:00"
        )
        self.assertEqual(time_val["status"], "SUSPICIOUS")
        self.assertEqual(time_val["validation_reason"], "Temporally inconsistent")

        # 3. Duplicate detection
        dup_val = physics.validate_transition(
            "CAM_001", cam1_loc, "10:15:00",
            "CAM_001", cam1_loc, "10:15:00"
        )
        self.assertEqual(dup_val["status"], "SUSPICIOUS")
        self.assertEqual(dup_val["validation_reason"], "Duplicate detection")

    def test_4_kalman_filter_prediction_and_filtering(self):
        """
        Verify 4D Kalman Filter estimating [x pos, y pos, x vel, y vel].
        For every observation, checks:
        - predicted_latitude & predicted_longitude
        - observed_latitude & observed_longitude
        - filtered_latitude & filtered_longitude
        - velocity
        """
        kf = VehicleKalmanFilter()

        # Step 1: Initial detection at CAM_001
        kf.initialize(18.5590, 73.7860)
        filt_lat1, filt_lon1, vel1 = kf.update(18.5590, 73.7860, dt_seconds=0.0)
        self.assertEqual(filt_lat1, 18.5590)
        self.assertEqual(filt_lon1, 73.7860)
        self.assertEqual(vel1, 0.0)

        # Step 2: Next detection at CAM_002 after 302 seconds
        dt = 302.0
        pred_lat2, pred_lon2 = kf.predict(dt)
        filt_lat2, filt_lon2, vel2 = kf.update(18.5250, 73.8550, dt_seconds=dt, measured_speed_kmh=97.7)

        self.assertAlmostEqual(pred_lat2, 18.5590, delta=0.01)
        self.assertAlmostEqual(pred_lon2, 73.7860, delta=0.01)
        self.assertAlmostEqual(filt_lat2, 18.5250, delta=0.01)
        self.assertAlmostEqual(filt_lon2, 73.8550, delta=0.01)
        self.assertEqual(vel2, 97.7)

    def test_5_full_trajectory_reconstruction_mh12ab1234(self):
        """
        Verify deterministic trajectory tracking for target vehicle MH12AB1234.
        Route: CAM_001 -> CAM_002 -> CAM_003 -> CAM_004.
        """
        pipeline = TrajectoryPipeline(max_speed_kmh=120.0)
        detections = [
            {"camera_id": "CAM_001", "timestamp": "10:00:12", "lat": 18.5590, "lon": 73.7860, "plate_number": "MH12AB1234"},
            {"camera_id": "CAM_002", "timestamp": "10:05:14", "lat": 18.5250, "lon": 73.8550, "plate_number": "MH12AB1234"},
            {"camera_id": "CAM_003", "timestamp": "10:12:30", "lat": 18.5270, "lon": 73.8580, "plate_number": "MH12AB1234"},
            {"camera_id": "CAM_004", "timestamp": "10:18:45", "lat": 18.5800, "lon": 73.9780, "plate_number": "MH12AB1234"},
        ]

        result, error = pipeline.reconstruct_trajectory("MH12AB1234", detections)

        self.assertIsNone(error)
        self.assertIsNotNone(result)
        self.assertEqual(result["plate_text"], "MH12AB1234")
        self.assertEqual(result["description"], "Trajectory smoothing and state estimation from noisy multi-camera observations.")
        self.assertEqual(len(result["detections"]), 4)
        self.assertEqual(len(result["transitions"]), 3)

        # Check transition details
        t1 = result["transitions"][0]
        self.assertEqual(t1["from_camera"], "CAM_001")
        self.assertEqual(t1["to_camera"], "CAM_002")
        self.assertEqual(t1["status"], "VALID")

        t3 = result["transitions"][2]
        self.assertEqual(t3["from_camera"], "CAM_003")
        self.assertEqual(t3["to_camera"], "CAM_004")
        self.assertEqual(t3["status"], "SUSPICIOUS")
        self.assertEqual(t3["validation_reason"], "Unrealistic travel speed")

        # Check Kalman filter records schema per detection
        for k_det in result["detections"]:
            self.assertIn("observed_latitude", k_det)
            self.assertIn("observed_longitude", k_det)
            self.assertIn("predicted_latitude", k_det)
            self.assertIn("predicted_longitude", k_det)
            self.assertIn("filtered_latitude", k_det)
            self.assertIn("filtered_longitude", k_det)
            self.assertIn("velocity", k_det)

if __name__ == "__main__":
    unittest.main()
