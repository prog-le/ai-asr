import React, { useState } from 'react';
import AudioManager from './pages/AudioManager';
import ASRTaskManager from './pages/ASRTaskManager';
import ResultSummaryExport from './pages/ResultSummaryExport';
import HistoryManager from './pages/HistoryManager';
import ModelManager from './pages/ModelManager';
import ErrorBoundary from './ErrorBoundary';

const menuList = [
  { key: 'audio', label: '音频管理' },
  { key: 'asr', label: '识别任务' },
  { key: 'summary', label: '结果摘要与导出' },
  { key: 'history', label: '历史记录' },
  { key: 'model', label: '模型管理' },
];

function App() {
  const [menu, setMenu] = useState('audio');

  return (
    <ErrorBoundary>
      <div className="w-screen h-screen min-h-0 min-w-0 flex bg-gray-900 text-gray-100 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 h-full bg-gradient-to-b from-gray-950 to-gray-800 shadow-xl flex flex-col">
          <div className="h-20 flex items-center justify-center border-b border-gray-800">
            <span className="text-2xl font-bold tracking-widest text-primary">AI-ASR</span>
          </div>
          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {menuList.map(item => (
                <li key={item.key}>
                  <button
                    className={`w-full text-left px-6 py-3 rounded-lg transition-colors font-semibold hover:bg-primary/20 hover:text-primary ${menu === item.key ? 'bg-primary/20 text-primary' : ''}`}
                    onClick={() => setMenu(item.key)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {/* 底部版权已移除 */}
        </aside>
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full min-h-0">
          {/* Header */}
          <header className="h-20 flex items-center px-8 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 shadow shrink-0">
            <h1 className="text-xl font-bold tracking-wide">{menuList.find(m => m.key === menu)?.label}</h1>
            <div className="flex-1" />
            {/* 预留右侧操作区 */}
          </header>
          {/* Content */}
          <main className="flex-1 min-h-0 p-8 bg-gray-900 overflow-y-auto">
            {menu === 'audio' && <AudioManager />}
            {menu === 'asr' && <ASRTaskManager />}
            {menu === 'summary' && <ResultSummaryExport />}
            {menu === 'history' && <HistoryManager />}
            {menu === 'model' && <ModelManager />}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
