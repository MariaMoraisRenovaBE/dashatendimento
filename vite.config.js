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
      '/api-nextags': {
        target: 'https://app.nextagsai.com.br/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-nextags/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Log completo dos headers recebidos do frontend
            console.log('📥 [PROXY] Headers recebidos do frontend:', {
              'x-api-key': req.headers['x-api-key'] ? req.headers['x-api-key'].substring(0, 20) + '...' : 'AUSENTE',
              'x-access-token': req.headers['x-access-token'] ? req.headers['x-access-token'].substring(0, 20) + '...' : 'AUSENTE',
              'authorization': req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'AUSENTE',
              'content-type': req.headers['content-type'] || 'AUSENTE'
            });
            
            // Garante que o header de autenticação seja passado corretamente
            // Verificar X-ACCESS-TOKEN primeiro (formato usado pela NextagsAI)
            if (req.headers['x-access-token']) {
              proxyReq.setHeader('X-ACCESS-TOKEN', req.headers['x-access-token']);
              console.log('✅ [PROXY] Header X-ACCESS-TOKEN confirmado e sendo enviado para a API:', req.headers['x-access-token'].substring(0, 20) + '...');
            } else if (req.headers['x-api-key']) {
              proxyReq.setHeader('X-API-Key', req.headers['x-api-key']);
              console.log('✅ [PROXY] Header X-API-Key confirmado e sendo enviado para a API:', req.headers['x-api-key'].substring(0, 20) + '...');
            } else if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
              console.log('✅ [PROXY] Header Authorization confirmado e sendo enviado');
            } else {
              console.warn('⚠️ [PROXY] NENHUM HEADER DE AUTENTICAÇÃO ENCONTRADO!');
              console.warn('   Headers disponíveis:', Object.keys(req.headers).filter(h => h.toLowerCase().includes('token') || h.toLowerCase().includes('auth') || h.toLowerCase().includes('api')));
            }
            
            // Log da URL final que será chamada
            const targetUrl = `https://app.nextagsai.com.br/api${req.url}`;
            console.log('🌐 [PROXY] Redirecionando para:', targetUrl);
            
            // Log de todos os headers que serão enviados
            const allHeaders = proxyReq.getHeaders();
            console.log('📤 [PROXY] Todos os headers sendo enviados para a API:', Object.keys(allHeaders));
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 [PROXY] Resposta recebida da API:', {
              status: proxyRes.statusCode,
              statusText: proxyRes.statusMessage,
              headers: Object.keys(proxyRes.headers)
            });
          });
        },
      }
    }
  }
})
