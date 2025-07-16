from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..db import database, models
from ..schemas.asr import ASRTaskOut, ASRResultOut

router = APIRouter(prefix="/history", tags=["历史记录"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/tasks", response_model=List[ASRTaskOut])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(models.ASRTask).all()

@router.get("/results", response_model=List[ASRResultOut])
def list_results(db: Session = Depends(get_db)):
    return db.query(models.ASRResult).all()

@router.delete("/task/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.ASRTask).filter(models.ASRTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    if task.result:
        db.delete(task.result)
    db.delete(task)
    db.commit()
    return {"msg": "删除成功"}

@router.delete("/result/{result_id}")
def delete_result(result_id: int, db: Session = Depends(get_db)):
    result = db.query(models.ASRResult).filter(models.ASRResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="结果不存在")
    db.delete(result)
    db.commit()
    return {"msg": "删除成功"} 