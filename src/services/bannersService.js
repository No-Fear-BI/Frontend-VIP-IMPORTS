/*
 * Banners do carrossel da home (docs/para-o-frontend.md, "Painel administrativo — marcas,
 * categorias e banners", tarefa 57). Um método por rota, com o handler do backend no comentário.
 *
 * No máximo 4 banners ATIVOS — é o carrossel contratado. A quinta ativação (no criar ou editar)
 * é 400 com `erro.campos.ativo` explicando o limite. Banner inativo é rascunho, sem teto.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const bannersService = {
  /** GET /admin/banners — banners_listar. Ativos e inativos, na ordem do carrossel. */
  listar: (sinal) => requisitarAdmin('GET', '/admin/banners', { sinal }),

  /**
   * POST /admin/banners — banners_criar. `imagemUrl` obrigatória (só https); `imagemUrlMobile`
   * também precisa ser https quando informada. Entra no fim da ordem.
   * @param {{ imagemUrl: string, imagemUrlMobile?: string, titulo?: string, subtitulo?: string, alt?: string, linkUrl?: string, ativo?: boolean }} dados
   */
  criar: (dados) => requisitarAdmin('POST', '/admin/banners', { corpo: dados }),

  /** PATCH /admin/banners/:id — banners_editar. Parcial: só o que vier no corpo muda. */
  editar: (id, dados) => requisitarAdmin('PATCH', `/admin/banners/${id}`, { corpo: dados }),

  /** DELETE /admin/banners/:id — banners_excluir. Devolve a lista inteira, já renumerada. */
  excluir: (id) => requisitarAdmin('DELETE', `/admin/banners/${id}`),

  /**
   * PATCH /admin/banners/ordem — banners_reordenar. A lista COMPLETA de ids na ordem desejada
   * (ativos e inativos juntos — o teto vale só para quem está ativo). Devolve a lista inteira.
   * @param {number[]} ids
   */
  reordenar: (ids) => requisitarAdmin('PATCH', '/admin/banners/ordem', { corpo: { ids } }),
};
