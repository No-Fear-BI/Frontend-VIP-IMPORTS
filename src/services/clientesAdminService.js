/*
 * Clientes cadastrados, vistos pelo painel (docs/para-o-frontend.md, "Painel administrativo —
 * destaques e consultas"). Tela só de consulta: sem edição nem exclusão.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

export const clientesAdminService = {
  /**
   * GET /admin/clientes — listarClientesAdmin. Envelope `{dados, paginacao: {total, porPagina,
   * pagina}}`. `busca` casa parte do nome ou do e-mail, ignorando caixa. Cada cliente traz
   * `totalSelecoes` (quem vale a pena atender), `ultimoAcessoEm` e o telefone — aqui ele aparece
   * porque é o painel, e é com ele que o atendimento responde.
   * @param {{ busca?: string, pagina?: number, porPagina?: number }} filtros
   */
  listar: (filtros, sinal) => requisitarAdmin('GET', '/admin/clientes', { query: filtros, sinal }),
};
