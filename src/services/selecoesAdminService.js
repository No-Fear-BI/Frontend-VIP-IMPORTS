/*
 * Seleções recebidas, vistas pelo painel (docs/para-o-frontend.md, "Painel administrativo —
 * destaques e consultas"). Paginação POR PÁGINA (`pagina`/`porPagina`), diferente da loja
 * (`selecoesService.historico`, que pagina por cursor).
 *
 * Os itens de uma seleção são dado CONGELADO: `codigo`, `nome`, `marca`, `categoria`, `colecao`,
 * `imagemUrl` e `variacao` são cópias do que o cliente viu no envio, não um JOIN com o catálogo
 * de hoje. Se o produto foi excluído depois, `produtoId` vem `null` e o resto continua igual —
 * a tela mostra o item normalmente, só sem link para o produto.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const selecoesAdminService = {
  /**
   * GET /admin/selecoes — listarSelecoesAdmin. Mais recentes primeiro. Envelope
   * `{dados, paginacao: {total, porPagina, pagina}}`. Cada seleção traz `criadoEm`, `totalItens`,
   * `cliente` (id, nome, email, telefone) e `itens`.
   * @param {{ pagina?: number, porPagina?: number }} filtros
   */
  listar: (filtros, sinal) => requisitarAdmin('GET', '/admin/selecoes', { query: filtros, sinal }),

  /** GET /admin/selecoes/:id — obterSelecaoAdmin. O detalhe, com os mesmos itens congelados. */
  obter: (id, sinal) => requisitarAdmin('GET', `/admin/selecoes/${id}`, { sinal }),
};
