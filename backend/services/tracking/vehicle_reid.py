import logging

logger = logging.getLogger(__name__)

# Fallback mechanism in case heavy ML dependencies are missing during demo
try:
    import torch
    import torch.nn.functional as F
    import torchreid
    TORCHREID_AVAILABLE = True
except ImportError:
    TORCHREID_AVAILABLE = False
    logger.warning("torchreid not found. Using mock ReID fallback for demo purposes.")

class VehicleReIDService:
    def __init__(self, model_name='osnet_x1_0'):
        global TORCHREID_AVAILABLE
        self.model_name = model_name
        self.model = None
        
        if TORCHREID_AVAILABLE:
            try:
                self.model = torchreid.models.build_model(
                    name=model_name,
                    num_classes=1000, 
                    pretrained=True
                )
                self.model.eval()
                logger.info(f"Loaded ReID model: {model_name}")
            except Exception as e:
                logger.error(f"Failed to load ReID model: {e}")
                TORCHREID_AVAILABLE = False

    def get_embedding(self, image_tensor):
        if not TORCHREID_AVAILABLE or self.model is None:
            return None
            
        with torch.no_grad():
            embedding = self.model(image_tensor.unsqueeze(0))
        return F.normalize(embedding, dim=1)

    def similarity_score(self, img1_tensor, img2_tensor):
        if not TORCHREID_AVAILABLE or self.model is None:
            # Mock high similarity for demo if dependencies are missing
            return 0.95 
            
        emb1 = self.get_embedding(img1_tensor)
        emb2 = self.get_embedding(img2_tensor)
        return F.cosine_similarity(emb1, emb2).item()
