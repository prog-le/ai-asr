import threading
from app.db.models import ModelInfo
from typing import Dict

class ModelManager:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.loaded_models: Dict[str, object] = {}  # {model_name: model_obj}

    @classmethod
    def instance(cls):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = cls()
        return cls._instance

    def load_model(self, model_info: ModelInfo):
        # TODO: 按类型加载模型（如whisper、funasr等），这里只做占位
        if model_info.name in self.loaded_models:
            return False, "模型已加载"
        # 这里应根据model_info.type和local_path实际加载模型
        self.loaded_models[model_info.name] = f"Loaded({model_info.name})"
        return True, "加载成功"

    def unload_model(self, model_info: ModelInfo):
        if model_info.name not in self.loaded_models:
            return False, "模型未加载"
        del self.loaded_models[model_info.name]
        return True, "已卸载"

    def is_loaded(self, model_info: ModelInfo):
        return model_info.name in self.loaded_models 