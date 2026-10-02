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

    def _correct_character(self, char: str, expected_type: str) -> str:
        """
        expected_type: 'L' for Letter, 'D' for Digit, 'RTO_D' for RTO Digit
        """
        char = char.upper()
        if expected_type == 'L':
            mapping = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '6': 'G', '8': 'B', '4': 'A', '7': 'T'}
            return mapping.get(char, char)
        elif expected_type == 'D':
            mapping = {'O': '0', 'I': '1', 'L': '1', 'Z': '2', 'S': '5', 'G': '6', 'B': '8', 'A': '4', 'T': '7', 'D': '0'}
            return mapping.get(char, char)
        elif expected_type == 'RTO_D':
            # Specific positional mapping for RTO codes. 
            # OCR frequently merges the state-RTO hyphen with '1', misinterpreting '-1' as '7' or 'T'.
            mapping = {'O': '0', 'I': '1', 'L': '1', 'Z': '2', 'S': '5', 'G': '6', 'B': '8', 'A': '4', 'T': '1', 'D': '0', '7': '1'}
            return mapping.get(char, char)
        return char

    def correct_plate_format(self, text: str) -> str:
        """
        Attempts to coerce string into standard Indian format.
        """
        clean = ''.join(c for c in text.upper() if c.isalnum())
        
        # Robust heuristic based on length (8, 9, 10)
        if len(clean) in [8, 9, 10]:
            p1_raw = clean[:2]
            p1 = "".join(self._correct_character(c, 'L') for c in p1_raw)
            
            # State code correction
            valid_states = ["AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ", "HR", "HP", "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML", "MN", "MP", "MZ", "NL", "OD", "PB", "PY", "RJ", "SK", "TN", "TR", "TS", "UK", "UP", "WB"]
            
            if p1 not in valid_states:
                # Common misreads for OD
                if p1 in ["OO", "O0", "0O", "00", "Q0", "QO", "0D", "CD", "C0", "CO"]:
                    p1 = "OD"
                elif p1 in ["NH", "MN", "MM"]:
                    p1 = "MH"
                elif p1 in ["UP", "VP"]:
                    p1 = "UP"
                elif p1 in ["TN", "TM"]:
                    p1 = "TN"
                elif p1 in ["HR", "MR"]:
                    p1 = "HR"
                elif p1 in ["DL", "OL", "0L"]:
                    p1 = "DL"
                elif p1 in ["RJ", "PJ"]:
                    p1 = "RJ"
                elif p1 in ["KA", "KR"]:
                    p1 = "KA"
                elif p1 in ["TS", "T5"]:
                    p1 = "TS"
                elif p1 in ["AP", "4P"]:
                    p1 = "AP"
                
            p4 = "".join(self._correct_character(c, 'D') for c in clean[-4:])
            middle = clean[2:-4]
            
            if len(middle) == 2:
                # Typically DL 8 C 1234 -> middle '8C'
                p2 = self._correct_character(middle[0], 'RTO_D')
                p3 = self._correct_character(middle[1], 'L')
            elif len(middle) == 3:
                # Typically MH 12 F 1234 -> middle '12F'
                p2 = "".join(self._correct_character(c, 'RTO_D') for c in middle[:2])
                p3 = "".join(self._correct_character(c, 'L') for c in middle[2:])
            elif len(middle) == 4:
                # Typically MH 12 DE 1234 -> middle '12DE'
                p2 = "".join(self._correct_character(c, 'RTO_D') for c in middle[:2])
                p3 = "".join(self._correct_character(c, 'L') for c in middle[2:])
            else:
                return clean
            return p1 + p2 + p3 + p4
            
        return clean

    def extract_text(self, image: np.ndarray) -> dict:
        """
        Runs OCR on the provided image crop using the pre-existing trained model (EasyOCR).
        Returns a dict with raw_text, normalized_text, and confidence.
        Uses exhaustive Candidate Aggregation to improve accuracy.
        """
        if not self.ocr_available:
            raise Exception("OCR model is not initialized. Cannot perform inference.")
            
        try:
            import cv2
            passes = []
            
            # Pass 1: Original image
            passes.append(image)
            
            # Pass 2: Grayscale and 3x scaled
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            scaled = cv2.resize(gray, None, fx=3.0, fy=3.0, interpolation=cv2.INTER_CUBIC)
            passes.append(scaled)
            
            # Pass 3: CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            cl1 = clahe.apply(scaled)
            passes.append(cl1)
            
            # Pass 4: Adaptive Gaussian Thresholding
            thresh = cv2.adaptiveThreshold(cl1, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            passes.append(thresh)
            
            # Pass 5: Sharpening Filter
            kernel = np.array([[0, -1, 0], [-1, 5,-1], [0, -1, 0]])
            sharpened = cv2.filter2D(scaled, -1, kernel)
            passes.append(sharpened)
            
            # Pass 6: Morphological Closing (connect broken characters)
            kernel_morph = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
            closed = cv2.morphologyEx(cl1, cv2.MORPH_CLOSE, kernel_morph)
            passes.append(closed)
            
            candidates = []
            
            for p in passes:
                raw_text, ocr_confidence = self.reader.read_text(p)
                clean_text = ''.join(c for c in raw_text.upper() if c.isalnum())
                if len(clean_text) >= 6:
                    candidates.append((clean_text, ocr_confidence, raw_text))
            
            logger.info(f"==== OCR CANDIDATES ====")
            for c in candidates:
                logger.info(f"Raw: {c[2]}, Clean: {c[0]}, Conf: {c[1]}")
            logger.info(f"========================")
            
            # Tier evaluation and Confidence Boosting
            strict_pattern = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$'
            valid_states = ["AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ", "HR", "HP", "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML", "MN", "MP", "MZ", "NL", "OD", "PB", "PY", "RJ", "SK", "TN", "TR", "TS", "UK", "UP", "WB"]
            
            # Group by final_text to find agreement across preprocessing passes
            aggregated_results = {}
            
            for clean_text, conf, raw_text in candidates:
                # Check Tier 1 (Perfect Match)
                if re.match(strict_pattern, clean_text) and clean_text[:2] in valid_states:
                    tier = 1
                    final_text = clean_text
                else:
                    # Check Tier 2 (Correctable Match)
                    corrected = self.correct_plate_format(clean_text)
                    if re.match(strict_pattern, corrected) and corrected[:2] in valid_states:
                        tier = 2
                        final_text = corrected
                    else:
                        tier = 3
                        final_text = clean_text
                        
                if final_text not in aggregated_results:
                    aggregated_results[final_text] = {
                        'raw': raw_text,
                        'tier': tier,
                        'max_conf': conf,
                        'votes': 1
                    }
                else:
                    aggregated_results[final_text]['votes'] += 1
                    if conf > aggregated_results[final_text]['max_conf']:
                        aggregated_results[final_text]['max_conf'] = conf
                        aggregated_results[final_text]['raw'] = raw_text
                    if tier < aggregated_results[final_text]['tier']:
                        aggregated_results[final_text]['tier'] = tier
            
            best_cand = None
            for final_text, data in aggregated_results.items():
                tier = data['tier']
                base_conf = data['max_conf']
                votes = data['votes']
                
                # Simple score to pick the best candidate
                score = base_conf + (0.1 * votes) + (0.2 if tier == 1 else (0.1 if tier == 2 else 0))
                
                if not best_cand or tier < best_cand['tier'] or (tier == best_cand['tier'] and score > best_cand['score']):
                    best_cand = {
                        'final': final_text,
                        'raw': data['raw'],
                        'base_conf': base_conf,
                        'tier': tier,
                        'score': score
                    }
                    
            if best_cand and best_cand['tier'] != 3:
                best_final = best_cand['final']
                total_chars = len(best_final)
                total_passes = len(candidates)
                
                matching_chars = 0
                for c_text, c_conf, c_raw in candidates:
                    c_corrected = c_text
                    if not re.match(strict_pattern, c_text):
                        c_corrected = self.correct_plate_format(c_text)
                    
                    # Align character-by-character
                    for i in range(total_chars):
                        if i < len(c_corrected) and c_corrected[i] == best_final[i]:
                            matching_chars += 1
                            
                char_agreement_ratio = matching_chars / (total_chars * total_passes) if (total_chars * total_passes) > 0 else 0
                
                # Calculate agreement bonus based on votes (out of 6 passes)
                agreement_bonus = 0.0
                if votes == 2:
                    agreement_bonus = 0.05
                elif votes == 3:
                    agreement_bonus = 0.10
                elif votes >= 4:
                    agreement_bonus = 0.15
                    
                # Calculate format bonus and define a logical floor
                format_bonus = 0.0
                format_floor = 0.0
                if best_cand['tier'] == 1:
                    format_bonus = 0.20
                    format_floor = 0.85 # Perfect syntax match must not be below 85%
                elif best_cand['tier'] == 2:
                    format_bonus = 0.15
                    format_floor = 0.75 # Corrected syntax match must not be below 75%
                    
                # Final confidence is base OCR evidence + bonuses
                final_confidence = best_cand['base_conf'] + agreement_bonus + format_bonus
                
                # Ensure the confidence doesn't arbitrarily drop below the format floor
                if final_confidence < format_floor:
                    final_confidence = format_floor
                
                best_cand['final_confidence'] = min(0.99, final_confidence)
                best_cand['char_agreement'] = char_agreement_ratio
                
                logger.info(f"--- CONFIDENCE DEBUG ---")
                logger.info(f"Raw OCR confidence: {best_cand['base_conf']}")
                logger.info(f"Normalized plate: {best_cand['final']}")
                logger.info(f"Format valid: {best_cand['tier'] in [1, 2]}")
                logger.info(f"Character agreement: {char_agreement_ratio}")
                logger.info(f"OCR consensus: {votes} passes")
                logger.info(f"Complete plate recognized: {len(best_cand['final']) >= 8}")
                logger.info(f"Final recognition confidence: {best_cand['final_confidence']}")
                logger.info(f"------------------------")
                
            elif best_cand:
                best_cand['final_confidence'] = min(0.99, best_cand['base_conf'])
                    
            if not best_cand or best_cand['tier'] == 3:
                # Fallback to legacy normalization if no strict match
                if best_cand and best_cand.get('final_confidence', 0) > 0.4:
                    best_norm = self.normalize_text(best_cand['raw'])
                    if not best_norm:
                        best_norm = "Unable to read plate"
                    return {
                        "raw_text": best_cand['raw'],
                        "normalized_text": best_norm,
                        "raw_ocr_confidence": round(float(best_cand['base_conf']), 2),
                        "final_confidence": round(float(best_cand['final_confidence']), 2)
                    }
                return {"raw_text": "", "normalized_text": "Unable to read plate", "raw_ocr_confidence": 0.0, "final_confidence": 0.0}
            
            return {
                "raw_text": best_cand['raw'],
                "normalized_text": best_cand['final'],
                "raw_ocr_confidence": round(float(best_cand['base_conf']), 2),
                "final_confidence": round(float(best_cand['final_confidence']), 2)
            }
            
        except Exception as e:
            logger.error(f"OCR Exception: {str(e)}")
            return {"raw_text": "", "normalized_text": "Unable to read plate", "ocr_confidence": 0.0}

    def normalize_text(self, text: str) -> str:
        """
        Normalizes OCR text for Indian License Plates (Legacy Fallback).
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
