import React, { useEffect, useState } from 'react';
import { listModels, registerModel, switchModel, deleteModel, updateModelConfig, loadModel, unloadModel } from '../api/model';
import type { ModelInfo, ModelRegisterParams } from '../api/model';

const ModelManager: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ModelRegisterParams>({ name: '', display_name: '', type: '', local_path: '', remote_url: '', version: '', config: '', size: undefined });
  const [configEditId, setConfigEditId] = useState<number|null>(null);
  const [configValue, setConfigValue] = useState('');
  const [actionLoading, setActionLoading] = useState<number|null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, msg: string}>({open: false, msg: ''});

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await listModels();
      const arr = Array.isArray(res.data) ? res.data : [];
      setModels(arr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModels(); }, []);

  const handleOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); setForm({ name: '', display_name: '', type: '', local_path: '', remote_url: '', version: '', config: '', size: undefined }); };

  const handleRegister = async () => {
    setActionLoading(-1);
    try {
      await registerModel(form);
      handleClose();
      fetchModels();
      setSnackbar({open: true, msg: '模型注册/下载成功'});
    } catch (e: any) {
      setSnackbar({open: true, msg: e?.response?.data?.detail || '操作失败'});
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(id);
    try {
      await deleteModel(id, true);
      fetchModels();
      setSnackbar({open: true, msg: '模型已删除'});
    } catch (e: any) {
      setSnackbar({open: true, msg: e?.response?.data?.detail || '操作失败'});
    } finally {
      setActionLoading(null);
    }
  };

  const handleSwitch = async (id: number) => {
    setActionLoading(id);
    try {
      await switchModel(id);
      fetchModels();
      setSnackbar({open: true, msg: '切换成功'});
    } catch (e: any) {
      setSnackbar({open: true, msg: e?.response?.data?.detail || '操作失败'});
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoad = async (id: number) => {
    setActionLoading(id);
    try {
      await loadModel(id);
      fetchModels();
      setSnackbar({open: true, msg: '加载成功'});
    } catch (e: any) {
      setSnackbar({open: true, msg: e?.response?.data?.detail || '操作失败'});
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnload = async (id: number) => {
    setActionLoading(id);
    try {
      await unloadModel(id);
      fetchModels();
      setSnackbar({open: true, msg: '卸载成功'});
    } catch (e: any) {
      setSnackbar({open: true, msg: e?.response?.data?.detail || '操作失败'});
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfigEdit = (id: number, config: any) => {
    setConfigEditId(id);
    setConfigValue(JSON.stringify(config, null, 2));
  };
  const handleConfigSave = async () => {
    if (configEditId !== null) {
      setActionLoading(configEditId);
      try {
        let parsed;
        try {
          parsed = JSON.parse(configValue);
        } catch (e) {
          setSnackbar({open: true, msg: '参数格式错误，请输入合法JSON'});
          setActionLoading(null);
          return;
        }
        await updateModelConfig(configEditId, parsed);
        setConfigEditId(null);
        fetchModels();
        setSnackbar({open: true, msg: '参数已更新'});
      } catch (e: any) {
        setSnackbar({open: true, msg: e?.response?.data?.detail || '操作失败'});
      } finally {
        setActionLoading(null);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-gradient-to-br from-gray-950 to-gray-800 rounded-2xl shadow-2xl border border-primary/30 p-8">
      <h2 className="text-2xl font-bold text-primary mb-8 tracking-wide">模型管理</h2>
      <button onClick={handleOpen} className="mb-4 px-4 py-2 rounded-lg font-semibold shadow bg-primary text-white transition hover:bg-primary/90 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        注册/下载模型
      </button>
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/80">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-primary/10 text-primary">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">本地路径</th>
              <th className="px-4 py-3">版本</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8"><span className="animate-pulse text-primary">加载中...</span></td></tr>
            ) : (
              Array.isArray(models) && models.length > 0 ? models.map(m => (
                <tr key={m.id} className="hover:bg-primary/10 transition group">
                  <td className="px-4 py-2">{m.id}</td>
                  <td className="px-4 py-2"><span className="font-semibold text-gray-100">{m.display_name}</span><br /><span className="text-xs text-gray-400">{m.name}</span></td>
                  <td className="px-4 py-2">{m.type}</td>
                  <td className="px-4 py-2">{m.status}</td>
                  <td className="px-4 py-2">{m.local_path}</td>
                  <td className="px-4 py-2">{m.version}</td>
                  <td className="px-4 py-2 flex flex-wrap gap-1 items-center">
                    <button onClick={() => handleSwitch(m.id)} disabled={actionLoading===m.id} className="px-2 py-1 rounded bg-primary/80 text-white text-xs font-semibold hover:bg-primary/90 transition disabled:opacity-50">切换</button>
                    <button onClick={() => handleLoad(m.id)} disabled={actionLoading===m.id} className="px-2 py-1 rounded bg-green-700 text-white text-xs font-semibold hover:bg-green-800 transition disabled:opacity-50">加载</button>
                    <button onClick={() => handleUnload(m.id)} disabled={actionLoading===m.id} className="px-2 py-1 rounded bg-yellow-700 text-white text-xs font-semibold hover:bg-yellow-800 transition disabled:opacity-50">卸载</button>
                    <button onClick={() => handleConfigEdit(m.id, m.config)} className="px-2 py-1 rounded bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition">编辑参数</button>
                    <button onClick={() => handleDelete(m.id)} disabled={actionLoading===m.id} className="px-2 py-1 rounded bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition disabled:opacity-50">删除</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">暂无模型</td></tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {/* 注册/下载模型弹窗 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-primary/30">
            <h3 className="text-lg font-bold text-primary mb-4">注册/下载模型</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="模型英文名" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="展示名" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="类型(asr/summary)" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="本地路径(可选)" value={form.local_path} onChange={e => setForm(f => ({ ...f, local_path: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="远程下载URL(可选)" value={form.remote_url} onChange={e => setForm(f => ({ ...f, remote_url: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="版本(可选)" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
              <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="参数(JSON，可选)" value={form.config} onChange={e => setForm(f => ({ ...f, config: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={handleClose} className="px-4 py-2 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-600 transition">取消</button>
              <button onClick={handleRegister} disabled={actionLoading===-1} className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50">{actionLoading===-1 ? '提交中...' : '提交'}</button>
            </div>
          </div>
        </div>
      )}
      {/* 编辑参数弹窗 */}
      {configEditId!==null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-primary/30">
            <h3 className="text-lg font-bold text-primary mb-4">编辑模型参数</h3>
            <textarea className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-primary outline-none min-h-[120px]" value={configValue} onChange={e=>setConfigValue(e.target.value)} />
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={()=>setConfigEditId(null)} className="px-4 py-2 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-600 transition">取消</button>
              <button onClick={handleConfigSave} disabled={actionLoading===configEditId} className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50">{actionLoading===configEditId ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed left-1/2 -translate-x-1/2 bottom-8 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold bg-primary`}
          onAnimationEnd={() => setSnackbar({...snackbar, open: false})}
        >
          {snackbar.msg}
        </div>
      )}
    </div>
  );
};

export default ModelManager; 