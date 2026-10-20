/*
 * Pedidos feitos pelos clientes ("Encomendar"), vistos pelo painel. Cada pedido traz uma cópia
 * dos dados do cliente no momento do envio e se o pagamento já foi confirmado pela equipe.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const pedidosAdminService = {
  /**
   * GET /admin/pedidos. Envelope `{dados, paginacao: {total, porPagina, pagina}}`. `busca` casa
   * parte do nome ou do e-mail; `situacao` é `pago` ou `pendente` (omitido = todos).
   * @param {{ busca?: string, situacao?: 'pago'|'pendente', pagina?: number, porPagina?: number }} filtros
   */
  listar: (filtros, sinal) => requisitarAdmin('GET', '/admin/pedidos', { query: filtros, sinal }),

  /** PATCH /admin/pedidos/:id `{pago}` — confirma o pagamento ou volta o pedido para pendente. */
  definirPagamento: (id, pago) => requisitarAdmin('PATCH', `/admin/pedidos/${id}`, { corpo: { pago } }),
};
