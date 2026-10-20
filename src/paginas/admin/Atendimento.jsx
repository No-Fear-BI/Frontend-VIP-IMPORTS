import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import { cn } from '../../lib/cn.js';
import { ACOES_CONVERSA, atendimentoAdminService } from '../../services/atendimentoAdminService.js';
import './Atendimento.css';

/*
 * Painel de conversas do atendimento Burnwood (/admin/atendimento). O agente de IA responde no chat
 * da loja; aqui a equipe acompanha, assume, responde e devolve ao agente.
 *
 * Os botões de cada conversa são EXATAMENTE os de `available_actions`: quem decide o que vale em
 * cada estado é a Burnwood, não esta tela. Dados no formato da Burnwood (snake_case).
 *
 * Atualização por consulta, no ritmo que a Burnwood recomenda: lista a cada 5 s, conversa aberta
 * a cada 2 s (só as mensagens novas), e nada com a aba escondida.
 */

const LISTA_A_CADA_MS = 5000;
const CONVERSA_A_CADA_MS = 2000;

const ROTULO_ESTADO = {
  bot_active: 'Agente IA',
  waiting_human: 'Aguardando atendente',
  human_active: 'Com atendente',
  paused: 'Agente pausado',
  resolved: 'Resolvida',
  closed: 'Encerrada',
};

const ROTULO_EVENTO = {
  taken_over: 'assumiu a conversa',
  returned_to_bot: 'devolveu ao agente',
  paused: 'pausou o agente',
  resumed: 'retomou o agente',
  escalated: 'O agente pediu um atendente',
  unassigned: 'liberou a conversa',
  resolved: 'resolveu a conversa',
  closed: 'encerrou a conversa',
};

/** Opções do filtro de status, na ordem do seletor: quem precisa de gente vem primeiro. */
const FILTROS_ESTADO = ['waiting_human', 'human_active', 'bot_active', 'paused', 'resolved', 'closed'];

const formatoHora = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function hora(iso) {
  return iso ? formatoHora.format(new Date(iso)) : '';
}

const ehDesligado = (erro) => erro?.codigo === 'ATENDIMENTO_INDISPONIVEL';

/** Repete `tarefa` a cada `ms` enquanto a aba estiver visível. */
function useConsultaPeriodica(tarefa, ms) {
  const atual = useRef(tarefa);
  atual.current = tarefa;
  useEffect(() => {
    const relogio = window.setInterval(() => {
      if (document.visibilityState === 'visible') atual.current();
    }, ms);
    return () => window.clearInterval(relogio);
  }, [ms]);
}

