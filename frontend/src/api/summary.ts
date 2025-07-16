import api from './index';

export const generateSummary = (task_id: number, algo: string = 'truncate', length: number = 100, detail: number = 1, config?: any) =>
  api.post('/summary/generate', { task_id, algo, length, detail, config }); 