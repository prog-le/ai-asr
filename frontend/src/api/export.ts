import api from './index';

export const exportResult = (task_id: number, format: string = 'txt') =>
  api.get(`/export/result/${task_id}`, { params: { format }, responseType: 'blob' }); 