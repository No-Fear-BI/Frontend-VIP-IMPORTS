import { useCallback, useEffect, useRef, useState } from 'react';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import { cn } from '../../lib/cn.js';
import { atendimentoAdminService } from '../../services/atendimentoAdminService.js';
import './WhatsApp.css';

/*
 * Configurações → WhatsApp (/admin/whatsapp): liga o número da loja à Burnwood, para o agente
 * atender também pelo WhatsApp. O número continua funcionando no app WhatsApp Business.
 *
 * A conexão acontece numa janela do provedor (login no Facebook + QR code no app). Esta tela só
 * abre a janela e repassa a resposta dela ao backend; QUEM CONFERE O NÚMERO É A BURNWOOD. Por isso:
 * - a janela abre no próprio clique (senão o bloqueador de pop-up barra);
 * - só vale mensagem da origem de `connect_url` com o nosso `state`;
 * - janela fechada sem mensagem → concluir mesmo assim (a Burnwood sabe se deu certo);
 * - 409 ao concluir = o número ainda está registrando: até 4 tentativas, 2,5 s entre elas.
 * Conectar exige key `manager`; com `operator` a tela mostra só o estado.
 */

const TENTATIVAS = 4;
const ESPERA_ENTRE_TENTATIVAS_MS = 2500;

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

