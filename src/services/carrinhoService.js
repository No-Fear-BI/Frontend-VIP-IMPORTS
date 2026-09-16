/*
 * Carrinho do cliente (contrato v1.0, seção 03). Na TELA ele se chama "seleção".
 * Exige sessão de cliente. O carrinho não tem quantidade: mesmo produto + mesmo par = um item só.
 * O item tem `id` (o produto, para link e imagem) e `itemId` (a linha, usada em PATCH/DELETE).
 */

import { requisitar } from '../lib/apiClient.js';

export const carrinhoService = {
  /** GET /carrinho — obterCarrinho */
  obter: (sinal) => requisitar('GET', '/carrinho', { sinal }),

  /**
   * POST /carrinho — adicionarAoCarrinho. As duas variações são opcionais: mande só o que existir.
   * Não inverta os campos: cor em `variacaoTamanhoId` volta 400 VARIACAO_INVALIDA.
   */
  adicionar: ({ produtoId, variacaoTamanhoId, variacaoCorId }) =>
    requisitar('POST', '/carrinho', { corpo: semNulos({ produtoId, variacaoTamanhoId, variacaoCorId }) }),

  /**
   * PATCH /carrinho/:itemId — atualizarItemCarrinho. TROCA O PAR INTEIRO: o campo que não vier
   * vira nulo no backend. Por isso os dois são obrigatórios aqui (passe `null` quando vazio).
   * Se cair num par que já existe, os itens se fundem e este `itemId` some: recarregue com obter().
   */
  trocarVariacao: (itemId, { variacaoTamanhoId, variacaoCorId }) => {
    if (variacaoTamanhoId === undefined || variacaoCorId === undefined) {
      throw new Error('carrinhoService.trocarVariacao: mande variacaoTamanhoId E variacaoCorId (null quando vazio).');
    }
    return requisitar('PATCH', `/carrinho/${itemId}`, { corpo: { variacaoTamanhoId, variacaoCorId } });
  },

  /** DELETE /carrinho/:itemId — removerItemCarrinho. Item de outro cliente também volta 404 ITEM_NAO_ENCONTRADO. */
  remover: (itemId) => requisitar('DELETE', `/carrinho/${itemId}`),

  /**
   * POST /carrinho/migrar — migrarCarrinhoAnonimo. HOJE A LOJA NÃO USA: não existe carrinho anônimo
   * (docs/decisoes-frontend.md, seção 4). Fica aqui para o contrato estar completo.
   * Resposta: { itens, ignorados } — mostre os ignorados, não descarte em silêncio.
   * @param {{ produtoId, variacaoTamanhoId?, variacaoCorId? }[]} itens
   */
  migrar: (itens) => requisitar('POST', '/carrinho/migrar', { corpo: { itens: itens.map(semNulos) } }),
};

function semNulos(objeto) {
  return Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== null && valor !== undefined));
}
