import os
import cv2
from ultralytics import YOLO

class PlateDetector:
    def __init__(self, model_path=None):
        """
        Initialize the YOLOv8 license plate detector.
        If model_path is not provided, it attempts to download a pre-trained model from Hugging Face.
        """
        if model_path is None or not os.path.exists(model_path):
            print("Model path not provided or not found. Downloading pre-trained license plate model...")
            try:
                from huggingface_hub import hf_hub_download
                # A popular pre-trained YOLOv8 model for license plates
                model_path = hf_hub_download(repo_id="Koushim/yolov8-license-plate-detection", filename="best.pt")
                print(f"Downloaded model to {model_path}")
            except ImportError:
                print("huggingface_hub is not installed. Please install it with 'pip install huggingface_hub'")
                raise
            except Exception as e:
                print(f"Failed to download the model from Hugging Face: {e}")
                raise

        self.model = YOLO(model_path)
        print(f"Loaded YOLO model from {model_path}")

    def detect_plates(self, image_path_or_frame, conf_threshold=0.25):
        """
        Detect license plates in an image.
        Returns a list of bounding boxes: [x1, y1, x2, y2, confidence, class_id]
        """
        results = self.model(image_path_or_frame, conf=conf_threshold)
        
        plates = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                conf = float(box.conf[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                plates.append([x1, y1, x2, y2, conf, cls_id])
                
        return plates

if __name__ == "__main__":
    # Simple test if run directly
    detector = PlateDetector()
    print("Detector initialized successfully.")
