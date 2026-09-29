import { useState } from 'react';
import { useAcesso } from '../contexto/AcessoLoja.jsx';
import { useSessaoCliente } from '../contexto/SessaoCliente.jsx';
import { ErroApi } from '../lib/apiClient.js';
import { acessoService } from '../services/acessoService.js';
import { Esqueleto } from './Estados.jsx';
import FormIdentificacao from './FormIdentificacao.jsx';
import { IconeSeta } from './Icones.jsx';
import Logo from './Logo.jsx';
import PortaoArte from './PortaoArte.jsx';
import Button from './ui/Button.jsx';
import Field, { ErroGeral } from './ui/Field.jsx';
import './PortaoAcesso.css';

/*
 * Tela de bloqueio da loja (modo aprovação, seção 05). Substitui a loja inteira enquanto
 * `podeNavegar` for false — quem decide é <Estrutura>. Cinco telas, nesta ordem de precedência:
 *   a) não identificado                       → e-mail (FormIdentificacao) — POST /clientes/identificar
 *   c) pedido na fila                         → "Pedido enviado", sem formulário
 *   d) recusado, pode pedir de novo           → mensagem de bloqueio + botão
 *   e) recusado, em espera (podeSolicitar=false) → data de liberação, sem botão
 *   b) identificado, pendente, sem pedido     → nome e telefone — POST /acesso/solicitar
 * `mensagemBloqueio` do backend vale sempre que vier; os textos daqui são o fallback.
 *
 * Visual: design "Login" aprovado (arte "Vitrine reservada" à esquerda; logo, conteúdo e o
 * rodapé "Atendimento individual pelo WhatsApp" à direita). O design mostrava só o e-mail e o
 * "Pedido enviado"; as demais telas seguem a mesma moldura.
 */

// "2 de outubro de 2026 às 14:30", no fuso do navegador.
const formatoDataLiberacao = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' });

const formatarLiberacao = (iso) => formatoDataLiberacao.format(new Date(iso));

export function PortaoCarregando() {
  return (
    <Moldura>
      <div className="estado-carregando" aria-busy="true" aria-label="Verificando o acesso à loja">
        <Esqueleto className="esqueleto--titulo" />
        <Esqueleto className="esqueleto--controle" />
        <Esqueleto className="esqueleto--controle" />
      </div>
    </Moldura>
  );
}

export default function PortaoAcesso() {
  const { estado } = useAcesso();

  if (!estado.identificado) return <TelaIdentificar mensagem={estado.mensagemBloqueio} />;
  if (estado.solicitacaoPendente) return <TelaNaFila mensagem={estado.mensagemBloqueio} />;
  if (estado.situacao === 'recusado') {
    return estado.podeSolicitar ? (
      <TelaRecusada mensagem={estado.mensagemBloqueio} />
    ) : (
      <TelaEmEspera mensagem={estado.mensagemBloqueio} bloqueadoAte={estado.bloqueadoAte} />
    );
  }
  return <TelaPedirAcesso mensagem={estado.mensagemBloqueio} />;
}

/*
 * Moldura em duas colunas: arte à esquerda, painel à direita (logo no alto, conteúdo no meio,
 * rodapé no fim). A arte mora em <PortaoArte> — é o único ponto a trocar quando a arte final
 * chegar. No celular a arte some e a logo fica centralizada acima do conteúdo.
 */
function Moldura({ children }) {
  return (
    <main className="portao">
      <PortaoArte />
      <section className="portao__painel">
        <div className="portao__interno">
          <Logo tom="verde" className="portao__logo" />
          <div className="portao__conteudo">{children}</div>
          <span className="portao__rodape t-label-caps-sm">Atendimento individual pelo WhatsApp</span>
        </div>
      </section>
    </main>
  );
}

function Cabecalho({ titulo, texto, suave = false }) {
  return (
    <header className="portao__cabecalho">
      <h1 className="t-headline-lg">{titulo}</h1>
      {texto && <p className={suave ? 't-muted' : undefined}>{texto}</p>}
    </header>
  );
}

/**
 * "Usar outro e-mail": encerra a sessão do cliente (POST /clientes/sair). O provedor de acesso
 * reconsulta sozinho quando o cliente muda e a tela volta para a identificação. Só aparece onde
 * o pedido ainda não foi decidido (telas b e c): depois de uma recusa, o link seria um atalho
 * para driblar as 3 recusas e a espera de 3 dias.
 */
function UsarOutroEmail() {
  const { sair } = useSessaoCliente();
  const [saindo, setSaindo] = useState(false);

  async function trocar() {
    setSaindo(true);
    try {
      await sair();
    } catch {
      setSaindo(false); // sem sair, segue na mesma tela; o cliente tenta de novo
    }
  }

  return (
    <button type="button" className="link-caps" onClick={trocar} disabled={saindo}>
      Usar outro e-mail
    </button>
  );
}

