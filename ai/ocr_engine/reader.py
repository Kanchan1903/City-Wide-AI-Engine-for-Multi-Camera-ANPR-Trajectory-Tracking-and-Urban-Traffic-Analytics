import easyocr
import cv2
import numpy as np

class OCRReader:
    def __init__(self, languages=['en']):
        """
        Initialize the EasyOCR reader.
        For Indian number plates, English ('en') is usually sufficient as they follow 
        the format like MH 12 AB 1234.
        """
        print(f"Initializing EasyOCR with languages: {languages} (This may take a moment to download models on first run...)")
        self.reader = easyocr.Reader(languages, gpu=True) # Will fallback to CPU if no GPU
        print("EasyOCR initialized.")

    def read_text(self, image_crop):
        """
        Read text from an image crop (numpy array).
        Returns the concatenated text string and the average confidence.
        """
        # Preprocessing image can improve OCR (grayscale, thresholding, etc.)
        # However, EasyOCR is quite robust so we can try feeding it directly first.
        # Ensure it's a numpy array
        if not isinstance(image_crop, np.ndarray):
            print("Error: Input to read_text must be a numpy array (image crop).")
            return "", 0.0

        # Run OCR
        results = self.reader.readtext(image_crop)
        
        if not results:
            return "", 0.0

        texts = []
        confidences = []
        for (bbox, text, prob) in results:
            # Filter out very low confidence predictions or junk characters if necessary
            if prob > 0.1: 
                # Keep alphanumeric characters
                cleaned_text = ''.join(e for e in text if e.isalnum())
                if cleaned_text:
                    texts.append(cleaned_text)
                    confidences.append(prob)

        final_text = " ".join(texts)
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        
        return final_text.upper(), avg_confidence

if __name__ == "__main__":
    # Test initialization
    ocr = OCRReader()
    print("OCR Reader initialized successfully.")
