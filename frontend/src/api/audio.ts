import api from './index';

export const uploadAudio = (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  return api.post('/audio/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const listAudio = () => api.get('/audio/list');

export const deleteAudio = (id: number) => api.delete(`/audio/delete/${id}`); 