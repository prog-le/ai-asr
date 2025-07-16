import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 后端服务地址，可根据需要切换
const backendTarget = 'http://localhost:8000';
// const backendTarget = 'http://127.0.0.1:8000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': backendTarget,
      '/audio': backendTarget,
      '/asr': backendTarget,
      '/history': backendTarget,
      '/model': backendTarget,
      '/export': backendTarget,
      '/summary': backendTarget,
      // 如有其他后端路由前缀请补充
    },
    host: '0.0.0.0',
  },
})
