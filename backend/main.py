from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import audio, asr, summary, export, history
from app.api.models import router as models_router
from app.api.exception_handlers import register_exception_handlers
from app.db.database import init_db

app = FastAPI(title="本地大模型语音识别系统")

# 允许前端跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化数据库
init_db()

# 注册路由
app.include_router(audio.router)
app.include_router(asr.router)
app.include_router(summary.router)
app.include_router(export.router)
app.include_router(history.router)
app.include_router(models_router)

# 注册全局异常处理
register_exception_handlers(app)

@app.get("/")
def read_root():
    return {"message": "本地大模型语音识别系统后端已启动"}