function situacaoDe(conexao) {
  if (!conexao?.provider) return { rotulo: 'Não conectado', tom: 'neutro' };
  if (conexao.connected) return { rotulo: 'Conectado', tom: 'ok' };
  if (conexao.state === 'partner_removed') return { rotulo: 'Desconectado: conecte de novo', tom: 'alerta' };
  return { rotulo: 'Conexão perdida: reconecte', tom: 'alerta' };
}

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminWhatsApp() {
  const [conexao, setConexao] = useState(null);
  const [podeConectar, setPodeConectar] = useState(false);
  const [erroCarga, setErroCarga] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [erro, setErro] = useState(null);
  const pendente = useRef(null);

  const carregar = useCallback(async () => {
    setErroCarga(null);
    try {
      const [estado, config] = await Promise.all([
        atendimentoAdminService.whatsapp(),
        atendimentoAdminService.configuracao(),
      ]);
      setConexao(estado);
      setPodeConectar(config.podeConectarWhatsapp);
    } catch (falha) {
      setErroCarga(falha);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const concluir = useCallback(async (state, phoneNumberId) => {
    setAviso('Confirmando a conexão com a Burnwood…');
    for (let tentativa = 0; tentativa < TENTATIVAS; tentativa += 1) {
      try {
        setConexao(await atendimentoAdminService.concluirWhatsapp(state, phoneNumberId));
        setAviso('WhatsApp conectado.');
        setErro(null);
        return;
      } catch (falha) {
        const aindaRegistrando = falha.status === 409 && tentativa < TENTATIVAS - 1;
        if (!aindaRegistrando) {
          setAviso(null);
          setErro(falha.mensagem || 'A conexão falhou. Tente de novo.');
          return;
        }
        await esperar(ESPERA_ENTRE_TENTATIVAS_MS);
      }
    }
  }, []);

  // A resposta da janela do provedor. Qualquer outra mensagem é ignorada.
  useEffect(() => {
    function aoReceber(evento) {
      const atual = pendente.current;
      if (!atual || evento.origin !== atual.origem) return;
      const dados = evento.data;
      if (!dados || dados.state !== atual.state) return;
      pendente.current = null;
      setOcupado(false);
      if (dados.type === 'WASAPFLOW_CONNECT_SUCCESS') concluir(atual.state, dados.phone_number_id);
      else if (dados.type === 'WASAPFLOW_CONNECT_CANCEL') setAviso('Conexão cancelada.');
      else if (dados.type === 'WASAPFLOW_CONNECT_ERROR') setErro(dados.message || 'A conexão falhou. Tente de novo.');
    }
    window.addEventListener('message', aoReceber);
    return () => window.removeEventListener('message', aoReceber);
  }, [concluir]);

  // Janela fechada antes de responder: pergunta à Burnwood mesmo assim.
  useEffect(() => {
    if (!ocupado) return undefined;
    const relogio = window.setInterval(() => {
      const atual = pendente.current;
      if (atual?.janela?.closed) {
        pendente.current = null;
        setOcupado(false);
        concluir(atual.state);
      }
    }, 1000);
    return () => window.clearInterval(relogio);
  }, [ocupado, concluir]);

  async function conectar() {
    setErro(null);
    setAviso(null);
    // Abre no clique, vazia, e só depois aponta para a sessão: é o que passa pelo bloqueador.
    const janela = window.open('about:blank', 'burnwood-whatsapp', 'width=620,height=780');
    setOcupado(true);
    try {
      const sessao = await atendimentoAdminService.conectarWhatsapp();
      pendente.current = { state: sessao.state, origem: new URL(sessao.connect_url).origin, janela };
      if (janela) janela.location.href = sessao.connect_url;
      else window.location.href = sessao.connect_url;
    } catch (falha) {
      janela?.close();
      setOcupado(false);
      setErro(falha.mensagem || 'Não foi possível começar a conexão.');
    }
  }

  const situacao = situacaoDe(conexao);

  return (
    <section className="admin__pagina admin-whatsapp">
      <header className="admin-whatsapp__topo">
        <h1 className="t-headline-lg">WhatsApp</h1>
        <p className="t-body-sm t-muted admin-whatsapp__ajuda">
          Ligue o número de WhatsApp da loja ao atendimento: o agente de IA passa a responder também por lá. O
          número continua funcionando no app WhatsApp Business — quando alguém da equipe responde pelo app, o agente
          para de responder aquela conversa até ela ser devolvida a ele.
        </p>
      </header>

      {conexao === null && !erroCarga ? (
        <div className="admin-whatsapp__cartao" aria-busy="true">
          <Esqueleto className="admin-whatsapp__esqueleto" />
          <Esqueleto className="admin-whatsapp__esqueleto admin-whatsapp__esqueleto--curto" />
        </div>
      ) : conexao === null && erroCarga?.codigo === 'ATENDIMENTO_INDISPONIVEL' ? (
        <EstadoVazio
          titulo="O atendimento está desligado."
          texto="A integração com a Burnwood ainda não foi ligada neste ambiente, ou está fora do ar."
          acao={{ rotulo: 'Tentar de novo', onClick: carregar }}
        />
      ) : conexao === null ? (
        <EstadoErro erro={erroCarga} onTentar={carregar} titulo="Não conseguimos carregar a conexão do WhatsApp." />
      ) : (
        <div className="admin-whatsapp__cartao">
          <dl className="admin-whatsapp__dados">
            <div>
              <dt className="t-label-caps t-muted">Situação</dt>
              <dd>
                <span className={cn('admin-whatsapp__situacao t-label-caps-sm', `admin-whatsapp__situacao--${situacao.tom}`)}>
                  {situacao.rotulo}
                </span>
              </dd>
            </div>
            {conexao.phone_number && (
              <div>
                <dt className="t-label-caps t-muted">Número</dt>
                <dd className="t-headline-sm">{conexao.phone_number}</dd>
              </div>
            )}
            {conexao.display_name && (
              <div>
                <dt className="t-label-caps t-muted">Nome no WhatsApp</dt>
                <dd>{conexao.display_name}</dd>
              </div>
            )}
            {conexao.updated_at && (
              <div>
                <dt className="t-label-caps t-muted">Atualizado em</dt>
                <dd>{formatoData.format(new Date(conexao.updated_at))}</dd>
              </div>
            )}
          </dl>

          {podeConectar ? (
            <div className="admin-whatsapp__acoes">
              <Button disabled={ocupado} onClick={conectar}>
                {conexao.provider ? 'Reconectar WhatsApp' : 'Conectar WhatsApp'}
              </Button>
              {ocupado && <p className="t-body-sm t-muted">Termine na janela que abriu…</p>}
            </div>
          ) : (
            <p className="t-body-sm admin-whatsapp__nota">
              Para conectar, a chave da Burnwood precisa ser do tipo <strong>manager</strong>. A chave atual só permite
              ver a situação — peça a troca à Burnwood.
            </p>
          )}

          {aviso && (
            <p className="t-body-sm" role="status">
              {aviso}
            </p>
          )}
          {erro && (
            <p className="t-body-sm admin-whatsapp__erro" role="alert">
              {erro}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
