import numpy as np

try:
    from filterpy.kalman import KalmanFilter
    FILTERPY_AVAILABLE = True
except ImportError:
    FILTERPY_AVAILABLE = False

class TrajectorySmoothingService:
    def __init__(self, dt=1.0):
        self.dt = dt

    def build_kalman_filter(self):
        if not FILTERPY_AVAILABLE:
            return None
            
        kf = KalmanFilter(dim_x=4, dim_z=2)
        kf.F = np.array([[1, 0, self.dt, 0],
                         [0, 1, 0, self.dt],
                         [0, 0, 1, 0],
                         [0, 0, 0, 1]])
        kf.H = np.array([[1, 0, 0, 0],
                         [0, 1, 0, 0]])
        kf.R *= 25       
        kf.Q *= 0.1      
        kf.P *= 500      
        return kf

    def smooth_trajectory(self, points):
        """points: list of (lon, lat) or (lat, lon) sorted by time"""
        if not FILTERPY_AVAILABLE or len(points) == 0:
            return points # Fallback if library missing
            
        kf = self.build_kalman_filter()
        # Initialize state with first point
        kf.x = np.array([points[0][0], points[0][1], 0, 0])

        smoothed = []
        for pt in points:
            kf.predict()
            kf.update(np.array(pt))
            smoothed.append([kf.x[0], kf.x[1]])
            
        return smoothed
