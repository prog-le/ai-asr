from .base import BaseASRModel
import whisper
import logging

logger = logging.getLogger(__name__)

class WhisperASRModel(BaseASRModel):
    def __init__(self, model_size="base", language=None):
        try:
            logger.info(f"Whisper模型加载: {model_size}")
            self.model = whisper.load_model(model_size)
            logger.info(f"Whisper模型加载完成: {model_size}")
        except Exception as e:
            logger.error(f"Whisper模型加载失败: {e}")
            raise
        self.language = language or 'zh'

    def transcribe(self, audio_path: str, **kwargs) -> str:
        # 强制指定中文识别
        result = self.model.transcribe(audio_path, language='zh', **kwargs)
        return result["text"] 