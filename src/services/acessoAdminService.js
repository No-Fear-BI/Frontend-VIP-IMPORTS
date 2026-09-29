/*
 * Permissões de acesso, vistas pelo painel (backend, seção 05): a fila de pedidos e a decisão.
 * O painel não edita a configuração (mensagem de bloqueio): a loja é sempre fechada e sem
 * mensagem o portão usa o texto padrão.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const acessoAdminService = {
  /** GET /admin/acesso/fila — só pedidos pendentes, do mais antigo ao mais novo. Envelope `{dados, paginacao}`. */
  fila: (filtros, sinal) => requisitarAdmin('GET', '/admin/acesso/fila', { query: filtros, sinal }),

  /**
   * PATCH /admin/acesso/:clienteId — aprova ou recusa (por CLIENTE, não por pedido). `motivo` é
   * opcional e de uso interno.
   * @param {number} clienteId
   * @param {'aprovado'|'recusado'} situacao
   */
  decidir: (clienteId, situacao, motivo) =>
    requisitarAdmin('PATCH', `/admin/acesso/${clienteId}`, {
      corpo: { situacao, ...(motivo ? { motivo } : {}) },
    }),
};
