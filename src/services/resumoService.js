/*
 * Resumo do painel (docs/para-o-frontend.md, "Painel administrativo — consultas", seção 4.1).
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const resumoService = {
  /**
   * GET /admin/resumo — obterResumo. A tela inicial do painel.
   * @returns {Promise<{ totalProdutos: number, produtosEsgotados: number, produtosOcultos: number,
   *   porMarca: { marcaId: number, nome: string, slug: string, total: number }[],
   *   totalClientes: number }>}
   */
  obter: (sinal) => requisitarAdmin('GET', '/admin/resumo', { sinal }),
};
