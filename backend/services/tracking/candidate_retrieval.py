from rapidfuzz import fuzz

class CandidateRetrievalService:
    def __init__(self, threshold=85):
        self.threshold = threshold

    def find_candidates(self, query_plate, all_plates):
        """
        query_plate: plate number to match (string)
        all_plates: list of dicts [{'plate_number': 'MH12AB1234', 'camera_id': 'CAM_01', 'timestamp': dt}, ...]
        Returns candidates above similarity threshold, sorted by score.
        """
        candidates = []
        for p in all_plates:
            plate = p.get('plate_number', '')
            score = fuzz.ratio(query_plate, plate)
            if score >= self.threshold:
                candidates.append({
                    **p,
                    'similarity_score': score / 100.0
                })
        
        # Sort by score descending
        return sorted(candidates, key=lambda x: x['similarity_score'], reverse=True)
