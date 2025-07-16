from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from ..db import database, models
from ..schemas.audio import AudioFileOut
from pydantic import BaseModel

router = APIRouter(prefix="/audio", tags=["音频管理"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UploadResponse(BaseModel):
    id: int
    filename: str
    filepath: str

@router.post("/upload", response_model=List[UploadResponse])
def upload_audio(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    responses = []
    for file in files:
        if not file.filename.lower().endswith((".wav", ".mp3", ".flac")):
            raise HTTPException(status_code=400, detail=f"不支持的音频格式: {file.filename}")
        save_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # 这里只做简单示例，实际可用音频库提取时长/采样率
        audio_obj = models.AudioFile(filename=file.filename, filepath=save_path)
        db.add(audio_obj)
        db.commit()
        db.refresh(audio_obj)
        responses.append(UploadResponse(id=audio_obj.id, filename=audio_obj.filename, filepath=audio_obj.filepath))
    return responses

@router.get("/list", response_model=List[AudioFileOut])
def list_audio(db: Session = Depends(get_db)):
    return db.query(models.AudioFile).all()

@router.delete("/delete/{audio_id}")
def delete_audio(audio_id: int, db: Session = Depends(get_db)):
    audio = db.query(models.AudioFile).filter(models.AudioFile.id == audio_id).first()
    if not audio:
        raise HTTPException(status_code=404, detail="音频文件不存在")
    try:
        os.remove(audio.filepath)
    except Exception:
        pass
    db.delete(audio)
    db.commit()
    return {"msg": "删除成功"} 