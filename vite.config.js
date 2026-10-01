import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Só no `dev:exemplo`: a foto da revisão é um <img> apontando para o proxy do backend
// (/admin/revisao/imagem?url=...). Sem backend, redireciona para a ilustração local.
const imagemRevisaoExemplo = {
  name: 'imagem-revisao-exemplo',
  configureServer(servidor) {
    servidor.middlewares.use('/api/v1/admin/revisao/imagem', (req, res) => {
      const destino = new URL(req.url, 'http://localhost').searchParams.get('url');
      res.statusCode = destino?.startsWith('/exemplo/') ? 302 : 404;
      if (res.statusCode === 302) res.setHeader('Location', destino);
      res.end();
    });
  },
};

// A API fica atrás do mesmo host do site (proxy /api), para os cookies de sessão
// (`vip_sessao_cliente`, SameSite=Lax) valerem sem configuração de CORS no navegador.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'exemplo' ? [imagemRevisaoExemplo] : [])],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
}));
