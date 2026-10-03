import cv2
import logging
logging.basicConfig(level=logging.INFO)
from services.ocr.ocr_service import OCRService

# OD02BN0026 is from car2.jpg? Let's check which image has OD02BN0026.
# If car2.jpg is not cropped, we should use the pipeline to detect the plate first, then OCR.
from services.pipeline import ANPRPipeline
pipeline = ANPRPipeline()
img = cv2.imread('d:/SIH_2026/backend/data/sample_cars/car2.jpg')
if img is None:
    img = cv2.imread('d:/SIH_2026/frontend/public/car2.jpg')

results = pipeline.process_image(img, "TEST")
print(results)
