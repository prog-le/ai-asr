from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..db import database, models
from ..schemas.asr import ASRTaskCreate, ASRTaskOut, ASRResultOut
from ..services import asr_service
import json

router = APIRouter(prefix="/asr", tags=["语音识别任务"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/submit", response_model=ASRTaskOut)
def submit_asr(task: ASRTaskCreate, db: Session = Depends(get_db)):
    audio = db.query(models.AudioFile).filter(models.AudioFile.id == task.audio_file_id).first()
    if not audio:
        raise HTTPException(status_code=404, detail="音频文件不存在")
    db_task = models.ASRTask(
        audio_file_id=task.audio_file_id,
        model_name=task.model_name,
        model_params=json.dumps(task.model_params or {}),
        status="pending",
        progress=0.0
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    task_id = db_task.id
    # 提交异步任务
    future = asr_service.submit_asr_task(audio.filepath, task.model_name, task.model_params)
    # 回调中用独立Session
    def callback(fut):
        try:
            text = fut.result()
            with database.SessionLocal() as db2:
                db_task2 = db2.query(models.ASRTask).filter(models.ASRTask.id == task_id).first()
                db_task2.status = "finished"
                db_task2.progress = 1.0
                result = models.ASRResult(task_id=db_task2.id, recognized_text=text)
                db2.add(result)
                db2.commit()
        except Exception as e:
            with database.SessionLocal() as db2:
                db_task2 = db2.query(models.ASRTask).filter(models.ASRTask.id == task_id).first()
                db_task2.status = "failed"
                db2.commit()
    future.add_done_callback(callback)
    return db_task

@router.get("/list", response_model=List[ASRTaskOut])
def list_asr_tasks(db: Session = Depends(get_db)):
    # 只返回 audio_file_id 不为 None 的任务，防止脏数据导致响应校验失败
    return db.query(models.ASRTask).filter(models.ASRTask.audio_file_id != None).all()

@router.get("/progress/{task_id}", response_model=ASRTaskOut)
def get_task_progress(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.ASRTask).filter(models.ASRTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task

@router.get("/result/{task_id}", response_model=ASRResultOut)
def get_asr_result(task_id: int, db: Session = Depends(get_db)):
    result = db.query(models.ASRResult).filter(models.ASRResult.task_id == task_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="结果不存在")
    return result 