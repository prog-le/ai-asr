from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from ..db import database, models
import json

router = APIRouter(prefix="/export", tags=["结果导出"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/result/{task_id}")
def export_result(task_id: int, format: str = "txt", db: Session = Depends(get_db)):
    result = db.query(models.ASRResult).filter(models.ASRResult.task_id == task_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="结果不存在")
    if format == "txt":
        content = result.recognized_text or ""
        return Response(content, media_type="text/plain", headers={"Content-Disposition": f"attachment; filename=asr_{task_id}.txt"})
    elif format == "json":
        data = {
            "recognized_text": result.recognized_text,
            "summary": result.summary,
            "summary_algo": result.summary_algo
        }
        return Response(json.dumps(data, ensure_ascii=False), media_type="application/json", headers={"Content-Disposition": f"attachment; filename=asr_{task_id}.json"})
    elif format == "srt":
        # 简单SRT格式占位
        srt_content = f"1\n00:00:00,000 --> 00:00:10,000\n{result.recognized_text or ''}\n"
        return Response(srt_content, media_type="text/plain", headers={"Content-Disposition": f"attachment; filename=asr_{task_id}.srt"})
    else:
        raise HTTPException(status_code=400, detail="不支持的导出格式") 