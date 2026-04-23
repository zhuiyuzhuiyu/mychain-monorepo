import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.VITE_NODE_URL || 'http://localhost:3000',
      '/blocks': {
        target: process.env.VITE_NODE_URL || 'http://localhost:3000',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
      '/accounts': {
        target: process.env.VITE_NODE_URL || 'http://localhost:3000',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
      '/txs': {
        target: process.env.VITE_NODE_URL || 'http://localhost:3000',
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined,
      },
      '/mine': process.env.VITE_NODE_URL || 'http://localhost:3000',
    },
  },
})
