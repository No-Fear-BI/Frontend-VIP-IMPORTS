/*
 * Permissões de acesso, vistas pelo painel (backend, seção 05): a fila de pedidos, a decisão e o
 * modo da loja (aberta ou fechada). Não existe GET administrativo da configuração: o modo atual
 * vem de `acessoService.estado`, que é público. A mensagem de bloqueio não é editada no painel:
 * sem mensagem o portão usa o texto padrão.
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
   * PATCH /admin/configuracao/acesso — parcial. `modo`: 'aberto' desliga o portão (todo mundo
   * navega) e 'aprovacao' o liga (a loja nasce assim). Abrir e fechar não muda a situação de
   * ninguém. Devolve `{modo, mensagemBloqueio, atualizadoEm}`.
   * @param {{ modo?: 'aberto'|'aprovacao' }} corpo
   */
  configurar: (corpo) => requisitarAdmin('PATCH', '/admin/configuracao/acesso', { corpo }),
};
