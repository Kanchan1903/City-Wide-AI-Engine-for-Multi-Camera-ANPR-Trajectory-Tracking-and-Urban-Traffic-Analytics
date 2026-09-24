import cv2
import numpy as np

class QualityService:
    def __init__(self, blur_threshold=100.0):
        self.blur_threshold = blur_threshold

    def evaluate_quality(self, image: np.ndarray) -> dict:
        """
        Evaluate image quality based on blur, brightness, contrast, and size.
        Returns a dictionary with scores and boolean flags.
        """
        if image is None or image.size == 0:
            return self._fail_result("Image is empty")

        height, width = image.shape[:2]
        
        # Convert to grayscale for most checks
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        # 1. Blur Check (Variance of Laplacian)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_blurry = blur_score < self.blur_threshold

        # 2. Brightness Check
        brightness_score = np.mean(gray) / 255.0
        is_underexposed = brightness_score < 0.2
        is_overexposed = brightness_score > 0.8

        # 3. Contrast Check (Standard deviation of pixel intensities)
        contrast_score = np.std(gray)
        is_low_contrast = contrast_score < 20.0

        # 4. Size Check
        is_too_small = width < 50 or height < 15

        # Overall Quality Score Calculation (heuristic)
        # 0 to 100 scale
        base_score = 100.0
        
        if is_blurry:
            base_score -= 30
        if is_underexposed or is_overexposed:
            base_score -= 20
        if is_low_contrast:
            base_score -= 15
        if is_too_small:
            base_score -= 40

        quality_score = max(0.0, min(100.0, base_score))
        
        quality_status = "ACCEPTABLE"
        recommended_action = "NONE"
        
        if quality_score < 40:
            quality_status = "POOR"
        elif quality_score < 75:
            quality_status = "MARGINAL"
            
        if is_blurry:
            recommended_action = "SHARPEN"
        if is_low_contrast or is_underexposed or is_overexposed:
            recommended_action = "CLAHE"
            
        return {
            "blur_score": round(blur_score, 2),
            "is_blurry": bool(is_blurry),
            "width": width,
            "height": height,
            "brightness_score": round(brightness_score, 2),
            "contrast_score": round(contrast_score, 2),
            "is_too_small": bool(is_too_small),
            "perspective_correction_required": False, # Placeholder for advanced perspective check
            "quality_score": round(quality_score, 2),
            "quality_status": quality_status,
            "recommended_action": recommended_action
        }

    def _fail_result(self, reason: str):
        return {
            "blur_score": 0.0,
            "is_blurry": True,
            "width": 0,
            "height": 0,
            "brightness_score": 0.0,
            "contrast_score": 0.0,
            "is_too_small": True,
            "perspective_correction_required": False,
            "quality_score": 0.0,
            "quality_status": "UNUSABLE",
            "recommended_action": "REJECT",
            "error": reason
        }
