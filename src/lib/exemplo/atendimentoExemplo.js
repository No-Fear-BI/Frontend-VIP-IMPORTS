/*
 * Atendimento Burnwood simulado para `npm run dev:exemplo`: três conversas fictícias e as mesmas
 * transições que a Burnwood aplica, só para avaliar a tela /admin/atendimento sem key. Fica em
 * memória (some ao recarregar a página). O chat da loja não aparece no modo exemplo.
 */

const ACOES_POR_ESTADO = {
  bot_active: ['takeover', 'pause', 'resolve', 'close'],
  waiting_human: ['takeover', 'resolve', 'close'],
  human_active: ['reply', 'return_to_bot', 'resolve', 'close'],
  paused: ['takeover', 'resume', 'resolve', 'close'],
  resolved: [],
  closed: [],
};

const DEPOIS_DA_ACAO = {
  takeover: ['human_active', 'taken_over'],
  pause: ['paused', 'paused'],
  resume: ['bot_active', 'resumed'],
  'return-to-bot': ['bot_active', 'returned_to_bot'],
  resolve: ['resolved', 'resolved'],
  close: ['closed', 'closed'],
};

const CANAL = { id: 'canal-site', kind: 'website', name: 'Site' };
let sequencia = 0;

function minutosAtras(minutos) {
  return new Date(Date.now() - minutos * 60000).toISOString();
}

function mensagem(autor, texto, minutos, extra = {}) {
  sequencia += 1;
  return {
    id: `msg-${String(sequencia).padStart(4, '0')}`,
    author_type: autor,
    direction: autor === 'contact' ? 'inbound' : 'outbound',
    body: texto,
    event: null,
    author_name: autor === 'bot' ? 'Agente IA' : null,
    created_at: minutosAtras(minutos),
    delivery: null,
    ...extra,
  };
}

function conversa(id, nome, estado, mensagens) {
  return { id, nome, estado, mensagens, criadaEm: mensagens[0].created_at, responsavel: null };
}

let conversas = null;
const SEM_VERIFICACAO = { provider_linked: false, status: 'not_linked', challenge: null, last_inbound_at: null, validated_at: null, failure_reason: null };
let whatsapp = { connected: false, provider: null, phone_number: null, display_name: null, state: null, updated_at: null, readiness: SEM_VERIFICACAO };
let tentativasDeConclusao = 0;
let consultasEsperandoFrase = 0;

// Mercado Pago em modo teste: conta "conectada" e um pagamento que vira `paid` depois de 3 consultas.
const mercadoPago = { enabled: true, connected: true, mode: 'test', payments_enabled: true };
const pedidos = [];
const checkouts = [];

function iniciar() {
  conversas = [
    conversa('00000000-0000-4000-8000-000000000001', 'Marina', 'waiting_human', [
      mensagem('contact', 'Oi! A bolsa CHN-0042 ainda tem disponível?', 18),
      mensagem('bot', 'Oi, Marina! Vou chamar alguém da equipe para confirmar a disponibilidade.', 17),
      { ...mensagem('system', null, 17), event: 'escalated' },
    ]),
    conversa('00000000-0000-4000-8000-000000000002', 'Rafael', 'bot_active', [
      mensagem('contact', 'Vocês entregam em Curitiba?', 9),
      mensagem('bot', 'Entregamos sim! O valor do frete é confirmado pelo atendimento no WhatsApp.', 9),
    ]),
    conversa('00000000-0000-4000-8000-000000000003', 'Visitante', 'resolved', [
      mensagem('contact', 'Qual o horário de atendimento?', 240),
      mensagem('bot', 'Seg a sex, 10h às 19h, e sábado, 10h às 14h.', 240),
      { ...mensagem('system', null, 238), event: 'resolved', author_name: 'Agente IA' },
    ]),
  ];
}

function paraApi(c) {
  const ultima = [...c.mensagens].reverse().find((m) => m.author_type !== 'system');
  return {
    id: c.id,
    state: c.estado,
    channel: CANAL,
    contact: { id: `contato-${c.id.slice(-1)}`, display_name: c.nome === 'Visitante' ? null : c.nome },
    assignee: c.responsavel ? { user_id: 'exemplo', display_name: c.responsavel } : null,
    available_actions: ACOES_POR_ESTADO[c.estado],
    last_message: ultima ? { author_type: ultima.author_type, body: ultima.body } : null,
    last_message_at: ultima?.created_at ?? null,
    created_at: c.criadaEm,
    ended_at: ['resolved', 'closed'].includes(c.estado) ? c.mensagens.at(-1).created_at : null,
  };
}

/**
 * Responde `caminho` (depois de /admin/atendimento). `erro(status, codigo, mensagem)` vem do
 * servidor de exemplo, para o erro sair no mesmo formato do resto.
 */
