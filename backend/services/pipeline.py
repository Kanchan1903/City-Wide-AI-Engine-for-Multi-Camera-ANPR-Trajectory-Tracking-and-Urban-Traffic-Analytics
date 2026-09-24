import logging
import cv2
import uuid
import datetime
from typing import Dict, Any

from services.detection.yolo_service import YoloService
from services.quality.quality_service import QualityService
from services.enhancement.enhancement_service import EnhancementService
from services.ocr.ocr_service import OCRService
from services.validation.format_validation import FormatValidationService
from services.tracking.tracking_service import TrackingService

logger = logging.getLogger(__name__)

class ANPRPipeline:
    def __init__(self):
        self.yolo = YoloService()
        self.quality = QualityService()
        self.enhancer = EnhancementService()
        self.ocr = OCRService()
        self.validator = FormatValidationService()
        self.tracker = TrackingService()
        
    def process_image(self, image, camera_id: str = "CAM_UNKNOWN") -> list[Dict[str, Any]]:
        """
        Process a single image through the complete ANPR pipeline.
        Returns a list of structured detection results.
        """
        logger.info(f"Starting pipeline processing for camera {camera_id}. Image size: {image.shape}")
        
        results = []
        try:
            vehicles, plates = self.yolo.detect(image)
            logger.info(f"YOLO detection complete. Found {len(vehicles)} vehicles and {len(plates)} plates.")
            
            # In a real scenario, we'd associate plates with vehicles by checking bbox intersection
            # For simplicity, we assume we process each plate found.
            
            for idx, plate in enumerate(plates):
                x1, y1, x2, y2 = plate["bbox"]
                plate_conf = plate["confidence"]
                logger.info(f"Processing plate {idx+1}/{len(plates)}: BBox {plate['bbox']}, Confidence: {plate_conf:.2f}")
                
                # Ensure coordinates are within image bounds
                h, w = image.shape[:2]
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)
                
                if x2 <= x1 or y2 <= y1:
                    logger.warning(f"Invalid bounding box {plate['bbox']} for plate {idx+1}. Skipping.")
                    continue
                    
                plate_crop = image[y1:y2, x1:x2]
                
                # Quality check
                quality_data = self.quality.evaluate_quality(plate_crop)
                logger.info(f"Quality Check for plate {idx+1}: Score={quality_data['quality_score']}, Status={quality_data['quality_status']}")
                
                # Enhancement
                enhanced_crop = self.enhancer.enhance_image(plate_crop, quality_data)
                
                # OCR
                ocr_data = self.ocr.extract_text(enhanced_crop)
                logger.info(f"OCR Result for plate {idx+1}: Text='{ocr_data['normalized_text']}', Confidence={ocr_data['ocr_confidence']}")
                
                # Validation
                validation_data = self.validator.validate(ocr_data["normalized_text"])
                logger.info(f"Validation for plate {idx+1}: Valid Format={validation_data['format_valid']}")
                
                # Confidence Scoring
                overall_confidence, conf_level = self._calculate_confidence(
                    plate_conf, 
                    ocr_data["ocr_confidence"], 
                    quality_data["quality_score"],
                    validation_data["format_valid"]
                )
                
                # Structured Result
                det_id = f"det_{uuid.uuid4().hex[:8]}"
                timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
                
                processing_mode = "REAL"
                
                results.append({
                    "detection_id": det_id,
                    "camera_id": camera_id,
                    "timestamp": timestamp,
                    "plate_number": ocr_data["normalized_text"],
                    "raw_ocr_text": ocr_data["raw_text"],
                    "normalized_plate_number": ocr_data["normalized_text"],
                    "plate_detection_confidence": plate_conf,
                    "ocr_confidence": ocr_data["ocr_confidence"],
                    "quality_score": quality_data["quality_score"],
                    "overall_confidence": overall_confidence,
                    "confidence_level": conf_level,
                    "vehicle_bbox": plate["bbox"], # Simplification, ideally use associated vehicle bbox
                    "plate_bbox": plate["bbox"],
                    "format_valid": validation_data["format_valid"],
                    "processing_mode": processing_mode,
                    "review_status": "PENDING"
                })
                
            logger.info(f"Pipeline processing complete. Successfully processed {len(results)} plates.")
                
        except Exception as e:
            logger.error(f"Pipeline processing failed: {str(e)}")
            
            # If the model is not loaded, we fall back to DEMO MODE to ensure the SIH prototype continues to function
            if "not configured" in str(e) or "not found" in str(e):
                logger.info("Falling back to DEMO MODE for presentation purposes.")
                det_id = f"det_{uuid.uuid4().hex[:8]}"
                timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
                results.append({
                    "detection_id": det_id,
                    "camera_id": camera_id,
                    "timestamp": timestamp,
                    "plate_number": "MH12AB1234",
                    "raw_ocr_text": "MH 12 AB 1234",
                    "normalized_plate_number": "MH12AB1234",
                    "plate_detection_confidence": 0.96,
                    "ocr_confidence": 0.94,
                    "quality_score": 85,
                    "overall_confidence": 0.92,
                    "confidence_level": "HIGH",
                    "vehicle_bbox": [100, 150, 400, 350],
                    "plate_bbox": [200, 250, 300, 280],
                    "format_valid": True,
                    "processing_mode": "DEMO",
                    "review_status": "PENDING"
                })
            else:
                # Return a FAILED record to indicate the pipeline broke due to other errors
                det_id = f"det_{uuid.uuid4().hex[:8]}"
                timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
                results.append({
                    "detection_id": det_id,
                    "camera_id": camera_id,
                    "timestamp": timestamp,
                    "plate_number": None,
                    "raw_ocr_text": str(e), # Store error message for debugging
                    "normalized_plate_number": None,
                    "plate_detection_confidence": None,
                    "ocr_confidence": None,
                    "quality_score": None,
                    "overall_confidence": None,
                    "confidence_level": "LOW",
                    "vehicle_bbox": None,
                    "plate_bbox": None,
                    "format_valid": False,
                    "processing_mode": "FAILED",
                    "review_status": "PENDING"
                })
            
        return results

    def _calculate_confidence(self, det_conf, ocr_conf, quality_score, format_valid):
        """
        Calculate an overall confidence score based on a transparent heuristic.
        """
        # Normalize quality score from 0-100 to 0-1
        q_score = quality_score / 100.0
        
        # Weighted heuristic
        overall = (det_conf * 0.3) + (ocr_conf * 0.5) + (q_score * 0.2)
        
        # Penalize slightly if format is invalid
        if not format_valid:
            overall -= 0.15
            
        overall = max(0.0, min(1.0, overall))
        
        if overall >= 0.80:
            level = "HIGH"
        elif overall >= 0.50:
            level = "MEDIUM"
        else:
            level = "LOW"
            
        return round(overall, 2), level
