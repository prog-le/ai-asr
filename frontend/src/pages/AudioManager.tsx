import React, { useState, useEffect } from 'react';
import { uploadAudio, listAudio, deleteAudio } from '../api/audio';

interface AudioFile {
  id: number;
  filename: string;
  filepath: string;
  upload_time: string;
  duration?: number;
  samplerate?: number;
}

const AudioManager: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [audioList, setAudioList] = useState<AudioFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchList = () => {
    listAudio().then(res => setAudioList(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);
    try {
      await uploadAudio(files);
      setFiles([]);
      fetchList();
    } catch {
      // 错误处理
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    await deleteAudio(id);
    fetchList();
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-gradient-to-br from-gray-950 to-gray-800 rounded-2xl shadow-2xl border border-primary/30 p-8">
      <h2 className="text-2xl font-bold text-primary mb-8 tracking-wide">音频上传与管理</h2>
      <div className="flex items-center gap-4 mb-6">
        <label className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 cursor-pointer transition">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          选择文件
          <input type="file" hidden multiple accept="audio/*" onChange={handleFileChange} />
        </label>
        <button
          className={`px-4 py-2 rounded-lg font-semibold shadow bg-accent text-white transition hover:bg-accent/90 disabled:opacity-50 ${uploading || !files.length ? 'cursor-not-allowed' : ''}`}
          onClick={handleUpload}
          disabled={uploading || !files.length}
        >
          上传
        </button>
      </div>
      {uploading && (
        <div className="w-full h-2 bg-gray-700 rounded mb-4 overflow-hidden">
          <div className="h-2 bg-primary animate-pulse w-full" style={{ width: '100%' }} />
        </div>
      )}
      <ul className="divide-y divide-gray-800 rounded-xl overflow-hidden bg-gray-900/80">
        {audioList.map(audio => (
          <li key={audio.id} className="flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition group">
            <div>
              <div className="font-semibold text-gray-100">{audio.filename}</div>
              <div className="text-xs text-gray-400 mt-1">上传时间: {audio.upload_time}{audio.duration ? `，时长: ${audio.duration}s` : ''}</div>
            </div>
            <button
              className="ml-4 p-2 rounded hover:bg-red-600/20 text-red-400 hover:text-red-600 transition"
              onClick={() => handleDelete(audio.id)}
              title="删除"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AudioManager; 