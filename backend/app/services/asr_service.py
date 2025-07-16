from concurrent.futures import ThreadPoolExecutor, Future
from typing import Dict, Any
from ..models.whisper_model import WhisperASRModel
from ..models.funasr_model import FunASRModel
from ..models.kimi_audio_model import KimiAudioASRModel
import os
import logging
import re

# 日志配置
LOG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'output.log')
logging.basicConfig(filename=LOG_PATH, level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# 简单线程池实现异步识别任务
executor = ThreadPoolExecutor(max_workers=2)

MODEL_REGISTRY = {
    "whisper": WhisperASRModel,
    "funasr": FunASRModel,
    "kimi-audio": KimiAudioASRModel,
}

def clean_text(text: str) -> str:
    # 去除连续重复的“的”、“啊”、“嗯”等口头禅
    text = re.sub(r'(的|啊|嗯|吧|呢|嘛|哦|呃|这个|那个|就是|然后|所以|就是的|就是说|就是说的|就是说啊|就是说呢|就是说嘛|就是说吧|就是说哦|就是说呃|就是说这个|就是说那个|就是说就是)+', r'\1', text)
    # 连续相同字去重
    text = re.sub(r'(.)\1{2,}', r'\1', text)
    # 多余空格
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def add_punctuation(text: str) -> str:
    # 保留已有标点，简单规则自动断句加标点
    # 以“吗|吧|呢”结尾加问号，以“啊|呀|哇”结尾加感叹号，其余加句号
    text = re.sub(r'([吗吧呢])', r'\1？', text)
    text = re.sub(r'([啊呀哇])', r'\1！', text)
    # 按中文常用句子长度断句加句号（如20字）
    text = re.sub(r'([^。！？\?！\?]{20,})', lambda m: m.group(0) + '。', text)
    # 合并多余标点
    text = re.sub(r'([。！？\?]){2,}', r'\1', text)
    return text

def get_asr_model(model_name: str, model_params: Dict[str, Any] = None):
    model_cls = MODEL_REGISTRY.get(model_name)
    if not model_cls:
        logger.error(f"不支持的模型: {model_name}")
        raise ValueError(f"不支持的模型: {model_name}")
    try:
        logger.info(f"加载模型: {model_name}, 参数: {model_params}")
        model = model_cls(**(model_params or {}))
        logger.info(f"模型加载完成: {model_name}")
        return model
    except Exception as e:
        logger.error(f"模型加载失败: {model_name}, 错误: {e}")
        raise

def submit_asr_task(audio_path: str, model_name: str, model_params: Dict[str, Any] = None) -> Future:
    def task_fn():
        try:
            model = get_asr_model(model_name, model_params)
            logger.info(f"开始识别: {audio_path} 使用模型: {model_name}")
            text = model.transcribe(audio_path)
            text = clean_text(text)
            text = add_punctuation(text)
            logger.info(f"识别完成: {audio_path} 使用模型: {model_name}")
            return text
        except Exception as e:
            logger.error(f"识别任务失败: {audio_path} 使用模型: {model_name}, 错误: {e}")
            raise
    future = executor.submit(task_fn)
    return future 