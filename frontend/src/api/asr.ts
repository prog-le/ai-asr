import api from './index';

export const submitASRTask = (audio_file_id: number, model_name: string, model_params: any = {}) =>
  api.post('/asr/submit', { audio_file_id, model_name, model_params });

export const listASRTasks = () => api.get('/asr/list');

export const getASRProgress = (task_id: number) => api.get(`/asr/progress/${task_id}`);

export const getASRResult = (task_id: number) => api.get(`/asr/result/${task_id}`); 