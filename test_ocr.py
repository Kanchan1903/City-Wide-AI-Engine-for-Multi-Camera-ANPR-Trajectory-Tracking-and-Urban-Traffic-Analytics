import sys
import os
import cv2

# Add backend to path
sys.path.append(r"d:\SIH_2026\backend")

from services.ocr.ocr_service import OCRService

def test():
    uploads_dir = r"d:\SIH_2026\backend\data\uploads"
    from services.detection.yolo_service import YoloService
    yolo = YoloService()
    ocr = OCRService()
    
    for f in os.listdir(uploads_dir):
        if not f.startswith('6a098e2ad'): continue
        img_path = os.path.join(uploads_dir, f)
        print(f"--- Processing {f} ---")
        try:
            vehicles, plates = yolo.detect(img_path)
        except Exception as e:
            print("Yolo failed", e)
            continue
            
        if plates:
            img = cv2.imread(img_path)
            p = plates[0]
            x1, y1, x2, y2 = p["bbox"]
            w_box = x2 - x1
            h_box = y2 - y1
            pad_x = int(w_box * 0.15)
            pad_y = int(h_box * 0.10)
            h, w = img.shape[:2]
            x1, y1 = max(0, x1 - pad_x), max(0, y1 - pad_y)
            x2, y2 = min(w, x2 + pad_x), min(h, y2 + pad_y)
            crop = img[y1:y2, x1:x2]
            res = ocr.extract_text(crop)
            print("OCR Result:", res)


if __name__ == "__main__":
    test()
