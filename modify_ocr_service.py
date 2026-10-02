import os

file_path = "d:/SIH_2026/backend/services/ocr/ocr_service.py"

content = """import logging
import re
import numpy as np

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self, use_gpu: bool = False):
        try:
            import pytesseract
            self.ocr_available = True
            logger.info("PyTesseract initialized successfully.")
        except ImportError:
            self.ocr_available = False
            logger.warning("PyTesseract not installed. Run 'pip install pytesseract'.")
        except Exception as e:
            self.ocr_available = False
            logger.error(f"Failed to initialize PyTesseract: {str(e)}")

    def extract_text(self, image: np.ndarray) -> dict:
        \"\"\"
        Runs OCR on the provided image crop using PyTesseract.
        Returns a dict with raw_text, normalized_text, and confidence.
        \"\"\"
        if not self.ocr_available:
            raise Exception("PyTesseract is not initialized. Cannot perform real inference.")
            
        try:
            import pytesseract
            
            # Using PSM 7 (single line of text) and whitelisting alphanumeric characters
            custom_config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            
            # Extract data including confidences
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, config=custom_config)
            
            raw_text = ""
            total_conf = 0.0
            count = 0
            
            for i in range(len(data['text'])):
                text = data['text'][i].strip()
                conf = int(data['conf'][i])
                
                # Confidence is -1 if it's not a recognized word block
                if text and conf > -1:
                    raw_text += text + " "
                    total_conf += conf
                    count += 1
                    
            raw_text = raw_text.strip()
            # Tesseract confidence is 0-100, we need 0-1.0
            avg_conf = (total_conf / count / 100.0) if count > 0 else 0.0
            
            return {
                "raw_text": raw_text,
                "normalized_text": self.normalize_text(raw_text),
                "ocr_confidence": round(float(avg_conf), 2)
            }
        except Exception as e:
            logger.error(f"OCR Exception: {str(e)}")
            return {"raw_text": "", "normalized_text": "", "ocr_confidence": 0.0}

    def normalize_text(self, text: str) -> str:
        \"\"\"
        Normalizes OCR text for Indian License Plates.
        \"\"\"
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
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("OCR service replaced with PyTesseract.")
 