import cv2
import argparse
import os
import sys

# Add the project root to the python path so we can import from ai package
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai.plate_detector.detector import PlateDetector
from ai.ocr_engine.reader import OCRReader

def main():
    parser = argparse.ArgumentParser(description="Test ANPR Pipeline (Detection + OCR)")
    parser.add_argument("--image", type=str, default="dummy.jpg", help="Path to input image")
    parser.add_argument("--output", type=str, default="result.jpg", help="Path to save output image")
    args = parser.parse_args()

    if not os.path.exists(args.image):
        print(f"Error: Input image '{args.image}' not found.")
        # If dummy.jpg doesn't exist, just create a black image to test the pipeline (though it won't find plates)
        print("Please provide a valid image with cars/license plates.")
        return

    print(f"Loading image {args.image}...")
    image = cv2.imread(args.image)
    if image is None:
        print("Error: Could not read image.")
        return

    # Initialize modules
    print("Initializing components...")
    try:
        detector = PlateDetector()
        reader = OCRReader()
    except Exception as e:
        print(f"Failed to initialize models: {e}")
        return

    print("Detecting plates...")
    plates = detector.detect_plates(image)
    print(f"Found {len(plates)} plate(s).")

    for i, plate in enumerate(plates):
        x1, y1, x2, y2, conf, cls_id = plate
        print(f"Plate {i+1}: Bounding Box [{x1}, {y1}, {x2}, {y2}], Confidence: {conf:.2f}")

        # Crop the plate from the image
        # Adding a small margin could improve OCR
        margin = 5
        h, w = image.shape[:2]
        crop_y1 = max(0, y1 - margin)
        crop_y2 = min(h, y2 + margin)
        crop_x1 = max(0, x1 - margin)
        crop_x2 = min(w, x2 + margin)

        plate_crop = image[crop_y1:crop_y2, crop_x1:crop_x2]

        # Read text
        print(f"Reading text from Plate {i+1}...")
        text, text_conf = reader.readtext(plate_crop) if hasattr(reader, 'readtext') else reader.read_text(plate_crop)
        
        print(f"-> OCR Result: '{text}' (Confidence: {text_conf:.2f})")

        # Draw bounding box and text on the original image
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        
        # Put text above the bounding box
        label = f"{text} ({text_conf:.2f})"
        (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)
        cv2.rectangle(image, (x1, y1 - 30), (x1 + w, y1), (0, 255, 0), cv2.FILLED)
        cv2.putText(image, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)

    print(f"Saving output to {args.output}...")
    cv2.imwrite(args.output, image)
    print("Done!")

if __name__ == "__main__":
    main()
