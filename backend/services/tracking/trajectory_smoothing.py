import numpy as np
import math
from typing import List, Dict, Any, Tuple

class VehicleKalmanFilter:
    """
    2D Constant-Velocity Kalman Filter for Vehicle Trajectory Tracking.
    State vector x = [x_position, y_position, x_velocity, y_velocity]^T
    where x_position = longitude, y_position = latitude,
    and velocities are in degrees per second.

    Provides trajectory smoothing and state estimation from noisy multi-camera observations.
    """
    def __init__(self, process_noise_std: float = 1e-6, measurement_noise_std: float = 1e-4):
        # State vector: [longitude, latitude, vx, vy]^T
        self.x = np.zeros((4, 1), dtype=float)
        # Covariance matrix P
        self.P = np.eye(4, dtype=float) * 1e-4
        # Measurement matrix H (observes [longitude, latitude])
        self.H = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0]
        ], dtype=float)
        # Measurement noise covariance matrix R
        self.R = np.eye(2, dtype=float) * (measurement_noise_std ** 2)
        self.q_std = process_noise_std
        self.initialized = False
        self.last_obs_lat = 0.0
        self.last_obs_lon = 0.0

    def initialize(self, lat: float, lon: float):
        self.x = np.array([[lon], [lat], [0.0], [0.0]], dtype=float)
        self.P = np.eye(4, dtype=float) * 1e-5
        self.initialized = True
        self.last_obs_lat = lat
        self.last_obs_lon = lon

    def predict(self, dt_seconds: float) -> Tuple[float, float]:
        """
        Predicts vehicle position at time t + dt.
        Returns (predicted_latitude, predicted_longitude).
        """
        if not self.initialized:
            return 0.0, 0.0

        if dt_seconds <= 0:
            return float(self.x[1, 0]), float(self.x[0, 0])

        dt = float(dt_seconds)
        # State transition matrix F
        F = np.array([
            [1.0, 0.0, dt,  0.0],
            [0.0, 1.0, 0.0, dt ],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ], dtype=float)

        # Process noise covariance matrix Q
        q = self.q_std ** 2
        Q = np.eye(4, dtype=float) * q
        Q[0, 0] = q * dt
        Q[1, 1] = q * dt
        Q[2, 2] = q / 10.0
        Q[3, 3] = q / 10.0

        self.x = F @ self.x
        self.P = F @ self.P @ F.T + Q

        pred_lon = float(self.x[0, 0])
        pred_lat = float(self.x[1, 0])
        return pred_lat, pred_lon

    def update(self, lat: float, lon: float, dt_seconds: float = 0.0, measured_speed_kmh: float = 0.0) -> Tuple[float, float, float]:
        """
        Updates Kalman state with new observed position (lat, lon).
        Returns (filtered_latitude, filtered_longitude, estimated_velocity_kmh).
        """
        if not self.initialized:
            self.initialize(lat, lon)
            return lat, lon, round(measured_speed_kmh, 1)

        # Measurement vector z = [lon, lat]^T
        z = np.array([[lon], [lat]], dtype=float)

        # Measurement residual y = z - H*x
        y = z - (self.H @ self.x)

        # Residual covariance S = H*P*H^T + R
        S = self.H @ self.P @ self.H.T + self.R

        # Kalman Gain K = P * H^T * inv(S)
        K = self.P @ self.H.T @ np.linalg.inv(S)

        # Update state x = x + K*y
        self.x = self.x + (K @ y)

        # Update covariance P = (I - K*H) * P
        I = np.eye(4, dtype=float)
        self.P = (I - K @ self.H) @ self.P

        filtered_lon = float(self.x[0, 0])
        filtered_lat = float(self.x[1, 0])

        self.last_obs_lat = lat
        self.last_obs_lon = lon

        # Estimate velocity
        if measured_speed_kmh > 0:
            velocity_kmh = measured_speed_kmh
        else:
            vx = float(self.x[2, 0])
            vy = float(self.x[3, 0])
            lat_rad = math.radians(filtered_lat)
            vx_kmh = vx * 111320.0 * math.cos(lat_rad) * 3.6
            vy_kmh = vy * 111320.0 * 3.6
            velocity_kmh = math.sqrt(vx_kmh**2 + vy_kmh**2)

        return filtered_lat, filtered_lon, round(velocity_kmh, 1)


class TrajectorySmoothingService:
    """
    Trajectory Smoothing Service utilizing Kalman Filter for state estimation
    and trajectory smoothing across noisy multi-camera ANPR observations.
    """
    def __init__(self, dt: float = 1.0):
        self.dt = dt

    def process_detections_kalman(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Processes a chronological list of vehicle detections through the 4D Kalman Filter.
        For every detection, computes:
        - observed_latitude, observed_longitude
        - predicted_latitude, predicted_longitude
        - filtered_latitude, filtered_longitude
        - velocity (km/h)
        """
        if not detections:
            return []

        kf = VehicleKalmanFilter()
        kalman_records = []
        prev_time = None

        for idx, det in enumerate(detections):
            cam_id = det.get("camera_id") or det.get("cameraId") or f"CAM_{idx+1}"
            timestamp = str(det.get("timestamp", ""))
            obs_lat = float(det.get("lat") if "lat" in det else det.get("latitude", 0.0))
            obs_lon = float(det.get("lon") if "lon" in det else det.get("longitude", 0.0))

            dt_sec = 0.0
            if prev_time is not None:
                from .physics_filter import parse_timestamp
                try:
                    t1 = parse_timestamp(prev_time)
                    t2 = parse_timestamp(timestamp)
                    dt_sec = max(0.0, (t2 - t1).total_seconds())
                except Exception:
                    dt_sec = 0.0

            if not kf.initialized:
                kf.initialize(obs_lat, obs_lon)
                pred_lat, pred_lon = obs_lat, obs_lon
            else:
                pred_lat, pred_lon = kf.predict(dt_sec)

            speed_kmh = float(det.get("estimated_speed_kmh", 0.0))
            filt_lat, filt_lon, velocity = kf.update(obs_lat, obs_lon, dt_sec, speed_kmh)

            prev_time = timestamp

            kalman_records.append({
                "camera_id": cam_id,
                "timestamp": timestamp,
                "observed_latitude": round(obs_lat, 6),
                "observed_longitude": round(obs_lon, 6),
                "predicted_latitude": round(pred_lat, 6),
                "predicted_longitude": round(pred_lon, 6),
                "filtered_latitude": round(filt_lat, 6),
                "filtered_longitude": round(filt_lon, 6),
                "velocity": round(velocity, 1)
            })

        return kalman_records

    def smooth_trajectory(self, points: List[Any]) -> List[List[float]]:
        """Fallback for simple coordinate list smoothing."""
        if not points:
            return []
        
        # Convert points to dicts if needed
        formatted_dets = []
        for p in points:
            if isinstance(p, (list, tuple)):
                formatted_dets.append({"lat": p[0], "lon": p[1], "timestamp": ""})
            elif isinstance(p, dict):
                formatted_dets.append(p)
                
        records = self.process_detections_kalman(formatted_dets)
        return [[r["filtered_latitude"], r["filtered_longitude"]] for r in records]
