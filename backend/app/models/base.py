from abc import ABC, abstractmethod

class BaseASRModel(ABC):
    @abstractmethod
    def transcribe(self, audio_path: str, **kwargs) -> str:
        """音频转写，返回识别文本"""
        pass 