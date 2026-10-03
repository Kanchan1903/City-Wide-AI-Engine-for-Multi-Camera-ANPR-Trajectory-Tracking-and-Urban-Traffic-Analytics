import cv2
import json
import logging
logging.basicConfig(level=logging.INFO)

from services.pipeline import ANPRPipeline
pipeline = ANPRPipeline()
img = cv2.imread('d:/SIH_2026/backend/data/sample_cars/car1.jpg') # Try whatever image has KA01MN4259
if img is None:
    img = cv2.imread('d:/SIH_2026/frontend/public/car1.jpg')

results = pipeline.process_image(img, "TEST")
print(json.dumps(results, indent=2))
