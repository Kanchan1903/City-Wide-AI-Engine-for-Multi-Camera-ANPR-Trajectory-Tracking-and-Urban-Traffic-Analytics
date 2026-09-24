import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

class EnhancementService:
    def enhance_image(self, image: np.ndarray, quality_data: dict) -> np.ndarray:
        """
        Apply enhancement based on the quality data recommendation.
        Returns the enhanced image array.
        """
        if image is None or image.size == 0:
            return image
            
        action = quality_data.get("recommended_action", "NONE")
        
        try:
            if action == "CLAHE":
                return self._apply_clahe(image)
            elif action == "SHARPEN":
                return self._apply_sharpen(image)
            elif action == "NONE":
                # Maybe apply a gentle denoise + resize for OCR if it's too small
                if quality_data.get("is_too_small", False):
                    return self._apply_upscale(image)
                return image
            else:
                return image
        except Exception as e:
            logger.error(f"Enhancement failed: {str(e)}")
            return image

    def _apply_clahe(self, image: np.ndarray) -> np.ndarray:
        """Apply Contrast Limited Adaptive Histogram Equalization"""
        # Convert to LAB color space
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_channel, a, b = cv2.split(lab)

        # Applying CLAHE to L-channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        cl = clahe.apply(l_channel)

        # merge the CLAHE enhanced L-channel with the a and b channel
        limg = cv2.merge((cl,a,b))

        # Converting image from LAB Color model to BGR color space
        enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        return enhanced_img

    def _apply_sharpen(self, image: np.ndarray) -> np.ndarray:
        """Apply a sharpening kernel"""
        kernel = np.array([[-1,-1,-1], 
                           [-1, 9,-1], 
                           [-1,-1,-1]])
        sharpened = cv2.filter2D(image, -1, kernel)
        return sharpened
        
    def _apply_upscale(self, image: np.ndarray) -> np.ndarray:
        """Simple upscaling using Lanczos interpolation"""
        height, width = image.shape[:2]
        # Upscale by 2x
        return cv2.resize(image, (width * 2, height * 2), interpolation=cv2.INTER_LANCZOS4)
        
    def denoise(self, image: np.ndarray) -> np.ndarray:
        """Apply fast non-local means denoising"""
        return cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
