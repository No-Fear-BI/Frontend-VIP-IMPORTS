/*
 * Vocabulário de cores no painel (docs/para-o-frontend.md, "Cores", revisão 0007).
 * Um método por rota, com o handler do backend no comentário.
 *
 * A paleta PÚBLICA (só as ativas, para o filtro da vitrine) é outra rota e mora em
 * `catalogoService.cores` — esta aqui traz também as inativas e a contagem com ocultos.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const coresService = {
  /** GET /admin/cores — listar_cores. Traz inativas e `totalProdutos` (contando ocultos). */
  listar: (sinal) => requisitarAdmin('GET', '/admin/cores', { sinal }),

  /**
   * POST /admin/cores — criar_cor. `slug` ausente nasce do nome; se colidir, ganha sufixo.
   * @param {{ nome: string, slug?: string, ordem?: number, ativa?: boolean }} dados
   */
  criar: (dados) => requisitarAdmin('POST', '/admin/cores', { corpo: dados }),

  /**
   * PATCH /admin/cores/:id — editar_cor. Trocar `nome` reescreve o texto das variações que
   * usam a cor; 409 COR_EM_CONFLITO quando algum produto já tem outra cor com esse nome
   * (`erro.detalhes.codigoProduto` diz qual). O slug SÓ muda se vier no corpo.
   */
  editar: (id, dados) => requisitarAdmin('PATCH', `/admin/cores/${id}`, { corpo: dados }),

  /** DELETE /admin/cores/:id — excluir_cor. 409 COR_EM_USO com `erro.detalhes.totalProdutos`. */
  excluir: (id) => requisitarAdmin('DELETE', `/admin/cores/${id}`),

  /**
   * GET /admin/produtos?corId= — listar_produtos_admin filtrado por cor. É a busca de
   * "quais peças são desta cor", com os OCULTOS junto, ao contrário da vitrine.
   */
  produtosDaCor: (corId, sinal) =>
    requisitarAdmin('GET', '/admin/produtos', { query: { corId, porPagina: 50 }, sinal }),
};
