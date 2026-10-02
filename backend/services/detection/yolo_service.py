import os
import cv2
import logging
from pathlib import Path
from ultralytics import YOLO

logger = logging.getLogger(__name__)

class YoloService:
    def __init__(self, model_path: str = None, confidence_threshold: float = 0.2):
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
        
        raw_plates = []
        
        # Parse results. Assuming class 0=vehicle, 1=plate (adjust based on custom model)
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            class_id = int(box.cls[0])
            area = (x2 - x1) * (y2 - y1)
            
            det_data = {
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "confidence": conf,
                "class_id": class_id,
                "area": area
            }
            
            raw_plates.append(det_data)

        # Custom NMS: Sort by area descending to prefer complete plates
        raw_plates.sort(key=lambda x: x["area"], reverse=True)
        
        plates = []
        for p in raw_plates:
            is_duplicate = False
            for accepted in plates:
                bb1 = p["bbox"]
                bb2 = accepted["bbox"]
                
                x_left = max(bb1[0], bb2[0])
                y_top = max(bb1[1], bb2[1])
                x_right = min(bb1[2], bb2[2])
                y_bottom = min(bb1[3], bb2[3])
                
                if x_right > x_left and y_bottom > y_top:
                    intersection_area = (x_right - x_left) * (y_bottom - y_top)
                    iou = intersection_area / float(p["area"] + accepted["area"] - intersection_area)
                    iom = intersection_area / float(min(p["area"], accepted["area"]))
                    
                    if iou > 0.3 or iom > 0.6:
                        is_duplicate = True
                        break
            
            if not is_duplicate:
                plates.append(p)
        
        vehicles = []
        for p in plates:
            x1, y1, x2, y2 = p["bbox"]
            margin = 20
            vehicles.append({
                "bbox": [max(0, int(x1)-margin), max(0, int(y1)-margin), int(x2)+margin, int(y2)+margin],
                "confidence": p["confidence"],
                "class_id": 0
            })
            p.pop("area", None)
                
        return vehicles, plates
