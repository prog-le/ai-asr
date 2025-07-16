import React, { useState, useEffect } from 'react';
import { listASRTasks, getASRResult } from '../api/asr';
import { generateSummary } from '../api/summary';
import { exportResult } from '../api/export';

interface ASRTask {
  id: number;
  audio_file_id: number;
  model_name: string;
  status: string;
}

const algoOptions = [
  { label: '截断', value: 'truncate' },
  { label: '豆包大模型', value: 'doubao' },
];

const DOU_BAO_CONFIG_KEY = 'doubao_config';

const ResultSummaryExport: React.FC = () => {
  const [tasks, setTasks] = useState<ASRTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<number | ''>('');
  const [result, setResult] = useState('');
  const [summary, setSummary] = useState('');
  const [algo, setAlgo] = useState('truncate');
  const [length, setLength] = useState(100);
  const [detail, setDetail] = useState(1);
  const [snackbar, setSnackbar] = useState<{open: boolean, msg: string, type: 'success'|'error'}>({open: false, msg: '', type: 'success'});
  const [doubaoApiKey, setDoubaoApiKey] = useState('');
  const [doubaoModel, setDoubaoModel] = useState('doubao-1.6-chat');
  const [doubaoApiBase, setDoubaoApiBase] = useState('https://ark.cn-beijing.volces.com/api/v3');
  useEffect(() => {
    const saved = localStorage.getItem(DOU_BAO_CONFIG_KEY);
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        setDoubaoApiKey(obj.api_key || '');
        setDoubaoModel(obj.model || 'doubao-1.6-chat');
        setDoubaoApiBase(obj.api_base || 'https://ark.cn-beijing.volces.com/api/v3');
      } catch {}
    }
  }, []);
  const handleSaveDoubaoConfig = () => {
    localStorage.setItem(DOU_BAO_CONFIG_KEY, JSON.stringify({
      api_key: doubaoApiKey,
      model: doubaoModel,
      api_base: doubaoApiBase,
    }));
    setSnackbar({open: true, msg: '已保存豆包参数', type: 'success'});
  };
  const [showResult, setShowResult] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const fetchTasks = () => {
    listASRTasks().then(res => {
      const arr = Array.isArray(res.data) ? res.data : [];
      setTasks(arr.filter((t: ASRTask) => t.status === 'finished'));
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      getASRResult(selectedTask as number).then(res => {
        setResult(res.data.recognized_text || '');
        setSummary(res.data.summary || '');
      });
    } else {
      setResult('');
      setSummary('');
    }
  }, [selectedTask]);

  const handleGenerateSummary = async () => {
    if (!selectedTask) return;
    let config = undefined;
    if (algo === 'doubao') {
      config = {
        api_key: doubaoApiKey,
        model: doubaoModel,
        api_base: doubaoApiBase,
      };
    }
    setLoadingSummary(true);
    try {
      const res = await generateSummary(selectedTask as number, algo, length, detail, config);
      setSummary(res.data.summary);
      setSnackbar({open: true, msg: '摘要生成成功', type: 'success'});
    } catch {
      setSnackbar({open: true, msg: '摘要生成失败', type: 'error'});
    }
    setLoadingSummary(false);
  };

  const handleExport = async (format: string) => {
    if (!selectedTask) return;
    try {
      const res = await exportResult(selectedTask as number, format);
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asr_result_${selectedTask}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setSnackbar({open: true, msg: '导出失败', type: 'error'});
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gradient-to-br from-gray-950 to-gray-800 rounded-2xl shadow-2xl border border-primary/30 p-8">
      <h2 className="text-2xl font-bold text-primary mb-8 tracking-wide">识别结果摘要与导出</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="min-w-[160px] px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none"
          value={selectedTask}
          onChange={e => setSelectedTask(Number(e.target.value))}
        >
          <option value="">选择识别任务</option>
          {tasks.map(task => (
            <option key={task.id} value={task.id}>{`任务ID:${task.id} 音频ID:${task.audio_file_id} 模型:${task.model_name}`}</option>
          ))}
        </select>
        <select
          className="min-w-[120px] px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none"
          value={algo}
          onChange={e => setAlgo(e.target.value)}
        >
          {algoOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="flex flex-col">
          <input
            type="number"
            className="w-20 px-2 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none"
            value={length}
            onChange={e => setLength(Number(e.target.value))}
            placeholder="长度"
          />
          <span className="text-xs text-gray-400 mt-1">最大字数</span>
        </div>
        <div className="flex flex-col">
          <input
            type="number"
            className="w-24 px-2 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none"
            value={detail}
            onChange={e => setDetail(Number(e.target.value))}
            placeholder="详细程度"
          />
          <span className="text-xs text-gray-400 mt-1">1简要，越大越详细</span>
        </div>
        <button
          className={`px-4 py-2 rounded-lg font-semibold shadow bg-accent text-white transition hover:bg-accent/90 disabled:opacity-50 ${!selectedTask ? 'cursor-not-allowed' : ''}`}
          onClick={handleGenerateSummary}
          disabled={!selectedTask}
        >
          生成摘要
        </button>
      </div>
      {algo === 'doubao' && (
        <div className="flex flex-wrap gap-2 mb-4">
          <input type="text" className="flex-1 px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="豆包API Key" value={doubaoApiKey} onChange={e => setDoubaoApiKey(e.target.value)} />
          <input type="text" className="flex-1 px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="模型名" value={doubaoModel} onChange={e => setDoubaoModel(e.target.value)} />
          <input type="text" className="flex-1 px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="API Base" value={doubaoApiBase} onChange={e => setDoubaoApiBase(e.target.value)} />
          <button className="px-4 py-2 rounded-lg font-semibold shadow bg-primary text-white transition hover:bg-primary/90" onClick={handleSaveDoubaoConfig}>保存</button>
        </div>
      )}
      {/* 可折叠识别文本区域 */}
      <div className="mb-2">
        <div className="flex items-center cursor-pointer select-none" onClick={() => setShowResult(v => !v)}>
          <span className="font-semibold text-primary mr-2">识别文本：</span>
          <button className="ml-2 p-1 rounded hover:bg-primary/20 transition">
            {showResult ? (
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            ) : (
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            )}
          </button>
        </div>
        {showResult && (
          <div className="bg-gray-900/80 rounded-lg border border-gray-800 p-3 mt-2 text-gray-100 whitespace-pre-line text-sm">
            {result}
          </div>
        )}
      </div>
      <div className="mb-2">
        <span className="font-semibold text-primary">摘要结果：</span>
        {loadingSummary && (
          <div className="w-full h-2 bg-gray-700 rounded my-2 overflow-hidden">
            <div className="h-2 bg-primary animate-pulse w-full" style={{ width: '100%' }} />
          </div>
        )}
        <div className="bg-gray-900/80 rounded-lg border border-gray-800 p-3 mt-2 text-gray-100 whitespace-pre-line text-sm min-h-[40px]">
          {summary}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button className="px-4 py-2 rounded-lg font-semibold border border-primary text-primary bg-transparent hover:bg-primary/10 transition" onClick={() => handleExport('txt')} disabled={!selectedTask}>导出TXT</button>
        <button className="px-4 py-2 rounded-lg font-semibold border border-primary text-primary bg-transparent hover:bg-primary/10 transition" onClick={() => handleExport('json')} disabled={!selectedTask}>导出JSON</button>
        <button className="px-4 py-2 rounded-lg font-semibold border border-primary text-primary bg-transparent hover:bg-primary/10 transition" onClick={() => handleExport('srt')} disabled={!selectedTask}>导出SRT</button>
      </div>
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

export default ResultSummaryExport; 