/*
 * Permissões de acesso, vistas pelo painel (backend, seção 05). Não existe GET administrativo da
 * configuração: modo e mensagem atuais vêm de `acessoService.estado`, que é público.
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

  /**
   * PATCH /admin/configuracao/acesso — parcial. `mensagemBloqueio`:
   * texto, ou null para apagar.
   */
  configurar: (corpo) => requisitarAdmin('PATCH', '/admin/configuracao/acesso', { corpo }),
};
