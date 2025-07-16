from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ModelInfoSchema(BaseModel):
    id: int
    name: str
    display_name: str
    type: str
    status: str
    local_path: Optional[str]
    config: Optional[Any]
    version: Optional[str]
    size: Optional[int]
    create_time: Optional[datetime]
    update_time: Optional[datetime]

    class Config:
        orm_mode = True 

class ModelRegisterSchema(BaseModel):
    name: str
    display_name: str
    type: str
    local_path: Optional[str] = None
    remote_url: Optional[str] = None
    version: str = "1.0.0"
    config: Optional[Any] = None
    size: Optional[int] = None

class ModelSwitchSchema(BaseModel):
    id: int

class ModelConfigUpdateSchema(BaseModel):
    config: Any 