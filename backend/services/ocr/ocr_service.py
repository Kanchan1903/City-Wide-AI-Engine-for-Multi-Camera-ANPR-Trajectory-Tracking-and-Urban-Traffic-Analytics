import logging
import re
import numpy as np
import os
import sys

# Add project root to path so we can import from the 'ai' module
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../.."))
if project_root not in sys.path:
    sys.path.append(project_root)

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self, use_gpu: bool = True):
        try:
            from ai.ocr_engine.reader import OCRReader
            self.reader = OCRReader()
            self.ocr_available = True
            logger.info("EasyOCR initialized successfully using pre-existing trained model.")
        except ImportError as e:
            self.ocr_available = False
            logger.warning(f"EasyOCR reader module not found: {e}")
        except Exception as e:
            self.ocr_available = False
            logger.error(f"Failed to initialize EasyOCR: {str(e)}")

    def extract_text(self, image: np.ndarray) -> dict:
        """
        Runs OCR on the provided image crop using the pre-existing trained model (EasyOCR).
        Returns a dict with raw_text, normalized_text, and confidence.
        Uses multiple passes to improve accuracy and returns 'Unable to read plate' if illegible.
        """
        if not self.ocr_available:
            raise Exception("OCR model is not initialized. Cannot perform inference.")
            
        try:
            import cv2
            passes = []
            # Pass 1: Original image
            passes.append(image)
            
            # Pass 2: Grayscale and 2x scaled
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            scaled = cv2.resize(gray, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
            passes.append(scaled)
            
            # Pass 3: CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            cl1 = clahe.apply(scaled)
            passes.append(cl1)
            
            best_text = ""
            best_norm = ""
            best_conf = 0.0
            
            for p in passes:
                raw_text, ocr_confidence = self.reader.read_text(p)
                norm = self.normalize_text(raw_text)
                
                # We prefer a valid normalized text with the highest confidence
                if norm:
                    # check if it looks like a valid Indian plate (MH12, OD11, etc.)
                    # normalize_text already returns standard_match if it found one
                    if ocr_confidence > best_conf:
                        best_conf = ocr_confidence
                        best_text = raw_text
                        best_norm = norm

            if not best_norm or best_conf < 0.2:
                best_norm = "Unable to read plate"
            
            return {
                "raw_text": best_text,
                "normalized_text": best_norm,
                "ocr_confidence": round(float(best_conf), 2)
            }
        except Exception as e:
            logger.error(f"OCR Exception: {str(e)}")
            return {"raw_text": "", "normalized_text": "Unable to read plate", "ocr_confidence": 0.0}

    def normalize_text(self, text: str) -> str:
        """
        Normalizes OCR text for Indian License Plates.
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
