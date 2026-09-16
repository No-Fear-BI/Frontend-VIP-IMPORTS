/* Favoritos do cliente (contrato v1.0, seção 03). Exige sessão de cliente. */

import { requisitar } from '../lib/apiClient.js';

export const favoritosService = {
  /** GET /favoritos — listarFavoritos */
  listar: (sinal) => requisitar('GET', '/favoritos', { sinal }),

  /** POST /favoritos — adicionarFavorito. 200 {"ok": true}; favoritar duas vezes não é erro. */
  adicionar: (produtoId) => requisitar('POST', '/favoritos', { corpo: { produtoId } }),

  /** DELETE /favoritos/:produtoId — removerFavorito. 200 {"ok": true}. */
  remover: (produtoId) => requisitar('DELETE', `/favoritos/${produtoId}`),
};
