from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AudioFileBase(BaseModel):
    filename: str
    duration: Optional[float] = None
    samplerate: Optional[int] = None

class AudioFileCreate(AudioFileBase):
    pass

class AudioFileOut(AudioFileBase):
    id: int
    filepath: str
    upload_time: datetime

    class Config:
        orm_mode = True 