export function responderAtendimentoExemplo(metodo, caminho, query, corpo, admin, erro) {
  if (conversas === null) iniciar();
  let m;

  // Configurações → WhatsApp. A "janela do provedor" é public/exemplo/whatsapp-conectar.html.
  if (metodo === 'GET' && caminho === '/configuracao') {
    return { podeConectarWhatsapp: true, portalPagamentosUrl: 'https://dev.burnwood.com.br/t/exemplo/payments' };
  }
  if (metodo === 'GET' && caminho === '/whatsapp') {
    // A "frase" chega na 3ª consulta, como se alguém a tivesse mandado de outro celular.
    if (whatsapp.readiness.status === 'awaiting_inbound' && ++consultasEsperandoFrase >= 3) {
      const agora = new Date().toISOString();
      whatsapp = { ...whatsapp, readiness: { ...whatsapp.readiness, status: 'operational', challenge: null, last_inbound_at: agora, validated_at: agora } };
    }
    return whatsapp;
  }
  if (metodo === 'POST' && caminho === '/whatsapp/readiness/start') {
    consultasEsperandoFrase = 0;
    whatsapp = { ...whatsapp, readiness: { ...whatsapp.readiness, status: 'awaiting_inbound', challenge: `BW-${Math.random().toString(36).slice(2, 8).toUpperCase()}` } };
    return whatsapp;
  }
  if (metodo === 'POST' && caminho === '/whatsapp/readiness/missed') {
    whatsapp = { ...whatsapp, readiness: { ...whatsapp.readiness, status: 'validation_failed', challenge: null, failure_reason: 'A frase não chegou à Burnwood.' } };
    return whatsapp;
  }
  if (metodo === 'POST' && caminho === '/whatsapp/disconnect') {
    whatsapp = { ...whatsapp, connected: false, state: 'offboarded', updated_at: new Date().toISOString() };
    return whatsapp;
  }
  if (metodo === 'GET' && caminho === '/payments/mercadopago') return mercadoPago;
  if (metodo === 'GET' && caminho === '/payments/mercadopago/requests') return pedidos;
  if (metodo === 'GET' && caminho === '/payments/mercadopago/checkouts') {
    for (const c of checkouts) {
      if (c.status !== 'paid' && ++c.consultas >= 3) Object.assign(c, { status: 'paid', provider_status: 'approved' });
    }
    return checkouts.map(({ consultas, ...c }) => c);
  }
  if (metodo === 'POST' && caminho === '/payments/mercadopago/requests') {
    const pedido = { id: `req-${pedidos.length + 1}`, amount: corpo.amount, currency: 'BRL', purpose: corpo.purpose, status: 'approved' };
    pedidos.unshift(pedido);
    return pedido;
  }
  if (metodo === 'POST' && caminho === '/payments/mercadopago/checkouts') {
    const pedido = pedidos.find((p) => p.status === 'approved' && p.amount === corpo.amount);
    if (pedido) pedido.status = 'used';
    const checkout = { id: `chk-${checkouts.length + 1}`, description: corpo.description, amount: corpo.amount, status: 'created', provider_status: 'pending', checkout_url: 'https://www.mercadopago.com.br/checkout/exemplo', live: false, consultas: 0 };
    checkouts.unshift(checkout);
    return checkout;
  }
  if (metodo === 'POST' && caminho === '/whatsapp/connect') {
    const state = `exemplo-${Date.now()}`;
    tentativasDeConclusao = 0;
    return { connect_url: `${window.location.origin}/exemplo/whatsapp-conectar.html?state=${state}`, state, expires_in: 600 };
  }
  if (metodo === 'POST' && caminho === '/whatsapp/connect/complete') {
    // Como na Burnwood: o primeiro pedido ainda está "registrando" (409), o segundo conclui.
    tentativasDeConclusao += 1;
    if (tentativasDeConclusao === 1) throw erro(409, 'WHATSAPP_REGISTERING', 'O número ainda está sendo registrado.');
    whatsapp = {
      connected: true,
      provider: 'exemplo',
      phone_number: '+55 41 99999-0000',
      display_name: 'VIP Imports (exemplo)',
      state: 'connected',
      updated_at: new Date().toISOString(),
      readiness: { ...SEM_VERIFICACAO, provider_linked: true, status: 'not_verified' },
    };
    return whatsapp;
  }

  if (metodo === 'GET' && caminho === '/conversations') {
    const estados = query.getAll('state');
    const lista = estados.length ? conversas.filter((c) => estados.includes(c.estado)) : conversas;
    return { items: lista.map(paraApi), next_cursor: null };
  }

  if ((m = caminho.match(/^\/conversations\/([0-9a-f-]{36})(\/.*)?$/))) {
    const c = conversas.find((x) => x.id === m[1]);
    if (!c) throw erro(404, 'CONVERSATION_NOT_FOUND', 'Conversa não encontrada.');
    const resto = m[2] || '';

    if (metodo === 'GET' && resto === '') return paraApi(c);
    if (metodo === 'GET' && resto === '/messages') {
      const depoisDe = query.get('after');
      const indice = depoisDe ? c.mensagens.findIndex((x) => x.id === depoisDe) : -1;
      return { items: c.mensagens.slice(indice + 1), has_more: false };
    }

    const acao = resto.slice(1);
    if (metodo === 'POST' && acao === 'reply') {
      if (c.estado !== 'human_active') {
        throw erro(409, 'NOT_CONVERSATION_OWNER', 'Só quem assumiu a conversa pode responder.');
      }
      c.mensagens.push(mensagem('operator', corpo?.body ?? '', 0, { author_name: admin.nome }));
      return c.mensagens.at(-1);
    }
    if (metodo === 'POST' && DEPOIS_DA_ACAO[acao]) {
      const nomeDaAcao = acao === 'return-to-bot' ? 'return_to_bot' : acao;
      if (!ACOES_POR_ESTADO[c.estado].includes(nomeDaAcao)) {
        throw erro(409, 'INVALID_TRANSITION', 'Esta ação não vale mais para a conversa. Atualize a tela.');
      }
      const [novoEstado, evento] = DEPOIS_DA_ACAO[acao];
      c.estado = novoEstado;
      c.responsavel = novoEstado === 'human_active' ? admin.nome : null;
      c.mensagens.push({ ...mensagem('system', null, 0), event: evento, author_name: admin.nome });
      return { ok: true };
    }
  }

  throw erro(404, 'ATENDIMENTO_ROTA_NAO_PERMITIDA', 'Esta ação do atendimento não está disponível no painel.');
}
