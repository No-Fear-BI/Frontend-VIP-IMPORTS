/*
 * Pedidos no painel (Backend: docs/para-o-frontend.md, "Pedidos no painel"). Pedido = a seleção que o
 * cliente enviou pelo WhatsApp ("Consultar valores"): o backend grava as peças e os dados do cliente
 * no momento do envio, e a equipe marca se o pedido foi finalizado. Nenhuma rota pública devolve isto.
 */

import { requisitarAdmin } from '../lib/apiAdmin.js';

/** Os três status de um pedido, na ordem dos filtros da tela. */
export const STATUS_PEDIDO = ['em_andamento', 'finalizado', 'nao_finalizado'];

export const pedidosAdminService = {
  /**
   * GET /admin/pedidos — do mais novo para o mais antigo. Envelope `{dados, paginacao: {total,
   * porPagina, pagina}, contagens: {emAndamento, finalizado, naoFinalizado, total}}`; `contagens` é do
   * banco inteiro, e `status` só filtra `dados` e `paginacao.total`. Cada pedido traz `cliente`
   * {id, nome, email, telefone} e `itens` [{produtoId, codigo, nome, marca, categoria, colecao,
   * imagemUrl, tamanho, cor}] — texto congelado do envio, `produtoId`/`cliente.id` nulos se o
   * produto/cadastro foi apagado depois.
   * @param {{ status?: string, pagina?: number, porPagina?: number }} filtros
   */
  listar: (filtros, sinal) => requisitarAdmin('GET', '/admin/pedidos', { query: filtros, sinal }),

  /** PATCH /admin/pedidos/:id — só o status muda; qualquer um vale para qualquer outro. Devolve o pedido. */
  atualizarStatus: (id, status) => requisitarAdmin('PATCH', `/admin/pedidos/${id}`, { corpo: { status } }),
};
