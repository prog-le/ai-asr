from pydantic import BaseModel
from typing import Optional

class SummaryRequest(BaseModel):
    task_id: int
    algo: str = "truncate"
    length: int = 100
    detail: int = 1
    config: Optional[dict] = None

class SummaryOut(BaseModel):
    summary: str
    algo: str
    length: int
    detail: int 