/*
 * Painel de conversas do atendimento Burnwood (Backend: docs/para-o-frontend.md, "Atendimento
 * Burnwood"). O backend repassa à Burnwood com a key e o nome de quem está logado.
 *
 * Diferente do resto do painel, o SUCESSO vem no formato da Burnwood (snake_case:
 * `available_actions`, `last_message`, `author_type`…). Erro vem no envelope de sempre (`ErroApi`).
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

const BASE = '/admin/atendimento';

/** Rótulo, ação da Burnwood (`available_actions`) e caminho da rota, na ordem dos botões. */
export const ACOES_CONVERSA = [
  { acao: 'takeover', rotulo: 'Assumir', caminho: 'takeover' },
  { acao: 'pause', rotulo: 'Pausar agente', caminho: 'pause' },
  { acao: 'resume', rotulo: 'Retomar agente', caminho: 'resume' },
  { acao: 'return_to_bot', rotulo: 'Devolver ao agente', caminho: 'return-to-bot' },
  { acao: 'resolve', rotulo: 'Resolver', caminho: 'resolve' },
  { acao: 'close', rotulo: 'Encerrar', caminho: 'close' },
];

export const atendimentoAdminService = {
  /** GET conversations — `{ items, next_cursor }`, mais recentes primeiro. */
  conversas: (sinal) => requisitarAdmin('GET', `${BASE}/conversations`, { query: { limit: 50 }, sinal }),

  /** GET conversations/:id — estado e `available_actions` de agora. */
  conversa: (id, sinal) => requisitarAdmin('GET', `${BASE}/conversations/${id}`, { sinal }),

  /**
   * GET conversations/:id/messages — `{ items, has_more }`, mais antigas primeiro. Com `depoisDe`,
   * só as que vieram depois daquela mensagem (é assim que a conversa aberta se atualiza).
   */
  mensagens: (id, depoisDe, sinal) =>
    requisitarAdmin('GET', `${BASE}/conversations/${id}/messages`, {
      query: depoisDe ? { after: depoisDe } : undefined,
      sinal,
    }),

  /** POST conversations/:id/<caminho de ACOES_CONVERSA>. */
  agir: (id, caminho) => requisitarAdmin('POST', `${BASE}/conversations/${id}/${caminho}`, { corpo: {} }),

  /** POST conversations/:id/reply — só quem assumiu a conversa pode responder. */
  responder: (id, texto) =>
    requisitarAdmin('POST', `${BASE}/conversations/${id}/reply`, { corpo: { body: texto } }),

  /**
   * GET configuracao — `{ podeConectarWhatsapp, portalPagamentosUrl }`. `podeConectarWhatsapp` falso =
   * key `operator`, a tela só mostra o estado. O portal é onde se conecta a conta do Mercado Pago.
   */
  configuracao: (sinal) => requisitarAdmin('GET', `${BASE}/configuracao`, { sinal }),

  /**
   * GET whatsapp — `{ connected, provider, phone_number, display_name, state, updated_at }`.
   * `state`: connected, offboarded (reconectar), partner_removed (conectar de novo).
   */
  whatsapp: (sinal) => requisitarAdmin('GET', `${BASE}/whatsapp`, { sinal }),

  /** POST whatsapp/connect — `{ connect_url, state, expires_in }`: abrir `connect_url` na janela. */
  conectarWhatsapp: () => requisitarAdmin('POST', `${BASE}/whatsapp/connect`, { corpo: {} }),

  /** POST whatsapp/disconnect — desliga o número da Burnwood (o agente para; as conversas ficam). */
  desconectarWhatsapp: () => requisitarAdmin('POST', `${BASE}/whatsapp/disconnect`, { corpo: {} }),

  /**
   * POST whatsapp/readiness/start|missed — verificação de entrada. `start` gera a frase (BW-…) que
   * alguém manda de OUTRO celular; `missed` avisa que ela não chegou. Devolve o mesmo que `whatsapp`.
   */
  iniciarVerificacaoWhatsapp: () => requisitarAdmin('POST', `${BASE}/whatsapp/readiness/start`, { corpo: {} }),
  verificacaoNaoChegou: () => requisitarAdmin('POST', `${BASE}/whatsapp/readiness/missed`, { corpo: {} }),

  /** GET payments/mercadopago — `{ enabled, connected, mode, payments_enabled, operational? }`. */
  mercadoPago: (sinal) => requisitarAdmin('GET', `${BASE}/payments/mercadopago`, { sinal }),

  /** GET payments/mercadopago/requests — pedidos aprovados `[{ id, amount, currency, purpose, status }]`. */
  pedidosMercadoPago: (sinal) => requisitarAdmin('GET', `${BASE}/payments/mercadopago/requests`, { sinal }),

  /** POST payments/mercadopago/requests — aprova um valor (`amount` "10.00") e a finalidade. */
  aprovarPedidoMercadoPago: (valor, finalidade) =>
    requisitarAdmin('POST', `${BASE}/payments/mercadopago/requests`, { corpo: { amount: valor, purpose: finalidade } }),

  /** GET payments/mercadopago/checkouts — `[{ id, description, amount, status, provider_status, checkout_url, live }]`. */
  checkoutsMercadoPago: (sinal) => requisitarAdmin('GET', `${BASE}/payments/mercadopago/checkouts`, { sinal }),

  /** POST payments/mercadopago/checkouts — cria o link de pagamento de um pedido aprovado. */
  criarCheckoutMercadoPago: (descricao, valor) =>
    requisitarAdmin('POST', `${BASE}/payments/mercadopago/checkouts`, { corpo: { description: descricao, amount: valor } }),

  /** POST whatsapp/connect/complete — 409 = o número ainda está registrando (tentar de novo). */
  concluirWhatsapp: (state, phoneNumberId) =>
    requisitarAdmin('POST', `${BASE}/whatsapp/connect/complete`, {
      corpo: { state, ...(phoneNumberId ? { phone_number_id: phoneNumberId } : {}) },
    }),
};
