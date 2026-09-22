/*
 * Destaques da home (docs/para-o-frontend.md, "Painel administrativo — destaques e consultas",
 * tarefa 58). As duas rotas SUBSTITUEM O CONJUNTO INTEIRO: mande sempre a lista completa de ids,
 * na ordem em que devem aparecer — quem não estiver na lista deixa de ser destaque.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const destaquesService = {
  /**
   * PATCH /admin/destaques/produtos — definirProdutosDestaque. Teto de 12 (o que a home
   * renderiza). Produto oculto é 400 com `erro.detalhes.ocultos` (lista de ids). Devolve só os
   * ids gravados, na ordem — a tela já tem os dados completos, não precisa reler.
   * @param {number[]} ids
   */
  produtos: (ids) => requisitarAdmin('PATCH', '/admin/destaques/produtos', { corpo: { ids } }),

  /**
   * PATCH /admin/destaques/categorias — definirCategoriasDestaque. Teto de 8. Categoria inativa
   * é 400 com `erro.detalhes.inativas` (lista de ids).
   * @param {number[]} ids
   */
  categorias: (ids) => requisitarAdmin('PATCH', '/admin/destaques/categorias', { corpo: { ids } }),
};