/** a) Sem sessão: só pede o e-mail. Ao identificar, o ProvedorAcesso reconsulta sozinho. */
function TelaIdentificar({ mensagem }) {
  // Identificar responde 200 para e-mail novo e existente: "Criar conta" não é outra rota, só
  // leva de volta ao mesmo campo. Nenhum texto daqui diz "conta criada" nem "bem-vindo de volta".
  const irParaEmail = () => document.getElementById('portao-email')?.focus();

  return (
    <Moldura>
      <Cabecalho titulo="Bem-vindo." texto={mensagem || 'Para pedir acesso, seu e-mail.'} suave />
      <FormIdentificacao idBase="portao" placeholder="seu@email.com" rotuloBotao="Pedir permissão" largo={false} />
      <div className="portao__conta">
        <h2 className="t-headline-sm">Ainda não possui uma conta?</h2>
        <p className="t-body-sm">
          Crie a sua com o e-mail e acompanhe as peças da vitrine. Valores e disponibilidade seguem pelo atendimento
          no WhatsApp.
        </p>
        <button type="button" className="link-caps" onClick={irParaEmail}>
          Criar conta
          <IconeSeta aria-hidden="true" />
        </button>
      </div>
    </Moldura>
  );
}

/** b) Identificado, ainda sem pedido: nome e telefone congelam no pedido que a equipe vai ver. */
function TelaPedirAcesso({ mensagem }) {
  const { aplicarEstado } = useAcesso();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      aplicarEstado(await acessoService.solicitar({ nome: nome.trim(), telefone: telefone.trim() }));
    } catch (falha) {
      // ACESSO_EM_ESPERA já atualizou o provedor, e esta tela some sozinha.
      setErro(falha instanceof ErroApi ? falha : new ErroApi({ mensagem: 'Não foi possível enviar o pedido agora.' }));
      setEnviando(false);
    }
  }

  return (
    <Moldura>
      <Cabecalho
        titulo="Peça seu acesso"
        texto={mensagem || 'Conte quem você é para a equipe liberar sua entrada na loja.'}
        suave
      />
      <form className="portao__formulario" onSubmit={enviar} noValidate>
        <Field
          id="portao-nome"
          rotulo="Seu nome"
          name="nome"
          autoComplete="name"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          erro={erro?.campos?.nome}
        />
        <Field
          id="portao-telefone"
          rotulo="Telefone (com DDD)"
          type="tel"
          name="telefone"
          autoComplete="tel"
          inputMode="tel"
          required
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          erro={erro?.campos?.telefone}
        />
        {erro && !erro.campos?.nome && !erro.campos?.telefone && <ErroGeral>{erro.mensagem}</ErroGeral>}
        <div className="portao__acoes">
          <Button variante="primaria" type="submit" disabled={enviando || !nome.trim() || !telefone.trim()}>
            {enviando ? 'Enviando pedido…' : 'Pedir permissão'}
          </Button>
          <UsarOutroEmail />
        </div>
      </form>
    </Moldura>
  );
}

/**
 * c) Pedido enviado. Não há e-mail de aviso no backend: a liberação aparece aqui mesmo. O
 * provedor reconsulta ao voltar para a aba; o botão cobre o resto (sem polling).
 */
function TelaNaFila({ mensagem }) {
  const { reconsultar } = useAcesso();
  const { cliente } = useSessaoCliente();
  const [conferindo, setConferindo] = useState(false);

  async function conferir() {
    setConferindo(true);
    await reconsultar();
    setConferindo(false);
  }

  return (
    <Moldura>
      <Cabecalho titulo="Pedido enviado." />
      <div className="portao__enviado" role="status">
        <p>{mensagem || 'Assim que a equipe liberar a entrada, é só voltar aqui.'}</p>
        {cliente?.email && (
          <p className="t-body-sm t-muted">
            Pedido feito com <strong>{cliente.email}</strong>.
          </p>
        )}
        <div className="portao__acoes">
          <Button variante="secundaria" onClick={conferir} disabled={conferindo}>
            {conferindo ? 'Conferindo…' : 'Conferir de novo'}
          </Button>
          <UsarOutroEmail />
        </div>
      </div>
    </Moldura>
  );
}

/** d) Recusado, dentro do limite de recusas: a mensagem de bloqueio e a chance de pedir de novo. */
function TelaRecusada({ mensagem }) {
  const { aplicarEstado } = useAcesso();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function pedirDeNovo() {
    setEnviando(true);
    setErro(null);
    try {
      aplicarEstado(await acessoService.solicitar({}));
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha : new ErroApi({ mensagem: 'Não foi possível enviar o pedido agora.' }));
      setEnviando(false);
    }
  }

  return (
    <Moldura>
      <Cabecalho titulo="Acesso não liberado" texto={mensagem || 'Seu acesso à loja não foi liberado.'} suave />
      {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button variante="primaria" onClick={pedirDeNovo} disabled={enviando}>
        {enviando ? 'Enviando pedido…' : 'Pedir acesso de novo'}
      </Button>
    </Moldura>
  );
}

/** e) Recusas seguidas: sem botão até `bloqueadoAte` (o provedor reconsulta quando vence). */
function TelaEmEspera({ mensagem, bloqueadoAte }) {
  return (
    <Moldura>
      <Cabecalho titulo="Acesso não liberado" texto={mensagem || 'Seu acesso à loja não foi liberado.'} suave />
      {bloqueadoAte && (
        <p className="portao__espera">
          Você poderá pedir acesso de novo a partir de <strong>{formatarLiberacao(bloqueadoAte)}</strong>.
        </p>
      )}
    </Moldura>
  );
}
