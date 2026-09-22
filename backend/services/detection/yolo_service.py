import os
import cv2
import logging
from pathlib import Path
from ultralytics import YOLO

logger = logging.getLogger(__name__)

class YoloService:
    def __init__(self, model_path: str = None, confidence_threshold: float = 0.5):
        self.confidence_threshold = confidence_threshold
        self.model = None
        self.model_loaded = False
        # Determine model path
        if not model_path:
            # Default custom weights path
            base_dir = Path(__file__).resolve().parent.parent.parent.parent
            model_path = os.path.join(base_dir, 'models', 'anpr_yolov8.pt')
            
        try:
            if os.path.exists(model_path):
                self.model = YOLO(model_path)
                self.model_loaded = True
                logger.info(f"Loaded YOLO model from {model_path}")
            else:
                logger.warning(f"YOLO model weights not found at {model_path}.")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {str(e)}")
            
    def detect(self, image_path_or_array):
        """
        Detect vehicles and license plates in an image.
        Returns: vehicles list, plates list (each item is dict with bbox, conf, class_id)
        """
        if not self.model_loaded:
            raise Exception("License plate detection model is not configured.")
            

        # Run inference
        results = self.model(image_path_or_array, conf=self.confidence_threshold)[0]
        
        vehicles = []
        plates = []
        
        # Parse results. Assuming class 0=vehicle, 1=plate (adjust based on custom model)
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            class_id = int(box.cls[0])
            
            det_data = {
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "confidence": conf,
                "class_id": class_id
            }
            
            # This logic needs to align with the actual model classes.
            # If standard yolov8n is used, cars/trucks/buses are 2, 5, 7.
            # For a custom ANPR model, it might be 0=vehicle, 1=plate.
            # We'll assume a custom ANPR model logic.
            if class_id == 0 or class_id in [2, 3, 5, 7]: # standard vehicles + custom vehicle class
                vehicles.append(det_data)
            elif class_id == 1 or class_id == 80: # custom plate class
                plates.append(det_data)
                
        return vehicles, plates
