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
   * POST /admin/produtos — criar. Responde 201 com o produto. `codigo` ausente: o backend gera
   * no padrão da marca (três letras + sequencial). `categoriaId` já diz a coleção — não existe
   * `colecaoId` no corpo.
   * @param {{ codigo?: string, nome: string, descricao?: string, status?: string, marcaId: number, categoriaId: number }} dados
   */
  criar: (dados) => requisitarAdmin('POST', '/admin/produtos', { corpo: dados }),

  /**
   * PATCH /admin/produtos/:id — editar. PARCIAL: campo ausente não muda; `null` em `descricao`
   * apaga. Mande só o que mudou.
   */
  editar: (id, patch) => requisitarAdmin('PATCH', `/admin/produtos/${id}`, { corpo: patch }),

  /**
   * POST /admin/produtos/:id/duplicar — responde 201 com a cópia: mesmas imagens e variações,
   * código novo, "(cópia)" no nome. A cópia nasce SEMPRE oculta e sem destaque.
   */
  duplicar: (id) => requisitarAdmin('POST', `/admin/produtos/${id}/duplicar`),

  /**
   * POST /admin/produtos/:id/imagens — acrescenta por URL (só https, máx. 10 no total). As
   * novas entram no FIM da ordem — nunca trocam a capa sozinhas. Devolve a galeria inteira.
   * @param {{ url: string, alt?: string }[]} imagens
   */
  adicionarImagens: (id, imagens) =>
    requisitarAdmin('POST', `/admin/produtos/${id}/imagens`, { corpo: { imagens } }),

  /**
   * PATCH /admin/produtos/:id/imagens/ordem — a lista COMPLETA de ids na ordem desejada.
   * A de ordem 1 vira a capa. Lista parcial é 400.
   * @param {number[]} ids
   */
  reordenarImagens: (id, ids) =>
    requisitarAdmin('PATCH', `/admin/produtos/${id}/imagens/ordem`, { corpo: { ids } }),

  /** DELETE /admin/imagens/:id — sem o produto na URL. Devolve as imagens que sobraram. */
  excluirImagem: (imagemId) => requisitarAdmin('DELETE', `/admin/imagens/${imagemId}`),

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
