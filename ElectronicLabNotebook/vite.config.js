import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: "/electronic-lab-notebook/",
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api/* requests to your FastAPI backend
      '/api': {
        target: 'https://electronic-lab-notebook.onrender.com/',
        // target: 'http://0.0.0.0:8000/',
        changeOrigin: true,
      },
    },
  },
});