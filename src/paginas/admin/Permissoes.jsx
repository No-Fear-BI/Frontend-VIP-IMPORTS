/*
 * Permissões de Acesso (/admin/permissoes): abre e fecha a loja e decide a fila de pedidos de acesso
 * (backend, seção 05). A loja nasce FECHADA (modo aprovação); aqui a equipe a abre e fecha. Não há
 * edição da mensagem de bloqueio — sem mensagem, o portão usa o texto padrão do backend.
 *
 * Não existe GET administrativo da configuração: o modo atual vem de GET /acesso/estado, que é
 * público (mesma exceção da tela de Destaques, que lê a home pública). Depois de mudar o modo, o
 * ProvedorAcesso da loja é reconsultado para não ficar com o estado antigo.
 *
 * Recusar 3 vezes seguidas deixa a pessoa 3 dias sem poder pedir de novo (regra do backend, vale
 * também para revogação de acesso). A tela avisa a equipe disso antes de recusar.
 */

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import { ErroGeral } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useAcesso } from '../../contexto/AcessoLoja.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { ErroApi } from '../../lib/apiClient.js';
import { cn } from '../../lib/cn.js';
import { acessoAdminService } from '../../services/acessoAdminService.js';
import { acessoService } from '../../services/acessoService.js';
import './Permissoes.css';

const POR_PAGINA = 20;

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const comoErro = (falha, mensagem) => (falha instanceof ErroApi ? falha : new ErroApi({ mensagem }));

export default function AdminPermissoes() {
  return (
    <section className="admin__pagina">
      <header className="admin-permissoes__topo">
        <h1 className="t-headline-lg">Permissões de Acesso</h1>
        <p className="t-body-sm t-muted admin-permissoes__ajuda">
          Abre e fecha a loja e decide os pedidos de acesso.
        </p>
      </header>

      <AberturaDaLoja />
      <Fila />
    </section>
  );
}

/** O que cada ação mostra: a pergunta do diálogo, o botão e o aviso depois de gravar. */
const TROCA_DE_MODO = {
  aberto: {
    botao: 'Abrir a loja',
    titulo: 'Abrir a loja?',
    texto:
      'Qualquer pessoa passa a ver a loja, os produtos e os preços, sem pedir acesso. Os pedidos que estão na fila continuam esperando.',
    confirmar: 'Abrir a loja',
    enviando: 'Abrindo…',
    pronto: 'Loja aberta.',
  },
  aprovacao: {
    botao: 'Fechar a loja',
    titulo: 'Fechar a loja?',
    texto:
      'Só entra quem a equipe aprovou. Quem foi aprovado, ou entrou enquanto a loja estava aberta, continua entrando; quem ainda não foi aprovado volta a ver a tela de acesso.',
    confirmar: 'Fechar a loja',
    enviando: 'Fechando…',
    pronto: 'Loja fechada.',
  },
};

function AberturaDaLoja() {
  const { reconsultar } = useAcesso();
  const config = useRequisicao((sinal) => acessoService.estado(sinal), []);
  const [alvo, setAlvo] = useState(null); // 'aberto' | 'aprovacao' enquanto o diálogo está aberto
  const [aviso, setAviso] = useState('');

  const aberta = config.dados?.modo === 'aberto';
  const proximo = aberta ? 'aprovacao' : 'aberto';

  async function trocar(modo) {
    await acessoAdminService.configurar({ modo });
    setAlvo(null);
    setAviso(TROCA_DE_MODO[modo].pronto);
    config.recarregar();
    reconsultar();
  }

  return (
    <div className="admin-permissoes__bloco">
      <h2 className="t-headline-md">Abertura da loja</h2>
      {config.carregando && !config.dados ? (
        <div className="estado-carregando" aria-busy="true" aria-label="Carregando o estado da loja">
          <Esqueleto className="esqueleto--controle" />
        </div>
      ) : config.erro ? (
        <EstadoErro
          erro={config.erro}
          onTentar={config.recarregar}
          titulo="Não conseguimos carregar o estado da loja."
        />
      ) : (
        <>
          <div className="admin-permissoes__loja">
            <span
              className={cn(
                'admin-permissoes__situacao t-label-caps-sm',
                aberta && 'admin-permissoes__situacao--aberta',
              )}
            >
              {aberta ? 'Aberta' : 'Fechada'}
            </span>
            <p className="t-body-sm t-muted admin-permissoes__loja-texto">
              {aberta
                ? 'Qualquer pessoa vê a loja, sem pedir acesso.'
                : 'Só entra quem a equipe aprovou. Quem pede acesso aparece na fila abaixo.'}
            </p>
            <Button variante={aberta ? 'secundaria' : 'primaria'} onClick={() => setAlvo(proximo)}>
              {TROCA_DE_MODO[proximo].botao}
            </Button>
          </div>
          <p className="t-body-sm admin-permissoes__aviso" role="status">
            {aviso}
          </p>
        </>
      )}

      <DialogoModo alvo={alvo} onFechar={() => setAlvo(null)} onConfirmar={trocar} />
    </div>
  );
}

