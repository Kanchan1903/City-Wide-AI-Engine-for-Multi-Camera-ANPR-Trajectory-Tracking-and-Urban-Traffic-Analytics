import logging
import re
import numpy as np

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self, use_gpu: bool = False):
        self.ocr = None
        try:
            import easyocr
            self.ocr = easyocr.Reader(['en'], gpu=use_gpu)
            logger.info("EasyOCR loaded successfully.")
        except ImportError:
            logger.warning("EasyOCR not installed. Run 'pip install easyocr'.")
        except Exception as e:
            logger.error(f"Failed to initialize EasyOCR: {str(e)}")

    def extract_text(self, image: np.ndarray) -> dict:
        """
        Runs OCR on the provided image crop.
        Returns a dict with raw_text, normalized_text, and confidence.
        """
        if self.ocr is None:
            raise Exception("EasyOCR is not initialized. Cannot perform real inference.")
            
        try:
            # result is a list of tuples: (bbox, text, prob)
            result = self.ocr.readtext(image)
            if not result:
                return {"raw_text": "", "normalized_text": "", "ocr_confidence": 0.0}
                
            raw_text = ""
            total_conf = 0.0
            count = 0
            
            for (bbox, text, prob) in result:
                raw_text += text + " "
                total_conf += prob
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
        - Extract only the license plate substring to ignore noise (e.g. 'IND', dealership names)
        """
        text = text.upper()
        # Keep only alphanumeric
        clean_text = re.sub(r'[^A-Z0-9]', '', text)
        
        # Search for standard Indian plate pattern: MH12AB1234
        standard_match = re.search(r'[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}', clean_text)
        if standard_match:
            return standard_match.group(0)
            
        # Search for BH series pattern: 21BH1234AA
        bh_match = re.search(r'[0-9]{2}BH[0-9]{4}[A-Z]{1,2}', clean_text)
        if bh_match:
            return bh_match.group(0)
            
        # Fallback: strip 'IND' if present and return the rest
        if clean_text.startswith('IND'):
            clean_text = clean_text[3:]
            
        return clean_text
