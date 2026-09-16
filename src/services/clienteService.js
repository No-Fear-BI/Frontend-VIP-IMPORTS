/*
 * Sessão do CLIENTE da loja (contrato v1.0, seção 03). Cookie `vip_sessao_cliente`.
 * Não tem nada a ver com o painel: a sessão do admin é outro cookie (`vip_sessao_admin`)
 * e as rotas /admin/* ganham um service próprio.
 */

import { requisitar } from '../lib/apiClient.js';

export const clienteService = {
  /**
   * POST /clientes/identificar — identificarCliente. Responde SEMPRE 200, conta nova ou existente.
   * Não ramifique a tela pelo resultado.
   */
  identificar: (email) => requisitar('POST', '/clientes/identificar', { corpo: { email } }),

  /** GET /clientes/eu — obterClienteAtual. Sem sessão: 401 NAO_IDENTIFICADO (ver ehNaoIdentificado). */
  eu: (sinal) => requisitar('GET', '/clientes/eu', { sinal }),

  /** PATCH /clientes/eu — atualizarClienteAtual */
  atualizarEu: (dados) => requisitar('PATCH', '/clientes/eu', { corpo: dados }),

  /** POST /clientes/sair — encerrarSessaoCliente. Responde 200 {"ok": true}. */
  sair: () => requisitar('POST', '/clientes/sair'),
};
