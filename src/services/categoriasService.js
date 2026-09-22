/*
 * Categorias no painel (docs/para-o-frontend.md, "Painel administrativo — marcas, categorias e
 * banners", tarefa 57). Um método por rota, com o handler do backend no comentário.
 *
 * O slug é único POR COLEÇÃO, não global: "bolsas" existe em Feminino e em Masculino, e são
 * categorias diferentes — por isso toda leitura e escrita aqui carrega `colecaoId`/`colecao_id`.
 * Não existe CRUD de coleções: são duas, fixas (`catalogoService.colecoes`).
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const categoriasService = {
  /** GET /admin/categorias — categorias_listar. `colecaoId` opcional filtra a listagem. */
  listar: (colecaoId, sinal) =>
    requisitarAdmin('GET', '/admin/categorias', { query: { colecaoId }, sinal }),

  /**
   * POST /admin/categorias — categorias_criar. `slug` ausente nasce do nome; se colidir DENTRO
   * da mesma coleção, ganha sufixo. Slug informado que colide na mesma coleção é 409
   * `SLUG_EM_USO` — na outra coleção o mesmo slug é normal.
   * @param {{ colecaoId: number, nome: string, slug?: string, ativa?: boolean }} dados
   */
  criar: (dados) => requisitarAdmin('POST', '/admin/categorias', { corpo: dados }),

  /**
   * PATCH /admin/categorias/:id — categorias_editar. `slug` SÓ muda se vier no corpo. Esta tela
   * não manda `colecaoId`: trocar a coleção de uma categoria com produtos é 409
   * `CATEGORIA_COM_PRODUTOS` (o caminho é criar a categoria na coleção certa e mover os produtos
   * por `PATCH /admin/produtos/lote`), e para a categoria virar de coleção na tela sem decisão
   * consciente sobre os produtos não vale a pena — a coleção é escolha de quando a categoria nasce.
   */
  editar: (id, dados) => requisitarAdmin('PATCH', `/admin/categorias/${id}`, { corpo: dados }),

  /** DELETE /admin/categorias/:id — categorias_excluir. 409 `CATEGORIA_COM_PRODUTOS` com `erro.detalhes.totalProdutos`. */
  excluir: (id) => requisitarAdmin('DELETE', `/admin/categorias/${id}`),
};
