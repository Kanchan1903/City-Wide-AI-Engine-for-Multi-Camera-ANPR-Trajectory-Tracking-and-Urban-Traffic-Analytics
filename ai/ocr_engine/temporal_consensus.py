from collections import defaultdict
import datetime

class TemporalConsensusEngine:
    def __init__(self, high_threshold=0.85, low_threshold=0.60):
        self.history = defaultdict(list)
        self.high_threshold = high_threshold
        self.low_threshold = low_threshold

    def process_frame_ocr(self, vehicle_id: str, ocr_result: str, confidence: float):
        """
        Processes a single frame's OCR result and performs temporal voting.
        """
        timestamp = datetime.datetime.utcnow()
        self.history[vehicle_id].append({
            "text": ocr_result,
            "confidence": confidence,
            "timestamp": timestamp
        })
        
        # Clean up old history (e.g., older than 10 seconds)
        cutoff = timestamp - datetime.timedelta(seconds=10)
        self.history[vehicle_id] = [h for h in self.history[vehicle_id] if h["timestamp"] > cutoff]
        
        return self._calculate_consensus(vehicle_id)

    def _calculate_consensus(self, vehicle_id: str):
        records = self.history[vehicle_id]
        if not records:
            return None, 0.0, "LOW"
            
        # Group by text and sum confidences (weighted voting)
        votes = defaultdict(float)
        max_conf_per_text = defaultdict(float)
        
        for r in records:
            votes[r["text"]] += r["confidence"]
            if r["confidence"] > max_conf_per_text[r["text"]]:
                max_conf_per_text[r["text"]] = r["confidence"]
                
        # Best text is the one with highest accumulated votes
        best_text = max(votes.items(), key=lambda x: x[1])[0]
        
        # Use the max confidence observed for the best text as the final confidence
        final_confidence = max_conf_per_text[best_text]
        
        if final_confidence >= self.high_threshold:
            category = "HIGH"
        elif final_confidence >= self.low_threshold:
            category = "MEDIUM"
        else:
            category = "LOW"
            
        return best_text, final_confidence, category
