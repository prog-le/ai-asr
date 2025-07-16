import React, { useState, useEffect } from 'react';
import { listAudio } from '../api/audio';
import { submitASRTask, listASRTasks, getASRProgress, getASRResult } from '../api/asr';
import { deleteTask } from '../api/history';

interface AudioFile {
  id: number;
  filename: string;
}

interface ASRTask {
  id: number;
  audio_file_id: number;
  model_name: string;
  status: string;
  progress: number;
}

const modelOptions = [
  { label: 'Whisper', value: 'whisper' },
  { label: 'FunASR', value: 'funasr' },
];

const ASRTaskManager: React.FC = () => {
  const [audioList, setAudioList] = useState<AudioFile[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<number | ''>('');
  const [model, setModel] = useState('whisper');
  const [tasks, setTasks] = useState<ASRTask[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});
  const [resultMap, setResultMap] = useState<Record<number, string>>({});
  const [snackbar, setSnackbar] = useState<{open: boolean, msg: string, type: 'success'|'error'}>({open: false, msg: '', type: 'success'});

  const fetchAudio = () => {
    listAudio().then(res => setAudioList(res.data));
  };
  const fetchTasks = () => {
    listASRTasks().then(res => setTasks(Array.isArray(res.data) ? res.data : []));
  };

  useEffect(() => {
    fetchAudio();
    fetchTasks();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      tasks.forEach(task => {
        getASRProgress(task.id).then(res => {
          setProgressMap(prev => ({ ...prev, [task.id]: res.data.progress }));
          setStatusMap(prev => ({ ...prev, [task.id]: res.data.status }));
          if (res.data.status === 'finished') {
            getASRResult(task.id).then(r => {
              setResultMap(prev => ({ ...prev, [task.id]: r.data.recognized_text }));
            });
          }
        });
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [tasks]);

  const handleSubmit = async () => {
    if (!selectedAudio) return;
    setSubmitting(true);
    await submitASRTask(selectedAudio as number, model);
    setSubmitting(false);
    fetchTasks();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      fetchTasks();
      setSnackbar({open: true, msg: '任务删除成功', type: 'success'});
    } catch {
      setSnackbar({open: true, msg: '任务删除失败', type: 'error'});
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gradient-to-br from-gray-950 to-gray-800 rounded-2xl shadow-2xl border border-primary/30 p-8">
      <h2 className="text-2xl font-bold text-primary mb-8 tracking-wide">语音识别任务</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="min-w-[160px] px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none"
          value={selectedAudio}
          onChange={e => setSelectedAudio(Number(e.target.value))}
        >
          <option value="">选择音频</option>
          {audioList.map(audio => (
            <option key={audio.id} value={audio.id}>{audio.filename}</option>
          ))}
        </select>
        <select
          className="min-w-[120px] px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none"
          value={model}
          onChange={e => setModel(e.target.value)}
        >
          {modelOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          className={`px-4 py-2 rounded-lg font-semibold shadow bg-accent text-white transition hover:bg-accent/90 disabled:opacity-50 ${submitting || !selectedAudio ? 'cursor-not-allowed' : ''}`}
          onClick={handleSubmit}
          disabled={submitting || !selectedAudio}
        >
          提交识别
        </button>
      </div>
      <ul className="divide-y divide-gray-800 rounded-xl overflow-hidden bg-gray-900/80">
        {tasks.map(task => (
          <li key={task.id} className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 hover:bg-primary/10 transition group">
            <div>
              <div className="font-semibold text-gray-100">音频ID: {task.audio_file_id}，模型: {task.model_name}</div>
              <div className="text-xs text-gray-400 mt-1">状态: {statusMap[task.id] || task.status}</div>
              {(statusMap[task.id] || task.status) === 'running' && (
                <div className="w-40 h-2 bg-gray-700 rounded mt-2 overflow-hidden">
                  <div className="h-2 bg-primary animate-pulse w-full" style={{ width: '100%' }} />
                </div>
              )}
            </div>
            <button
              className="mt-2 md:mt-0 md:ml-4 p-2 rounded hover:bg-red-600/20 text-red-400 hover:text-red-600 transition self-start"
              onClick={() => handleDelete(task.id)}
              title="删除"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </li>
        ))}
      </ul>
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

export default ASRTaskManager; 