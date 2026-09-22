/*
 * Marcas no painel (docs/para-o-frontend.md, "Painel administrativo — marcas, categorias e
 * banners", tarefa 57). Um método por rota, com o handler do backend no comentário.
 *
 * A listagem PÚBLICA (só o que a vitrine mostra) é outra rota e mora em `catalogoService.marcas`
 * — esta aqui traz `ativa`, `ordem` e `totalProdutos` contando os ocultos, que é o painel.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const marcasService = {
  /** GET /admin/marcas — marcas_listar. Traz as inativas e `totalProdutos` (contando ocultos). */
  listar: (sinal) => requisitarAdmin('GET', '/admin/marcas', { sinal }),

  /**
   * POST /admin/marcas — marcas_criar. `slug` ausente nasce do nome; se colidir, ganha sufixo
   * (`prada-2`). Slug informado que colide é 409 `SLUG_EM_USO`.
   * @param {{ nome: string, slug?: string, logoUrl?: string, ordem?: number, ativa?: boolean }} dados
   */
  criar: (dados) => requisitarAdmin('POST', '/admin/marcas', { corpo: dados }),

  /**
   * PATCH /admin/marcas/:id — marcas_editar. `slug` SÓ muda se vier no corpo: trocar o nome não
   * mexe na URL pública (`/marcas/:slug`), que já pode estar compartilhada e indexada.
   */
  editar: (id, dados) => requisitarAdmin('PATCH', `/admin/marcas/${id}`, { corpo: dados }),

  /** DELETE /admin/marcas/:id — marcas_excluir. 409 `MARCA_COM_PRODUTOS` com `erro.detalhes.totalProdutos`. */
  excluir: (id) => requisitarAdmin('DELETE', `/admin/marcas/${id}`),
};
