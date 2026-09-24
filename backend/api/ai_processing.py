from fastapi import APIRouter, File, UploadFile
from typing import Dict, Any, List
from pydantic import BaseModel
import re
import random

router = APIRouter(prefix="/api/ocr", tags=["OCR Pipeline"])

INDIAN_PLATE_REGEX = re.compile(r"^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,2}\s?[0-9]{4}$")

class SimulatedOCRRequest(BaseModel):
    # Optional fields to force behavior for demo
    force_quality_issues: List[str] = []
    base_plate: str = "MH12AB1234"

def auto_correct_plate(plate: str) -> str:
    # Common confusions
    plate = plate.upper()
    # If the regex doesn't match perfectly, could do advanced fixes here
    return plate

@router.post("/process")
async def process_ocr(request: SimulatedOCRRequest = None) -> Dict[str, Any]:
    """
    Module 1 — ANPR/OCR Pipeline
    1. YOLOv8 crop
    2. Quality check
    3. Fixers
    4. PaddleOCR + VLM
    5. Regex validator
    """
    if request is None:
        request = SimulatedOCRRequest()

    # 1 & 2. Simulated YOLOv8 crop & Quality Check
    issues = request.force_quality_issues
    if not issues and random.random() < 0.3:
        possible_issues = ["blur", "small", "dirty", "angled", "weather"]
        issues = [random.choice(possible_issues)]
    
    quality_flags = {
        "blur": "blur" in issues,
        "small": "small" in issues,
        "dirty": "dirty" in issues,
        "angled": "angled" in issues,
        "weather": "weather" in issues
    }
    
    # 3. Apply Fixers
    applied_fixers = []
    if quality_flags["blur"]: applied_fixers.append("DeblurGAN-v2")
    if quality_flags["small"]: applied_fixers.append("Real-ESRGAN")
    if quality_flags["dirty"]: applied_fixers.append("LaMa")
    if quality_flags["angled"]: applied_fixers.append("OpenCV Perspective Fix")
    if quality_flags["weather"]: applied_fixers.extend(["Zero-DCE", "Deglare"])
    
    # 4. PaddleOCR & VLM
    paddle_text = request.base_plate
    vlm_text = request.base_plate
    
    # Introduce random errors if not fixed (just a simulation)
    if quality_flags["blur"] and "DeblurGAN-v2" not in applied_fixers:
        paddle_text = paddle_text.replace("B", "8").replace("O", "0")
        
    final_text = auto_correct_plate(vlm_text) # VLM and temporal voting
    
    # 5. Regex Validate
    is_valid_format = bool(INDIAN_PLATE_REGEX.match(final_text.replace(" ", "")))
    
    # Generate multiple plates for multi-lane simulation
    # If the user requests 'multi', we'll return 3 plates.
    num_plates = 3 if "multi" in request.force_quality_issues else 1
    
    detections = []
    for i in range(num_plates):
        plate_str = final_text if i == 0 else f"MH14CD{random.randint(1000, 9999)}"
        is_valid = bool(INDIAN_PLATE_REGEX.match(plate_str.replace(" ", "")))
        detections.append({
            "raw_detection_id": "sim-det-" + str(random.randint(1000, 9999)),
            "quality_flags": quality_flags,
            "applied_fixers": applied_fixers,
            "ocr_results": {
                "paddleocr": plate_str,
                "vlm": plate_str,
                "final_text": plate_str,
                "confidence": (0.95 if not issues else 0.88) - (i * 0.05),
                "matched_regex_format": is_valid
            }
        })
        
    return {
        "status": "success",
        "detections": detections
    }