function DialogoModo({ alvo, onFechar, onConfirmar }) {
  return (
    <Modal aberto={Boolean(alvo)} onFechar={onFechar} titulo={alvo ? TROCA_DE_MODO[alvo].titulo : 'Abertura da loja'}>
      {/* key: o diálogo nasce sem erro a cada abertura. */}
      {alvo && <FormModo key={alvo} alvo={alvo} onFechar={onFechar} onConfirmar={onConfirmar} />}
    </Modal>
  );
}

function FormModo({ alvo, onFechar, onConfirmar }) {
  const textos = TROCA_DE_MODO[alvo];
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await onConfirmar(alvo);
    } catch (falha) {
      setErro(comoErro(falha, 'Não foi possível mudar agora.'));
      setEnviando(false);
    }
  }

  return (
    <form className="admin-permissoes__recusa" onSubmit={enviar} noValidate>
      <h2 className="t-headline-md">{textos.titulo}</h2>
      <p className="t-body-sm t-muted">{textos.texto}</p>
      {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <div className="admin-permissoes__acoes">
        <Button variante="primaria" type="submit" disabled={enviando}>
          {enviando ? textos.enviando : textos.confirmar}
        </Button>
        <Button variante="secundaria" onClick={onFechar} disabled={enviando}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Fila() {
  const [params, setParams] = useSearchParams();
  const pagina = Math.max(1, Number(params.get('pagina')) || 1);

  const lista = useRequisicao(
    (sinal) => acessoAdminService.fila({ pagina, porPagina: POR_PAGINA }, sinal),
    [pagina],
  );

  const [decidindo, setDecidindo] = useState(null); // id do cliente com a decisão em voo
  const [erroDecisao, setErroDecisao] = useState(null);
  const [recusando, setRecusando] = useState(null); // linha aberta no diálogo de recusa

  const total = lista.dados?.paginacao.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const linhas = useMemo(() => lista.dados?.dados ?? [], [lista.dados]);

  function irParaPagina(numero) {
    const proximo = new URLSearchParams(params);
    if (numero > 1) proximo.set('pagina', String(numero));
    else proximo.delete('pagina');
    setParams(proximo);
  }

  /** Devolve true se a decisão foi gravada. Erro fica na linha; a tela não trava. */
  async function decidir(linha, situacao, motivo) {
    setDecidindo(linha.clienteId);
    setErroDecisao(null);
    try {
      await acessoAdminService.decidir(linha.clienteId, situacao, motivo);
      lista.recarregar();
      return true;
    } catch (falha) {
      setErroDecisao({ clienteId: linha.clienteId, erro: comoErro(falha, 'Não foi possível registrar a decisão.') });
      return false;
    } finally {
      setDecidindo(null);
    }
  }

  return (
    <div className="admin-permissoes__bloco">
      <h2 className="t-headline-md">Pedidos pendentes</h2>
      <p className="t-body-sm t-muted admin-permissoes__contagem" aria-live="polite">
        {lista.erro || (lista.carregando && !lista.dados)
          ? ' '
          : `${total} ${total === 1 ? 'pedido aguardando' : 'pedidos aguardando'}`}
      </p>

      {lista.carregando && !lista.dados ? (
        <div className="estado-carregando" aria-busy="true" aria-label="Carregando os pedidos">
          {Array.from({ length: 4 }, (_, i) => (
            <Esqueleto key={i} className="esqueleto--linha admin-permissoes__esqueleto" />
          ))}
        </div>
      ) : lista.erro ? (
        <EstadoErro erro={lista.erro} onTentar={lista.recarregar} titulo="Não conseguimos carregar os pedidos." />
      ) : linhas.length === 0 ? (
        pagina > 1 ? (
          <EstadoVazio
            titulo="Esta página não existe mais."
            texto="A fila ficou mais curta desde que o link foi aberto."
            acao={{ rotulo: 'Ir para a primeira página', onClick: () => irParaPagina(1) }}
          />
        ) : (
          <EstadoVazio
            titulo="Nenhum pedido na fila."
            texto="Quando alguém pedir acesso à loja, o pedido aparece aqui."
            acao={{ rotulo: 'Atualizar', onClick: lista.recarregar }}
          />
        )
      ) : (
        <>
          <table className="admin-tabela admin-permissoes__tabela">
            <thead>
              <tr>
                <th scope="col" className="t-label-caps-sm">E-mail</th>
                <th scope="col" className="t-label-caps-sm">Nome</th>
                <th scope="col" className="t-label-caps-sm">Telefone</th>
                <th scope="col" className="t-label-caps-sm">Pedido em</th>
                <th scope="col" className="t-label-caps-sm">
                  <span className="admin-permissoes__so-leitor">Decisão</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha) => {
                const ocupada = decidindo === linha.clienteId;
                const falha = erroDecisao?.clienteId === linha.clienteId ? erroDecisao.erro : null;
                return (
                  <tr key={linha.id}>
                    <td className="t-body-sm">{linha.email}</td>
                    <td className="t-body-sm">{linha.nome || <span className="t-muted">não informado</span>}</td>
                    <td className="t-body-sm">{linha.telefone || <span className="t-muted">não informado</span>}</td>
                    <td className="t-body-sm">{formatoData.format(new Date(linha.criadoEm))}</td>
                    <td>
                      <div className="admin-tabela__acoes">
                        <Button
                          variante="secundaria"
                          disabled={decidindo !== null}
                          onClick={() => decidir(linha, 'aprovado')}
                          aria-label={`Aprovar ${linha.email}`}
                        >
                          {ocupada ? 'Salvando…' : 'Aprovar'}
                        </Button>
                        <Button
                          variante="texto"
                          disabled={decidindo !== null}
                          onClick={() => {
                            setErroDecisao(null);
                            setRecusando(linha);
                          }}
                          aria-label={`Recusar ${linha.email}`}
                        >
                          <span>Recusar</span>
                        </Button>
                      </div>
                      {falha && (
                        <p className="t-body-sm admin-permissoes__erro-linha" role="alert">
                          {falha.mensagem}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginas > 1 && (
            <nav className="admin-permissoes__paginacao" aria-label="Páginas">
              <Button variante="secundaria" disabled={pagina <= 1} onClick={() => irParaPagina(pagina - 1)}>
                Anterior
              </Button>
              <span className="t-body-sm">
                Página {pagina} de {paginas}
              </span>
              <Button variante="secundaria" disabled={pagina >= paginas} onClick={() => irParaPagina(pagina + 1)}>
                Próxima
              </Button>
            </nav>
          )}
        </>
      )}

      <DialogoRecusa
        linha={recusando}
        onFechar={() => setRecusando(null)}
        onRecusar={async (motivo) => {
          const ok = await decidir(recusando, 'recusado', motivo);
          if (ok) setRecusando(null);
          return ok;
        }}
        erro={erroDecisao && recusando && erroDecisao.clienteId === recusando.clienteId ? erroDecisao.erro : null}
      />
    </div>
  );
}

function DialogoRecusa({ linha, onFechar, onRecusar, erro }) {
  return (
    <Modal aberto={Boolean(linha)} onFechar={onFechar} titulo="Recusar pedido de acesso">
      {/* key: o formulário nasce zerado a cada pedido aberto. */}
      {linha && <FormRecusa key={linha.id} linha={linha} onFechar={onFechar} onRecusar={onRecusar} erro={erro} />}
    </Modal>
  );
}

function FormRecusa({ linha, onFechar, onRecusar, erro }) {
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    const ok = await onRecusar(motivo.trim());
    if (!ok) setEnviando(false);
  }

  return (
    <form className="admin-permissoes__recusa" onSubmit={enviar} noValidate>
      <h2 className="t-headline-md">Recusar {linha.email}?</h2>
      <p className="t-body-sm t-muted">
        A pessoa continua sem ver a loja e pode pedir de novo. Depois de 3 recusas seguidas, fica 3 dias sem poder
        pedir. Uma aprovação zera a contagem.
      </p>
      <div className="campo">
        <label htmlFor="permissoes-motivo" className="t-label-caps">
          Motivo (opcional)
        </label>
        <p id="permissoes-motivo-ajuda" className="t-body-sm t-muted">
          Só a equipe vê. Não aparece para o visitante.
        </p>
        <textarea
          id="permissoes-motivo"
          className="campo__input admin-permissoes__mensagem"
          rows={3}
          aria-describedby="permissoes-motivo-ajuda"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </div>
      {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <div className="admin-permissoes__acoes">
        <Button variante="primaria" type="submit" disabled={enviando}>
          {enviando ? 'Recusando…' : 'Recusar pedido'}
        </Button>
        <Button variante="secundaria" onClick={onFechar} disabled={enviando}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
