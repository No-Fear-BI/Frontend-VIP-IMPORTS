/*
 * Seleções enviadas pelo WhatsApp (contrato v1.0, seção 03). Exige sessão de cliente.
 * O link do WhatsApp vem PRONTO do backend: nunca monte `wa.me` nem guarde o número da loja aqui.
 */

import { requisitar } from '../lib/apiClient.js';

export const selecoesService = {
  /**
   * POST /selecoes — criarSelecao. Corpo vazio: a seleção é o carrinho atual.
   * Responde 201 com `linkWhatsapp`. NÃO esvazia o carrinho. Carrinho vazio: 400 CARRINHO_VAZIO.
   */
  enviar: () => requisitar('POST', '/selecoes'),

  /** GET /selecoes — listarSelecoesDoCliente. Paginação por cursor. `variacao` já vem como rótulo pronto. */
  historico: (cursor, sinal) => requisitar('GET', '/selecoes', { query: { cursor }, sinal }),
};
