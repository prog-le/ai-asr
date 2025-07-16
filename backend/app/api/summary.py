from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..db import database, models
from ..schemas.summary import SummaryRequest, SummaryOut
from ..services.summary_service import generate_summary

router = APIRouter(prefix="/summary", tags=["摘要生成"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/generate", response_model=SummaryOut)
def generate_summary_api(req: SummaryRequest, db: Session = Depends(get_db)):
    task = db.query(models.ASRTask).filter(models.ASRTask.id == req.task_id).first()
    if not task or not task.result:
        raise HTTPException(status_code=404, detail="识别结果不存在")
    text = task.result.recognized_text or ""
    summary = generate_summary(text, algo=req.algo, length=req.length, detail=req.detail, config=req.config)
    # 写入数据库
    task.result.summary = summary
    task.result.summary_algo = req.algo
    db.commit()
    return SummaryOut(summary=summary, algo=req.algo, length=req.length, detail=req.detail) 