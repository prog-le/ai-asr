from .base import BaseASRModel
from funasr import AutoModel
import logging

logger = logging.getLogger(__name__)

class FunASRModel(BaseASRModel):
    def __init__(self, model_name="paraformer-zh", **kwargs):
        try:
            logger.info(f"FunASR模型加载: {model_name}")
            self.model = AutoModel(model=model_name, disable_update=True, **kwargs)
            logger.info(f"FunASR模型加载完成: {model_name}")
        except Exception as e:
            logger.error(f"FunASR模型加载失败: {e}")
            raise

    def transcribe(self, audio_path: str, **kwargs) -> str:
        result = self.model.generate(input=audio_path, **kwargs)
        return result[0]["text"] if result and "text" in result[0] else "" 