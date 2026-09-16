import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A API fica atrás do mesmo host do site (proxy /api), para os cookies de sessão
// (`vip_sessao_cliente`, SameSite=Lax) valerem sem configuração de CORS no navegador.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
