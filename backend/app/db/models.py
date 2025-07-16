from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class AudioFile(Base):
    __tablename__ = 'audio_files'
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    duration = Column(Float)
    samplerate = Column(Integer)
    upload_time = Column(DateTime, default=datetime.utcnow)
    tasks = relationship('ASRTask', back_populates='audio_file')

class ASRTask(Base):
    __tablename__ = 'asr_tasks'
    id = Column(Integer, primary_key=True, index=True)
    audio_file_id = Column(Integer, ForeignKey('audio_files.id'))
    model_name = Column(String, nullable=False)
    model_params = Column(Text)
    status = Column(String, default='pending')  # pending, running, finished, failed
    progress = Column(Float, default=0.0)
    submit_time = Column(DateTime, default=datetime.utcnow)
    finish_time = Column(DateTime)
    result = relationship('ASRResult', uselist=False, back_populates='task')
    audio_file = relationship('AudioFile', back_populates='tasks')

class ASRResult(Base):
    __tablename__ = 'asr_results'
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey('asr_tasks.id'))
    recognized_text = Column(Text)
    summary = Column(Text)
    summary_algo = Column(String)
    export_formats = Column(String)  # 逗号分隔的格式
    create_time = Column(DateTime, default=datetime.utcnow)
    task = relationship('ASRTask', back_populates='result')

class ModelInfo(Base):
    __tablename__ = 'model_info'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  # 模型英文名
    display_name = Column(String, nullable=False)       # 展示名
    type = Column(String, nullable=False)               # asr/summary等
    status = Column(String, nullable=False, default='未下载')  # 状态
    local_path = Column(String)                         # 本地路径
    config = Column(JSON)                               # 配置参数
    version = Column(String)
    size = Column(Integer)
    create_time = Column(DateTime, default=datetime.utcnow)
    update_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 