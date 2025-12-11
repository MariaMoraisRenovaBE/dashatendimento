import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    proxy: {
      // Proxy para API de pipelines Nextags (resolve problema de CORS)
      '/api-nextags': {
        target: 'https://app.nextagsai.com.br/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-nextags/, ''),
        // Garante que todos os headers sejam passados, incluindo Authorization
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Log para debug (remover em produção)
            if (req.headers.authorization) {
              console.log('🔑 Header de autenticação sendo enviado:', req.headers.authorization.substring(0, 20) + '...');
            }
          });
        },
      }
    }
  }
})

