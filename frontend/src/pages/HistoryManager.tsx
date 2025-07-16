import React, { useState, useEffect } from 'react';
import { listTasks, listResults, deleteTask, deleteResult } from '../api/history';
import { exportResult } from '../api/export';

interface ASRTask {
  id: number;
  audio_file_id: number;
  model_name: string;
  status: string;
}

interface ASRResult {
  id: number;
  task_id: number;
  recognized_text: string;
  summary: string;
  summary_algo: string;
}

const HistoryManager: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [tasks, setTasks] = useState<ASRTask[]>([]);
  const [results, setResults] = useState<ASRResult[]>([]);
  const [snackbar, setSnackbar] = useState<{open: boolean, msg: string, type: 'success'|'error'}>({open: false, msg: '', type: 'success'});

  const fetchTasks = () => listTasks().then(res => setTasks(Array.isArray(res.data) ? res.data : []));
  const fetchResults = () => listResults().then(res => setResults(Array.isArray(res.data) ? res.data : []));

  useEffect(() => {
    fetchTasks();
    fetchResults();
  }, []);

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      fetchTasks();
      setSnackbar({open: true, msg: '任务删除成功', type: 'success'});
    } catch {
      setSnackbar({open: true, msg: '任务删除失败', type: 'error'});
    }
  };
  const handleDeleteResult = async (id: number) => {
    try {
      await deleteResult(id);
      fetchResults();
      setSnackbar({open: true, msg: '结果删除成功', type: 'success'});
    } catch {
      setSnackbar({open: true, msg: '结果删除失败', type: 'error'});
    }
  };

  // 导出功能
  const handleExport = async (task_id: number, format: string) => {
    try {
      const res = await exportResult(task_id, format);
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asr_result_${task_id}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setSnackbar({open: true, msg: '导出失败', type: 'error'});
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gradient-to-br from-gray-950 to-gray-800 rounded-2xl shadow-2xl border border-primary/30 p-8">
      <h2 className="text-2xl font-bold text-primary mb-8 tracking-wide">历史记录与批量管理</h2>
      <div className="flex gap-2 mb-6">
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition border-b-2 ${tab === 0 ? 'border-primary text-primary bg-gray-900' : 'border-transparent text-gray-400 bg-transparent hover:text-primary'}`}
          onClick={() => setTab(0)}
        >
          识别任务
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition border-b-2 ${tab === 1 ? 'border-primary text-primary bg-gray-900' : 'border-transparent text-gray-400 bg-transparent hover:text-primary'}`}
          onClick={() => setTab(1)}
        >
          识别结果
        </button>
      </div>
      {tab === 0 && (
        <ul className="divide-y divide-gray-800 rounded-xl overflow-hidden bg-gray-900/80">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition group">
              <div>
                <div className="font-semibold text-gray-100">任务ID:{task.id} 音频ID:{task.audio_file_id} 模型:{task.model_name}</div>
                <div className="text-xs text-gray-400 mt-1">状态: {task.status}</div>
              </div>
              <button
                className="ml-4 p-2 rounded hover:bg-red-600/20 text-red-400 hover:text-red-600 transition"
                onClick={() => handleDeleteTask(task.id)}
                title="删除"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      {tab === 1 && (
        <ul className="divide-y divide-gray-800 rounded-xl overflow-hidden bg-gray-900/80">
          {results.map(result => (
            <li key={result.id} className="flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition group">
              <div>
                <div className="font-semibold text-gray-100">结果ID:{result.id} 任务ID:{result.task_id}</div>
                <div className="text-xs text-gray-400 mt-1">摘要算法: {result.summary_algo}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleExport(result.task_id, 'txt')} title="导出TXT" className="p-2 rounded hover:bg-primary/20 text-primary transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
                </button>
                <button onClick={() => handleExport(result.task_id, 'json')} title="导出JSON" className="p-2 rounded hover:bg-primary/20 text-primary transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" /></svg>
                </button>
                <button onClick={() => handleExport(result.task_id, 'srt')} title="导出SRT" className="p-2 rounded hover:bg-primary/20 text-primary transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4zm4 8h8m-8 4h8" /></svg>
                </button>
                <button
                  className="ml-2 p-2 rounded hover:bg-red-600/20 text-red-400 hover:text-red-600 transition"
                  onClick={() => handleDeleteResult(result.id)}
                  title="删除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed left-1/2 -translate-x-1/2 bottom-8 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold ${snackbar.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          onAnimationEnd={() => setSnackbar({...snackbar, open: false})}
        >
          {snackbar.msg}
        </div>
      )}
    </div>
  );
};

export default HistoryManager; 