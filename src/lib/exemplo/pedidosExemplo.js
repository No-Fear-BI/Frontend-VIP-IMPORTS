/*
 * Pedidos simulados para `npm run dev:exemplo`: seis pedidos fictícios, nos três status, e as mesmas
 * regras do backend — filtro por status, contagens do banco inteiro, qualquer status vale para qualquer
 * outro, e enviar a mesma seleção duas vezes não duplica o pedido em andamento. Os pedidos que a loja
 * gera ("Consultar valores no WhatsApp") entram aqui também. Fica em memória (some ao recarregar a
 * página), como o atendimento simulado.
 */

import { produtos } from './catalogoExemplo.js';

const STATUS = ['em_andamento', 'finalizado', 'nao_finalizado'];

const minutosAtras = (minutos) => new Date(Date.now() - minutos * 60000).toISOString();

/** Um item de pedido a partir de um produto do catálogo de exemplo (texto, como o backend congela). */
function itemDe(indiceDoProduto, tamanho = null, cor = null) {
  const p = produtos[indiceDoProduto];
  return {
    produtoId: p.id,
    codigo: p.codigo,
    nome: p.nome,
    marca: p.marca.nome,
    categoria: p.categoria.nome,
    colecao: p.colecao.nome,
    imagemUrl: p.imagens[0]?.url ?? null,
    tamanho,
    cor,
  };
}

let pedidos = null;

function pedido(id, status, minutos, cliente, itens, atualizadoMinutos = minutos) {
  return {
    id,
    status,
    criadoEm: minutosAtras(minutos),
    atualizadoEm: minutosAtras(atualizadoMinutos),
    totalItens: itens.length,
    cliente: { id: id, ...cliente },
    itens,
  };
}

function iniciar() {
  pedidos = [
    pedido(1, 'em_andamento', 20, { nome: 'Marina Alves', email: 'marina.alves@exemplo.com', telefone: '41999990001' }, [
      itemDe(0, 'M', 'Preto'),
      itemDe(1),
    ]),
    pedido(2, 'em_andamento', 190, { nome: 'Rafael Souza', email: 'rafael.souza@exemplo.com', telefone: null }, [itemDe(2)]),
    pedido(3, 'finalizado', 1500, { nome: 'Camila Torres', email: 'camila.torres@exemplo.com', telefone: '41999990003' }, [
      itemDe(3),
      itemDe(4, 'P'),
      itemDe(5),
    ], 1200),
    pedido(4, 'nao_finalizado', 2900, { nome: null, email: 'visitante@exemplo.com', telefone: null }, [itemDe(6)], 2700),
    pedido(5, 'finalizado', 5800, { nome: 'Bruno Lima', email: 'bruno.lima@exemplo.com', telefone: '41999990005' }, [
      itemDe(7, 'G'),
      itemDe(8),
    ], 5700),
    pedido(6, 'nao_finalizado', 8700, { nome: 'Helena Prado', email: 'helena.prado@exemplo.com', telefone: '41999990006' }, [itemDe(9)], 8600),
  ];
}

/** O que identifica uma seleção: quais peças, em quais tamanho e cor (a ordem não conta). */
const assinatura = (itens) =>
  itens
    .map((i) => `${i.produtoId ?? 0}|${i.tamanho ?? ''}|${i.cor ?? ''}`)
    .sort()
    .join(',');

/** Chamado por `POST /selecoes` da loja: grava a seleção como pedido em andamento (ou reaproveita o igual). */
export function registrarPedidoExemplo(cliente, itens) {
  if (pedidos === null) iniciar();
  const anterior = pedidos
    .filter((p) => p.status === 'em_andamento' && p.cliente.email === cliente.email)
    .sort((a, b) => b.id - a.id)[0];
  if (anterior && assinatura(anterior.itens) === assinatura(itens)) return anterior;

  const agora = new Date().toISOString();
  const novo = {
    id: Math.max(0, ...pedidos.map((p) => p.id)) + 1,
    status: 'em_andamento',
    criadoEm: agora,
    atualizadoEm: agora,
    totalItens: itens.length,
    cliente: { id: cliente.id ?? null, nome: cliente.nome ?? null, email: cliente.email, telefone: cliente.telefone ?? null },
    itens,
  };
  pedidos.push(novo);
  return novo;
}

const contagens = () => {
  const por = (status) => pedidos.filter((p) => p.status === status).length;
  return { emAndamento: por('em_andamento'), finalizado: por('finalizado'), naoFinalizado: por('nao_finalizado'), total: pedidos.length };
};

/**
 * Responde `caminho` (depois de /admin/pedidos): '' para a lista e '/:id' para mudar o status.
 * `erro(status, codigo, mensagem)` vem do servidor de exemplo, para o erro sair no mesmo formato.
 */
export function responderPedidosExemplo(metodo, caminho, query, corpo, erro) {
  if (pedidos === null) iniciar();

  if (metodo === 'GET' && caminho === '') {
    const status = query.get('status');
    if (status && !STATUS.includes(status)) throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.');
    const porPagina = Math.min(100, Math.max(1, Number(query.get('porPagina')) || 20));
    const pagina = Math.max(1, Number(query.get('pagina')) || 1);
    const filtrados = pedidos
      .filter((p) => !status || p.status === status)
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm) || b.id - a.id);
    return {
      dados: filtrados.slice((pagina - 1) * porPagina, pagina * porPagina),
      paginacao: { total: filtrados.length, porPagina, pagina },
      contagens: contagens(),
    };
  }

  const m = caminho.match(/^\/(\d+)$/);
  if (metodo === 'PATCH' && m) {
    const encontrado = pedidos.find((p) => p.id === Number(m[1]));
    if (!encontrado) throw erro(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado.');
    if (!STATUS.includes(corpo?.status)) throw erro(400, 'DADOS_INVALIDOS', 'Há campos inválidos no envio.');
    if (encontrado.status !== corpo.status) {
      encontrado.status = corpo.status;
      encontrado.atualizadoEm = new Date().toISOString();
    }
    return encontrado;
  }

  throw erro(404, 'ROTA_NAO_ENCONTRADA', `Rota não simulada no modo exemplo: ${metodo} /admin/pedidos${caminho}`);
}

/** `?exemplo=vazio`: nenhum pedido. */
export const pedidosVazios = () => ({
  dados: [],
  paginacao: { total: 0, porPagina: 20, pagina: 1 },
  contagens: { emAndamento: 0, finalizado: 0, naoFinalizado: 0, total: 0 },
});
