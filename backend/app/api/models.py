from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import ModelInfo
from app.schemas.model import ModelInfoSchema, ModelRegisterSchema, ModelSwitchSchema, ModelConfigUpdateSchema
from typing import List
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
import os
import shutil
import requests
from app.services.model_manager import ModelManager

router = APIRouter(prefix="/api/models", tags=["模型管理"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=List[ModelInfoSchema])
def list_models(db: Session = Depends(get_db)):
    models = db.query(ModelInfo).all()
    return models

@router.post("/download", response_model=ModelInfoSchema)
def register_model(data: ModelRegisterSchema, db: Session = Depends(get_db)):
    # 远程下载
    local_path = data.local_path
    if data.remote_url:
        filename = data.remote_url.split("/")[-1]
        local_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "asr-models", data.name)
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, filename)
        try:
            with requests.get(data.remote_url, stream=True, timeout=60) as r:
                r.raise_for_status()
                with open(local_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
            size = os.path.getsize(local_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"模型下载失败: {e}")
    else:
        size = data.size
    model = ModelInfo(
        name=data.name,
        display_name=data.display_name,
        type=data.type,
        status="已加载",  # 简化：注册即视为可用
        local_path=local_path,
        config=data.config,
        version=data.version,
        size=size
    )
    db.add(model)
    try:
        db.commit()
        db.refresh(model)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="模型名称已存在")
    return model

@router.post("/switch")
def switch_model(data: ModelSwitchSchema, db: Session = Depends(get_db)):
    model = db.query(ModelInfo).filter(ModelInfo.id == data.id).first()
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    # 这里可扩展为写入配置表/文件，或更新所有模型的status字段
    # 简化：将所有同类型模型status设为"未激活"，当前设为"已激活"
    db.query(ModelInfo).filter(ModelInfo.type == model.type).update({ModelInfo.status: "未激活"})
    model.status = "已激活"
    db.commit()
    return {"message": f"已切换到模型：{model.display_name}"}

@router.delete("/{id}")
def delete_model(id: int, delete_file: bool = False, db: Session = Depends(get_db)):
    model = db.query(ModelInfo).filter(ModelInfo.id == id).first()
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    if delete_file and model.local_path:
        try:
            if os.path.isdir(model.local_path):
                shutil.rmtree(model.local_path)
            elif os.path.isfile(model.local_path):
                os.remove(model.local_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"文件删除失败: {e}")
    db.delete(model)
    db.commit()
    return {"message": "模型已删除"}

@router.post("/{id}/load")
def load_model(id: int, db: Session = Depends(get_db)):
    model = db.query(ModelInfo).filter(ModelInfo.id == id).first()
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    ok, msg = ModelManager.instance().load_model(model)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}

@router.post("/{id}/unload")
def unload_model(id: int, db: Session = Depends(get_db)):
    model = db.query(ModelInfo).filter(ModelInfo.id == id).first()
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    ok, msg = ModelManager.instance().unload_model(model)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}

@router.patch("/{id}/config", response_model=ModelInfoSchema)
def update_model_config(id: int, data: ModelConfigUpdateSchema, db: Session = Depends(get_db)):
    model = db.query(ModelInfo).filter(ModelInfo.id == id).first()
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    model.config = data.config
    db.commit()
    db.refresh(model)
    return model 