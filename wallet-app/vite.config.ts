import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': process.env.VITE_NODE_URL || 'http://localhost:3000',
      '/blocks': process.env.VITE_NODE_URL || 'http://localhost:3000',
      '/accounts': process.env.VITE_NODE_URL || 'http://localhost:3000',
      '/txs': process.env.VITE_NODE_URL || 'http://localhost:3000',
      '/mine': process.env.VITE_NODE_URL || 'http://localhost:3000',
    },
  },
});
