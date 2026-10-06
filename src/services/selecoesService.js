/*
 * Seleções enviadas pelo WhatsApp (contrato v1.0, seção 03). Exige sessão de cliente.
 * O link do WhatsApp vem PRONTO do backend: nunca monte `wa.me` nem guarde o número da loja aqui.
 */

import { requisitar } from '../lib/apiClient.js';

export const selecoesService = {
  /**
   * POST /selecoes — criarSelecao. Corpo vazio: a seleção é o carrinho atual.
   * Responde 200 com `linkWhatsapp`. Não salva histórico. NÃO esvazia o carrinho. Carrinho vazio: 400 CARRINHO_VAZIO.
   */
  enviar: () => requisitar('POST', '/selecoes'),

};
