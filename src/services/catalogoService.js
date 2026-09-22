/*
 * Catálogo público (contrato v1.0, seção 02). Não exige sessão.
 * Cada função é uma rota; o comentário traz o `handler` de docs/contrato-api-v1.json no backend.
 * Todas aceitam `sinal` (AbortSignal) por último — é o que useRequisicao passa.
 */

import { requisitar } from '../lib/apiClient.js';

export const catalogoService = {
  /** GET /home — montarHome */
  home: (sinal) => requisitar('GET', '/home', { sinal }),

  /**
   * GET /produtos — listarProdutos. Paginação por CURSOR: mande `paginacao.proximoCursor`
   * da página anterior em `cursor`; nunca traga tudo de uma vez.
   * `categoria` só vale junto com `colecao` (o slug de categoria é único por coleção).
   * `cor` aceita vários slugs separados por vírgula, com OU entre eles (como `marca`).
   * @param {{ colecao?, categoria?, marca?, cor?, busca?, ordem?: 'recentes'|'nome', cursor?, porPagina? }} filtros
   */
  produtos: (filtros, sinal) => requisitar('GET', '/produtos', { query: filtros, sinal }),

  /** GET /produtos/:codigo — obterProduto. Não traz `capa`: use `imagens` (já ordenado). */
  produto: (codigo, sinal) => requisitar('GET', `/produtos/${encodeURIComponent(codigo)}`, { sinal }),

  /** GET /produtos/:codigo/relacionados — listarRelacionados */
  relacionados: (codigo, sinal) =>
    requisitar('GET', `/produtos/${encodeURIComponent(codigo)}/relacionados`, { sinal }),

  /** GET /marcas — listarMarcas */
  marcas: (sinal) => requisitar('GET', '/marcas', { sinal }),

  /** GET /cores — listarCores. A paleta do filtro `?cor=`: só as cores ativas no painel. */
  cores: (sinal) => requisitar('GET', '/cores', { sinal }),

  /** GET /colecoes — listarColecoes */
  colecoes: (sinal) => requisitar('GET', '/colecoes', { sinal }),

  /** GET /colecoes/:slug/categorias — listarCategoriasDaColecao. Slug inexistente: 404 COLECAO_NAO_ENCONTRADA. */
  categoriasDaColecao: (slug, sinal) =>
    requisitar('GET', `/colecoes/${encodeURIComponent(slug)}/categorias`, { sinal }),
};
