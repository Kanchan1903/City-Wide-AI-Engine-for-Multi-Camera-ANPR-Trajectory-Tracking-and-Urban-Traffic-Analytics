import re

class FormatValidationService:
    def __init__(self):
        # Common Indian format: State Code (2 chars) + District (2 chars) + (Optional 1-2 chars) + Number (4 digits)
        # e.g., MH12AB1234, DL4CAF4943, HR26EB9654
        # We'll make it somewhat flexible since OCR might occasionally misread 1 character
        
        self.standard_pattern = re.compile(r'^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$')
        self.bh_pattern = re.compile(r'^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$') # BH series
        
        # Valid State/UT codes
        self.state_codes = [
            "AN", "AP", "AR", "AS", "BR", "CH", "CG", "DN", "DD", "DL", "GA", "GJ", "HR", "HP", "JK",
            "JH", "KA", "KL", "LA", "LD", "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "PY", "PB", "RJ",
            "SK", "TN", "TS", "TR", "UP", "UK", "WB"
        ]

    def validate(self, plate_text: str) -> dict:
        """
        Validates whether the normalized plate text conforms to standard Indian formats.
        """
        if not plate_text:
            return {"format_valid": False, "validation_message": "Empty plate text"}
            
        is_standard = bool(self.standard_pattern.match(plate_text))
        is_bh = bool(self.bh_pattern.match(plate_text))
        
        if is_bh:
            return {"format_valid": True, "validation_message": "Valid BH Series format"}
            
        if is_standard:
            state_code = plate_text[:2]
            if state_code in self.state_codes:
                return {"format_valid": True, "validation_message": "Standard Indian format with valid state code"}
            else:
                return {"format_valid": False, "validation_message": f"Invalid state code: {state_code}"}
                
        # If it doesn't match standard patterns but has reasonable length (e.g. older plates or govt plates)
        if 8 <= len(plate_text) <= 11:
            return {"format_valid": False, "validation_message": "Length is okay, but doesn't match standard state code format"}
            
        return {"format_valid": False, "validation_message": "Does not match any recognized format"}
