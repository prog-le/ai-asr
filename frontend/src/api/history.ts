import api from './index';

export const listTasks = () => api.get('/history/tasks');
export const listResults = () => api.get('/history/results');
export const deleteTask = (task_id: number) => api.delete(`/history/task/${task_id}`);
export const deleteResult = (result_id: number) => api.delete(`/history/result/${result_id}`); 