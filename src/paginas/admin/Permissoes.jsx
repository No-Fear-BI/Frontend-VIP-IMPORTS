/*
 * Permissões de Acesso (/admin/permissoes): escreve a mensagem que o visitante barrado lê e
 * decide a fila de pedidos (backend, seção 05). A loja é SEMPRE fechada (modo aprovação): não há
 * mais seletor de modo aqui.
 *
 * Não existe GET administrativo da configuração: a mensagem atual vem de GET /acesso/estado,
 * que é público (mesma exceção da tela de Destaques, que lê a home pública). Depois de salvar,
 * o ProvedorAcesso da loja é reconsultado para não ficar com a mensagem antiga.
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
import { acessoAdminService } from '../../services/acessoAdminService.js';
import { acessoService } from '../../services/acessoService.js';
import './Permissoes.css';

const POR_PAGINA = 20;

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const comoErro = (falha, mensagem) => (falha instanceof ErroApi ? falha : new ErroApi({ mensagem }));

export default function AdminPermissoes() {
  const config = useRequisicao((sinal) => acessoService.estado(sinal), []);

  return (
    <section className="admin__pagina">
      <header className="admin-permissoes__topo">
        <h1 className="t-headline-lg">Permissões de Acesso</h1>
        <p className="t-body-sm t-muted admin-permissoes__ajuda">
          Controla quem consegue ver a loja e decide os pedidos de acesso.
        </p>
      </header>

      <div className="admin-permissoes__bloco">
        <h2 className="t-headline-md">Tela de bloqueio</h2>
        {config.carregando && !config.dados ? (
          <div className="estado-carregando" aria-busy="true" aria-label="Carregando a configuração">
            <Esqueleto className="esqueleto--controle" />
            <Esqueleto className="esqueleto--controle" />
            <Esqueleto className="esqueleto--linha" />
          </div>
        ) : config.erro ? (
          <EstadoErro
            erro={config.erro}
            onTentar={config.recarregar}
            titulo="Não conseguimos carregar a configuração."
          />
        ) : (
          <FormConfiguracao inicial={config.dados} />
        )}
      </div>

      <Fila />
    </section>
  );
}

function FormConfiguracao({ inicial }) {
  const { reconsultar } = useAcesso();
  const [salvo, setSalvo] = useState(inicial.mensagemBloqueio || '');
  const [mensagem, setMensagem] = useState(salvo);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [feito, setFeito] = useState(false);

  const alterado = mensagem.trim() !== salvo.trim();

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro(null);
    setFeito(false);
    try {
      const resposta = await acessoAdminService.configurar({
        mensagemBloqueio: mensagem.trim() || null,
      });
      const proximo = resposta.mensagemBloqueio || '';
      setSalvo(proximo);
      setMensagem(proximo);
      setFeito(true);
      reconsultar();
    } catch (falha) {
      setErro(comoErro(falha, 'Não foi possível salvar agora.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="admin__formulario admin-permissoes__form" onSubmit={salvar} noValidate>
      <div className="campo">
        <label htmlFor="permissoes-mensagem" className="t-label-caps">
          Mensagem de bloqueio
        </label>
        <p id="permissoes-mensagem-ajuda" className="t-body-sm t-muted">
          É o que o visitante barrado lê na tela de acesso. Deixe vazio para usar o texto padrão.
        </p>
        <textarea
          id="permissoes-mensagem"
          className="campo__input admin-permissoes__mensagem"
          rows={3}
          aria-describedby="permissoes-mensagem-ajuda"
          value={mensagem}
          onChange={(e) => {
            setMensagem(e.target.value);
            setFeito(false);
          }}
        />
      </div>

      {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <div className="admin-permissoes__acoes">
        <Button variante="primaria" type="submit" disabled={salvando || !alterado}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </Button>
        {feito && (
          <span className="t-body-sm" role="status">
            Salvo.
          </span>
        )}
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
