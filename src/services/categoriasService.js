/*
 * Categorias no painel (docs/para-o-frontend.md, "Painel administrativo — marcas, categorias e
 * banners", tarefa 57; revisto na migração 0015). Um método por rota, com o handler do backend
 * no comentário.
 *
 * Desde a 0015 a categoria NÃO pertence a coleção: o slug é único na tabela toda. Feminino e
 * Masculino são o público do produto (`publicos`), não categoria.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const categoriasService = {
  /** GET /admin/categorias — categorias_listar. Todas, inclusive as escondidas (`ativa: false`). */
  listar: (sinal) => requisitarAdmin('GET', '/admin/categorias', { sinal }),

  /**
   * POST /admin/categorias — categorias_criar. `slug` ausente nasce do nome; se colidir, ganha
   * sufixo. Slug informado que já existe é 409 `SLUG_EM_USO`.
   * @param {{ nome: string, slug?: string, ativa?: boolean }} dados
   */
  criar: (dados) => requisitarAdmin('POST', '/admin/categorias', { corpo: dados }),

  /** PATCH /admin/categorias/:id — categorias_editar. `slug` SÓ muda se vier no corpo. */
  editar: (id, dados) => requisitarAdmin('PATCH', `/admin/categorias/${id}`, { corpo: dados }),

  /** DELETE /admin/categorias/:id — categorias_excluir. 409 `CATEGORIA_COM_PRODUTOS` com `erro.detalhes.totalProdutos`. */
  excluir: (id) => requisitarAdmin('DELETE', `/admin/categorias/${id}`),
};
