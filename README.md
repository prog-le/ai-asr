# AI-ASR 本地语音识别与摘要系统

> 由 [Prog-le](https://github.com/prog-le) 维护，开源仓库地址：[https://github.com/prog-le/ai-asr](https://github.com/prog-le/ai-asr)

## 项目简介
AI-ASR 是一套基于本地大模型的语音识别与摘要系统，支持多种主流 ASR 模型（Whisper、FunASR 等），可实现音频批量识别、摘要生成、历史管理与多格式导出。前端采用现代化暗色后台模板（基于 Tailwind Toolbox Admin-Template-Night），界面美观、交互友好。

## 功能亮点
- 支持 Whisper、FunASR 等本地/自定义语音识别模型
- 支持豆包大模型等摘要算法，API Key 本地存储，安全可控
- 音频批量上传、任务管理、识别进度实时反馈
- 识别结果摘要、导出（TXT/JSON/SRT）一键完成
- 历史记录与模型管理，支持模型参数在线编辑
- 全站响应式暗色 UI，极致体验

## 技术栈
- **后端**：FastAPI、SQLAlchemy、SQLite、本地模型推理
- **前端**：React + Vite + Tailwind CSS（Admin-Template-Night 风格）
- **模型**：Whisper、FunASR、可扩展其它 ASR/摘要模型

## 目录结构
```
ai-asr/
├── backend/           # FastAPI后端
│   ├── app/           # 业务代码
│   ├── requirements.txt
│   └── main.py        # FastAPI入口
├── frontend/          # React前端（Tailwind UI）
└── README.md
```

## 快速开始
### 1. 后端启动
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. 前端启动
```bash
cd frontend
npm install
npm run dev
```

### 3. 访问系统
浏览器打开：http://localhost:5173

## 界面预览
- 采用 [Tailwind Toolbox Admin-Template-Night](https://github.com/tailwindtoolbox/Admin-Template-Night) 风格，暗色现代后台体验
- 支持侧边栏导航、响应式布局、圆角卡片、分割线、渐变背景等

## 贡献方式
欢迎 Issue、PR 及建议！

---

如有问题请在 [GitHub Issues](https://github.com/prog-le/ai-asr/issues) 反馈。
