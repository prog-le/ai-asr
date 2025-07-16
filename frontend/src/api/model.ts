import axios from 'axios';

export interface ModelInfo {
  id: number;
  name: string;
  display_name: string;
  type: string;
  status: string;
  local_path?: string;
  config?: any;
  version?: string;
  size?: number;
  create_time?: string;
  update_time?: string;
}

export interface ModelRegisterParams {
  name: string;
  display_name: string;
  type: string;
  local_path?: string;
  remote_url?: string;
  version?: string;
  config?: any;
  size?: number;
}

export const listModels = () => axios.get<ModelInfo[]>('/api/models');
export const registerModel = (data: ModelRegisterParams) => axios.post<ModelInfo>('/api/models/download', data);
export const switchModel = (id: number) => axios.post('/api/models/switch', { id });
export const deleteModel = (id: number, deleteFile = false) => axios.delete(`/api/models/${id}`, { params: { delete_file: deleteFile } });
export const updateModelConfig = (id: number, config: any) => axios.patch<ModelInfo>(`/api/models/${id}/config`, { config });
export const loadModel = (id: number) => axios.post(`/api/models/${id}/load`);
export const unloadModel = (id: number) => axios.post(`/api/models/${id}/unload`); 