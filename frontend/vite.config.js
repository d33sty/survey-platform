import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // В деве базовый путь '/'; в прод-сборке nginx-образ передаёт VITE_BASE=/survey/
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  server: {
    usePolling: true,
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
});
