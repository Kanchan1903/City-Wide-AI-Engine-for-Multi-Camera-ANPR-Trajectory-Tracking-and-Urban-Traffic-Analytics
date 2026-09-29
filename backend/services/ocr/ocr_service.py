import logging
import re
import numpy as np

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self, use_gpu: bool = False):
        self.ocr = None
        try:
            from paddleocr import PaddleOCR
            self.ocr = PaddleOCR(use_angle_cls=True, lang='en')
            logger.info("PaddleOCR loaded successfully.")
        except ImportError:
            logger.warning("PaddleOCR not installed.")
        except Exception as e:
            logger.error(f"Failed to initialize PaddleOCR: {str(e)}")

    def extract_text(self, image: np.ndarray) -> dict:
        """
        Runs OCR on the provided image crop.
        Returns a dict with raw_text, normalized_text, and confidence.
        """
        if self.ocr is None:
            raise Exception("PaddleOCR is not initialized. Cannot perform real inference.")
            
        try:
            result = self.ocr.ocr(image, cls=True)
            if not result or not result[0]:
                return {"raw_text": "", "normalized_text": "", "ocr_confidence": 0.0}
                
            raw_text = ""
            total_conf = 0.0
            count = 0
            
            for line in result[0]:
                text, conf = line[1]
                raw_text += text + " "
                total_conf += conf
                count += 1
                
            raw_text = raw_text.strip()
            avg_conf = total_conf / count if count > 0 else 0.0
            
            return {
                "raw_text": raw_text,
                "normalized_text": self.normalize_text(raw_text),
                "ocr_confidence": round(float(avg_conf), 2)
            }
        except Exception as e:
            logger.error(f"OCR Exception: {str(e)}")
            return {"raw_text": "", "normalized_text": "", "ocr_confidence": 0.0}

    def normalize_text(self, text: str) -> str:
        """
        Normalizes OCR text for Indian License Plates:
        - Uppercase
        - Remove spaces and special characters
        """
        text = text.upper()
        # Keep only alphanumeric
        text = re.sub(r'[^A-Z0-9]', '', text)
        return text
