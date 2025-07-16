from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ASRTaskCreate(BaseModel):
    audio_file_id: int
    model_name: str
    model_params: Optional[Dict[str, Any]] = None

class ASRTaskOut(BaseModel):
    id: int
    audio_file_id: int
    model_name: str
    model_params: Optional[str]
    status: str
    progress: float
    submit_time: datetime
    finish_time: Optional[datetime]

    class Config:
        orm_mode = True

class ASRResultOut(BaseModel):
    id: int
    task_id: int
    recognized_text: Optional[str]
    summary: Optional[str]
    summary_algo: Optional[str]
    export_formats: Optional[str]
    create_time: datetime

    class Config:
        orm_mode = True 