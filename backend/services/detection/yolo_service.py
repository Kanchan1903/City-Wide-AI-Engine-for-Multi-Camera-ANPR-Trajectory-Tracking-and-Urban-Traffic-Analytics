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
        try:
            from huggingface_hub import hf_hub_download
            model_path = hf_hub_download(repo_id="Koushim/yolov8-license-plate-detection", filename="best.pt")
            self.model = YOLO(model_path)
            self.model_loaded = True
            logger.info(f"Loaded YOLO model from {model_path}")
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
            
            # For this license plate model, everything it detects is a plate
            plates.append(det_data)
            # We don't have vehicle bounding boxes in this model, so we fake one around the plate
            # or just leave it empty. We'll add a dummy vehicle box around the plate.
            margin = 20
            vehicles.append({
                "bbox": [max(0, int(x1)-margin), max(0, int(y1)-margin), int(x2)+margin, int(y2)+margin],
                "confidence": conf,
                "class_id": 0
            })
                
        return vehicles, plates