export default function AdminAtendimento() {
  const [params, setParams] = useSearchParams();
  const estadoNaUrl = params.get('estado');
  const estado = FILTROS_ESTADO.includes(estadoNaUrl) ? estadoNaUrl : '';

  // A resposta guarda o filtro com que foi pedida: uma consulta lenta do filtro anterior nunca
  // sobrescreve a lista do filtro atual, que fica no esqueleto até a sua chegar.
  const [resposta, setResposta] = useState(null);
  const [erro, setErro] = useState(null);
  // A conversa aberta, e não só o id: ela continua aberta mesmo se a ação (ex.: Assumir) a tirar do filtro.
  const [selecionada, setSelecionada] = useState(null);
  const conversas = resposta?.estado === estado ? resposta.itens : null;

  const carregarLista = useCallback(async () => {
    try {
      const pagina = await atendimentoAdminService.conversas({ estado });
      setResposta({ estado, itens: pagina.items });
      setErro(null);
    } catch (falha) {
      setErro(falha);
    }
  }, [estado]);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);
  useConsultaPeriodica(carregarLista, LISTA_A_CADA_MS);

  const tentarDeNovo = () => {
    setResposta(null);
    setErro(null);
    carregarLista();
  };

  function mudarEstado(novo) {
    const proximo = new URLSearchParams(params);
    if (novo) proximo.set('estado', novo);
    else proximo.delete('estado');
    setErro(null);
    setParams(proximo);
  }

  // Sem conversa nenhuma (e sem filtro) não há o que filtrar; fora isso o filtro fica visível, inclusive
  // enquanto a lista do novo status carrega e quando ele não tem nenhuma conversa.
  const mostrarFiltro =
    !ehDesligado(erro) && !(conversas?.length === 0 && estado === '') && (resposta !== null || estado !== '');

  return (
    <section className="admin__pagina admin-atendimento">
      <header className="admin-atendimento__topo">
        <h1 className="t-headline-lg">Atendimento</h1>
        <p className="t-body-sm t-muted admin-atendimento__ajuda">
          Conversas do chat da loja. O agente de IA responde sozinho; assuma quando quiser falar com o cliente.
        </p>
      </header>

      {mostrarFiltro && (
        <FiltroEstado atual={estado} aberta={Boolean(selecionada)} onMudar={mudarEstado} />
      )}

      {conversas === null && !erro ? (
        <EsqueletoAtendimento />
      ) : conversas === null && ehDesligado(erro) ? (
        <EstadoVazio
          titulo="O atendimento está desligado."
          texto="O chat da loja ainda não foi ligado ou a Burnwood está fora do ar. Quando voltar, as conversas aparecem aqui."
          acao={{ rotulo: 'Tentar de novo', onClick: tentarDeNovo }}
        />
      ) : conversas === null ? (
        <EstadoErro erro={erro} onTentar={tentarDeNovo} titulo="Não conseguimos carregar as conversas." />
      ) : conversas.length === 0 && estado && !selecionada ? (
        <EstadoVazio
          titulo="Nenhuma conversa com este status."
          texto={`Não há conversas em “${ROTULO_ESTADO[estado]}” agora. A lista se atualiza sozinha.`}
          acao={{ rotulo: 'Ver todas as conversas', onClick: () => mudarEstado('') }}
        />
      ) : conversas.length === 0 && !selecionada ? (
        <EstadoVazio
          titulo="Nenhuma conversa ainda."
          texto="Quando um cliente escrever no chat da loja, a conversa aparece aqui."
        />
      ) : (
        <div className={cn('admin-atendimento__colunas', selecionada && 'admin-atendimento__colunas--aberta')}>
          <aside className="admin-atendimento__lista" aria-label="Conversas">
            <p className="t-label-caps t-muted admin-atendimento__contagem">
              {conversas.length} {conversas.length === 1 ? 'conversa' : 'conversas'}
            </p>
            {erro && <p className="t-body-sm admin-atendimento__aviso">Sem atualização agora: {erro.mensagem}</p>}
            {conversas.length === 0 && (
              <p className="t-body-sm t-muted admin-atendimento__contagem">
                Nenhuma conversa{estado ? ' neste status' : ''} agora.
              </p>
            )}
            <ul>
              {conversas.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={cn('admin-atendimento__linha', c.id === selecionada?.id && 'admin-atendimento__linha--atual')}
                    aria-current={c.id === selecionada?.id ? 'true' : undefined}
                    onClick={() => setSelecionada(c)}
                  >
                    <span className="admin-atendimento__linha-topo">
                      <strong>{c.contact?.display_name || 'Visitante'}</strong>
                      <Estado estado={c.state} />
                    </span>
                    <span className="t-body-sm t-muted admin-atendimento__previa">{c.last_message?.body || '—'}</span>
                    <span className="t-label-caps-sm t-muted">
                      {c.channel?.name} · {hora(c.last_message_at || c.created_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <div className="admin-atendimento__conversa">
            {selecionada ? (
              <Conversa
                key={selecionada.id}
                inicial={selecionada}
                aoMudar={carregarLista}
                aoVoltar={() => setSelecionada(null)}
              />
            ) : (
              <p className="t-body-sm t-muted admin-atendimento__escolha">Escolha uma conversa na lista.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/** Filtro de status da lista. No celular some enquanto uma conversa está aberta (a lista também). */
function FiltroEstado({ atual, aberta, onMudar }) {
  return (
    <div className={cn('campo admin-atendimento__filtro', aberta && 'admin-atendimento__filtro--aberta')}>
      <label htmlFor="atendimento-filtro-estado" className="t-label-caps">
        Status
      </label>
      <select
        id="atendimento-filtro-estado"
        className="campo__input"
        value={atual}
        onChange={(e) => onMudar(e.target.value)}
      >
        <option value="">Todas</option>
        {FILTROS_ESTADO.map((estado) => (
          <option key={estado} value={estado}>
            {ROTULO_ESTADO[estado]}
          </option>
        ))}
      </select>
    </div>
  );
}

function Estado({ estado }) {
  return (
    <span className={cn('admin-atendimento__estado t-label-caps-sm', `admin-atendimento__estado--${estado}`)}>
      {ROTULO_ESTADO[estado] || estado}
    </span>
  );
}

function Conversa({ inicial, aoMudar, aoVoltar }) {
  const [conversa, setConversa] = useState(inicial);
  const [mensagens, setMensagens] = useState(null);
  const [erro, setErro] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [rascunho, setRascunho] = useState('');
  const ultimas = useRef([]);
  const fim = useRef(null);

  const atualizar = useCallback(async () => {
    try {
      const ultimaId = ultimas.current.at(-1)?.id;
      const [fresca, pagina] = await Promise.all([
        atendimentoAdminService.conversa(inicial.id),
        atendimentoAdminService.mensagens(inicial.id, ultimaId),
      ]);
      setConversa(fresca);
      const conhecidas = new Set(ultimas.current.map((m) => m.id));
      const novas = pagina.items.filter((m) => !conhecidas.has(m.id));
      if (novas.length || !ultimaId) {
        ultimas.current = [...ultimas.current, ...novas];
        setMensagens(ultimas.current);
      }
      setErro(null);
    } catch (falha) {
      setErro(falha);
    }
  }, [inicial.id]);

  useEffect(() => {
    atualizar();
  }, [atualizar]);
  useConsultaPeriodica(atualizar, CONVERSA_A_CADA_MS);

  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'nearest' });
  }, [mensagens?.length]);

  async function agir(executar) {
    setOcupado(true);
    try {
      await executar();
      await Promise.all([atualizar(), aoMudar()]);
      return true;
    } catch (falha) {
      setErro(falha);
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function responder(evento) {
    evento.preventDefault();
    const texto = rascunho.trim();
    if (!texto) return;
    if (await agir(() => atendimentoAdminService.responder(conversa.id, texto))) setRascunho('');
  }

  const pode = new Set(conversa.available_actions || []);

  return (
    <article className="admin-atendimento__fio">
      <header className="admin-atendimento__fio-topo">
        <Button variante="texto" className="admin-atendimento__voltar" onClick={aoVoltar}>
          <span>← Conversas</span>
        </Button>
        <div>
          <h2 className="t-headline-sm">{conversa.contact?.display_name || 'Visitante'}</h2>
          <p className="t-body-sm t-muted">
            {conversa.channel?.name} · {ROTULO_ESTADO[conversa.state] || conversa.state}
            {conversa.assignee ? ` · ${conversa.assignee.display_name}` : ''}
          </p>
        </div>
        <div className="admin-atendimento__acoes">
          {ACOES_CONVERSA.filter((a) => pode.has(a.acao)).map((a) => (
            <Button
              key={a.acao}
              variante={a.acao === 'takeover' ? 'primaria' : 'secundaria'}
              disabled={ocupado}
              onClick={() => agir(() => atendimentoAdminService.agir(conversa.id, a.caminho))}
            >
              {a.rotulo}
            </Button>
          ))}
        </div>
      </header>

      {mensagens === null && !erro ? (
        <div className="admin-atendimento__mensagens">
          <Esqueleto className="admin-atendimento__esqueleto-balao" />
          <Esqueleto className="admin-atendimento__esqueleto-balao admin-atendimento__esqueleto-balao--direita" />
        </div>
      ) : mensagens === null ? (
        <EstadoErro erro={erro} onTentar={atualizar} titulo="Não conseguimos carregar a conversa." />
      ) : (
        <ol className="admin-atendimento__mensagens" aria-live="polite">
          {mensagens.length === 0 && <li className="t-body-sm t-muted">Nenhuma mensagem ainda.</li>}
          {mensagens.map((m) =>
            m.author_type === 'system' ? (
              <li key={m.id} className="admin-atendimento__evento t-label-caps-sm t-muted">
                {m.author_name ? `${m.author_name} ` : ''}
                {ROTULO_EVENTO[m.event] || m.event} · {hora(m.created_at)}
              </li>
            ) : (
              <li key={m.id} className={cn('admin-atendimento__balao', `admin-atendimento__balao--${m.author_type}`)}>
                <span className="t-label-caps-sm admin-atendimento__autor">
                  {m.author_type === 'contact' ? 'Cliente' : m.author_type === 'bot' ? 'Agente IA' : m.author_name || 'Equipe'}
                  {' · '}
                  {hora(m.created_at)}
                </span>
                <span className="admin-atendimento__texto">{m.body}</span>
                {m.delivery?.status === 'failed' && (
                  <span className="t-body-sm admin-atendimento__falha">Não foi entregue: {m.delivery.detail}</span>
                )}
              </li>
            ),
          )}
          <li ref={fim} aria-hidden="true" />
        </ol>
      )}

      {erro && mensagens !== null && (
        <p className="t-body-sm admin-atendimento__aviso" role="alert">
          {erro.mensagem}
        </p>
      )}

      {pode.has('reply') ? (
        <form className="admin-atendimento__resposta" onSubmit={responder}>
          <label className="t-label-caps" htmlFor="atendimento-resposta">
            Resposta
          </label>
          <textarea
            id="atendimento-resposta"
            className="campo__input admin-atendimento__campo"
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            placeholder="Escreva para o cliente…"
            rows={3}
          />
          <Button type="submit" disabled={ocupado || !rascunho.trim()}>
            Enviar
          </Button>
        </form>
      ) : (
        <p className="t-body-sm t-muted admin-atendimento__dica">
          {pode.has('takeover') ? 'Assuma a conversa para responder.' : 'Esta conversa não aceita resposta agora.'}
        </p>
      )}
    </article>
  );
}

function EsqueletoAtendimento() {
  return (
    <div className="admin-atendimento__colunas" aria-busy="true">
      <div className="admin-atendimento__lista">
        {[0, 1, 2, 3].map((i) => (
          <Esqueleto key={i} className="admin-atendimento__esqueleto-linha" />
        ))}
      </div>
      <div className="admin-atendimento__conversa">
        <Esqueleto className="admin-atendimento__esqueleto-balao" />
      </div>
    </div>
  );
}
