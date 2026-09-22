/*
 * Produtos no painel (docs/para-o-frontend.md, "Painel administrativo — produtos" e "imagens e
 * variações", mais a revisão 0007 de cores). Um método por rota, com o handler do backend.
 *
 * Diferenças para o catálogo público que a tela precisa saber:
 * - A listagem traz os OCULTOS e pagina por PÁGINA (`pagina`/`porPagina`), não por cursor.
 * - Os filtros são por ID (`marcaId`, `colecaoId`, `categoriaId`, `corId`), não por slug.
 * - O produto abre por ID, não por código: no painel o código é editável.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const produtosAdminService = {
  /**
   * GET /admin/produtos — listar. Envelope `{dados, paginacao: {total, porPagina, pagina}}`.
   * `status` ausente traz tudo, inclusive os ocultos.
   * @param {{ busca?, marcaId?, categoriaId?, colecaoId?, corId?, status?: 'normal'|'esgotado'|'oculto', pagina?, porPagina? }} filtros
   */
  listar: (filtros, sinal) => requisitarAdmin('GET', '/admin/produtos', { query: filtros, sinal }),

  /** GET /admin/produtos/:id — detalhe. `variacoes[]` traz `corId` (null em tamanho). */
  obter: (id, sinal) => requisitarAdmin('GET', `/admin/produtos/${id}`, { sinal }),

  /**
   * PATCH /admin/produtos/:id/variacoes — variacoes_definir. SUBSTITUI A GRADE INTEIRA: o que
   * não vier na lista sai, sem erro. Mande sempre tudo o que o produto tem, e cada cor com o
   * `corId` que veio da leitura — pelo texto, uma cor renomeada viraria cor nova na paleta.
   * Devolve a grade gravada, já com `corId`.
   * @param {{ tipo: 'tamanho'|'cor', valor: string, corId?: number, disponivel?: boolean }[]} variacoes
   */
  definirVariacoes: (id, variacoes) =>
    requisitarAdmin('PATCH', `/admin/produtos/${id}/variacoes`, { corpo: { variacoes } }),
};

/*
 * Marcas e categorias do painel, por enquanto só a leitura que os filtros da listagem usam.
 * As coleções não têm rota de painel (são duas, fixas): vêm de `catalogoService.colecoes`.
 */
export const catalogoAdminService = {
  /** GET /admin/marcas — marcas_listar. Traz as inativas e `totalProdutos` com ocultos. */
  marcas: (sinal) => requisitarAdmin('GET', '/admin/marcas', { sinal }),

  /** GET /admin/categorias — categorias_listar. `colecaoId` opcional; cada uma traz `colecaoId`. */
  categorias: (colecaoId, sinal) =>
    requisitarAdmin('GET', '/admin/categorias', { query: { colecaoId }, sinal }),
};
