import logging
import numpy as np

logger = logging.getLogger(__name__)

class TrackingService:
    def __init__(self):
        self.tracker = None
        self.demo_mode = False
        try:
            from ultralytics.trackers.byte_tracker import BYTETracker
            # Using ultralytics internal byte_tracker for ease of integration
            # Requires args which ultralytics provides, we simulate a simple args object
            class TrackerArgs:
                track_thresh = 0.5
                track_buffer = 30
                match_thresh = 0.8
                
            self.tracker = BYTETracker(args=TrackerArgs())
            logger.info("ByteTrack initialized.")
        except ImportError:
            logger.warning("ByteTracker not available. Falling back to DEMO track IDs.")
            self.demo_mode = True
        except Exception as e:
            logger.error(f"Failed to init ByteTrack: {str(e)}")
            self.demo_mode = True
            
        self.mock_track_counter = 1

    def update_tracks(self, detections, frame_img=None):
        """
        Takes YOLO detections and assigns tracking IDs.
        detections format: list of dicts with bbox, confidence, class_id
        """
        if self.demo_mode or self.tracker is None:
            return self._mock_tracking(detections)
            
        if not detections:
            return []
            
        # Convert to numpy array expected by BYTETracker: [x1, y1, x2, y2, conf, cls]
        dets_array = []
        for d in detections:
            x1, y1, x2, y2 = d["bbox"]
            conf = d["confidence"]
            cls = d["class_id"]
            dets_array.append([x1, y1, x2, y2, conf, cls])
            
        dets_array = np.array(dets_array)
        
        # We need to simulate the tracker update which usually expects (dets, img, img0)
        # However, ByteTrack only strictly needs bounding boxes and confidences for IOU matching
        # This implementation depends heavily on the specific ByteTracker version
        try:
            # ultralytics tracker.update requires (dets, img). 
            # We wrap it safely. If it fails, fallback.
            tracked_dets = self.tracker.update(dets_array, frame_img)
            
            results = []
            for t in tracked_dets:
                x1, y1, x2, y2, id_, conf, cls, _ = t # Track result format varies
                results.append({
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                    "confidence": float(conf),
                    "class_id": int(cls),
                    "track_id": f"track_{int(id_)}"
                })
            return results
        except Exception as e:
            logger.error(f"Tracker update failed: {e}")
            return self._mock_tracking(detections)

    def _mock_tracking(self, detections):
        results = []
        for d in detections:
            d_copy = d.copy()
            d_copy["track_id"] = f"track_{self.mock_track_counter:03d}"
            results.append(d_copy)
            self.mock_track_counter += 1
        return results
