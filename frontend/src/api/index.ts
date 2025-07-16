import axios from 'axios';

const api = axios.create({
  baseURL: '', // 走 Vite 代理，不要写死后端地址
  timeout: 60000,
});

// 请求拦截器，可加token等
api.interceptors.request.use(config => {
  // config.headers['Authorization'] = 'Bearer ...';
  return config;
});

// 响应拦截器，统一错误处理
api.interceptors.response.use(
  response => response,
  error => {
    // 可全局弹窗提示
    return Promise.reject(error);
  }
);

export default api; 