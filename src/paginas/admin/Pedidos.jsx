/*
 * Pedidos (/admin/pedidos): as seleções que os clientes enviaram pelo WhatsApp, com as peças, a
 * quantidade e os dados de quem pediu. A equipe marca cada pedido como finalizado ou não finalizado.
 * Filtro por status e página na URL (?status=&pagina=). Os dados são cópia do momento do envio:
 * renomear um produto depois não muda o pedido.
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import { FotoProduto } from '../../components/Produto.jsx';
import Button from '../../components/ui/Button.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { cn } from '../../lib/cn.js';
import { STATUS_PEDIDO, pedidosAdminService } from '../../services/pedidosAdminService.js';
import './Pedidos.css';

const POR_PAGINA = 20;

const ROTULO_STATUS = {
  em_andamento: 'Em andamento',
  finalizado: 'Finalizado',
  nao_finalizado: 'Não finalizado',
};

const ROTULO_FILTRO = {
  em_andamento: 'Em andamento',
  finalizado: 'Finalizados',
  nao_finalizado: 'Não finalizados',
};

/** Chave de `contagens` na resposta, por status. */
const CHAVE_CONTAGEM = { em_andamento: 'emAndamento', finalizado: 'finalizado', nao_finalizado: 'naoFinalizado' };

/** Para onde o pedido pode ir a partir de cada status: qualquer um vale, então dá para corrigir um clique. */
const ACOES = {
  em_andamento: [
    { status: 'finalizado', rotulo: 'Marcar como finalizado', variante: 'primaria' },
    { status: 'nao_finalizado', rotulo: 'Marcar como não finalizado', variante: 'secundaria' },
  ],
  finalizado: [
    { status: 'em_andamento', rotulo: 'Reabrir pedido', variante: 'secundaria' },
    { status: 'nao_finalizado', rotulo: 'Marcar como não finalizado', variante: 'secundaria' },
  ],
  nao_finalizado: [
    { status: 'em_andamento', rotulo: 'Reabrir pedido', variante: 'secundaria' },
    { status: 'finalizado', rotulo: 'Marcar como finalizado', variante: 'secundaria' },
  ],
};

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const data = (iso) => formatoData.format(new Date(iso));

export default function AdminPedidos() {
  const [params, setParams] = useSearchParams();
  const statusNaUrl = params.get('status');
  const status = STATUS_PEDIDO.includes(statusNaUrl) ? statusNaUrl : '';
  const pagina = Math.max(1, Number(params.get('pagina')) || 1);

  const lista = useRequisicao(
    (sinal) => pedidosAdminService.listar({ status, pagina, porPagina: POR_PAGINA }, sinal),
    [status, pagina],
  );

  const [salvando, setSalvando] = useState(null); // id do pedido com a mudança de status em voo
  const [erroAcao, setErroAcao] = useState(null); // { id, erro }
  const [aviso, setAviso] = useState('');

  function mudarFiltro(mudancas) {
    const proximo = new URLSearchParams(params);
    for (const [nome, valor] of Object.entries(mudancas)) {
      if (valor) proximo.set(nome, valor);
      else proximo.delete(nome);
    }
    if (!('pagina' in mudancas)) proximo.delete('pagina');
    setAviso('');
    setErroAcao(null);
    setParams(proximo, { replace: !('pagina' in mudancas) });
  }

  async function mudarStatus(pedido, novoStatus) {
    setSalvando(pedido.id);
    setErroAcao(null);
    setAviso('');
    try {
      await pedidosAdminService.atualizarStatus(pedido.id, novoStatus);
      setAviso(`Pedido nº ${pedido.id} marcado como ${ROTULO_STATUS[novoStatus].toLowerCase()}.`);
      lista.recarregar();
    } catch (falha) {
      setErroAcao({ id: pedido.id, erro: falha });
    } finally {
      setSalvando(null);
    }
  }

  const contagens = lista.dados?.contagens;
  const total = lista.dados?.paginacao.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <section className="admin__pagina">
      <header className="admin-pedidos__topo">
        <h1 className="t-headline-lg">Pedidos</h1>
        <p className="t-body-sm t-muted admin-pedidos__ajuda">
          Seleções que os clientes enviaram pelo WhatsApp. Marque cada pedido como finalizado ou não finalizado
          depois de atender.
        </p>
      </header>

      <FiltroStatus atual={status} contagens={contagens} onMudar={(novo) => mudarFiltro({ status: novo })} />

      <p className="t-body-sm admin-pedidos__aviso" role="status">
        {aviso}
      </p>

      {lista.carregando ? (
        <div className="estado-carregando" aria-busy="true" aria-label="Carregando pedidos">
          {Array.from({ length: 3 }, (_, i) => (
            <Esqueleto key={i} className="admin-pedidos__esqueleto" />
          ))}
        </div>
      ) : lista.erro ? (
        <EstadoErro erro={lista.erro} onTentar={lista.recarregar} titulo="Não conseguimos carregar os pedidos." />
      ) : lista.dados.dados.length === 0 ? (
        status ? (
          <EstadoVazio
            titulo={`Nenhum pedido ${ROTULO_STATUS[status].toLowerCase()}.`}
            texto="Quando houver, o pedido aparece aqui."
            acao={{ rotulo: 'Ver todos os pedidos', onClick: () => mudarFiltro({ status: '' }) }}
          />
        ) : pagina > 1 ? (
          <EstadoVazio
            titulo="Esta página não existe mais."
            texto="A lista ficou mais curta desde que o link foi aberto."
            acao={{ rotulo: 'Ir para a primeira página', onClick: () => mudarFiltro({ pagina: '' }) }}
          />
        ) : (
          <EstadoVazio
            titulo="Nenhum pedido ainda."
            texto="Quando um cliente enviar uma seleção pelo WhatsApp, o pedido aparece aqui."
          />
        )
      ) : (
        <>
          <ul className="admin-pedidos__lista">
            {lista.dados.dados.map((pedido) => (
              <li key={pedido.id}>
                <CartaoPedido
                  pedido={pedido}
                  ocupado={salvando === pedido.id}
                  erro={erroAcao?.id === pedido.id ? erroAcao.erro : null}
                  onMudar={(novo) => mudarStatus(pedido, novo)}
                />
              </li>
            ))}
          </ul>

          {paginas > 1 && (
            <nav className="admin-pedidos__paginacao" aria-label="Páginas">
              <Button
                variante="secundaria"
                disabled={pagina <= 1}
                onClick={() => mudarFiltro({ status, pagina: pagina - 1 > 1 ? String(pagina - 1) : '' })}
              >
                Anterior
              </Button>
              <span className="t-body-sm">
                Página {pagina} de {paginas}
              </span>
              <Button
                variante="secundaria"
                disabled={pagina >= paginas}
                onClick={() => mudarFiltro({ status, pagina: String(pagina + 1) })}
              >
                Próxima
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

/** "Todos" e os três status, cada um com quantos pedidos tem (do banco inteiro, não só desta página). */
function FiltroStatus({ atual, contagens, onMudar }) {
  const opcoes = [
    { valor: '', rotulo: 'Todos', numero: contagens?.total },
    ...STATUS_PEDIDO.map((valor) => ({
      valor,
      rotulo: ROTULO_FILTRO[valor],
      numero: contagens?.[CHAVE_CONTAGEM[valor]],
    })),
  ];
  return (
    <div className="admin-pedidos__filtro" role="group" aria-label="Filtrar pedidos por status">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor || 'todos'}
          type="button"
          className={cn('admin-pedidos__filtro-opcao', opcao.valor === atual && 'admin-pedidos__filtro-opcao--ativo')}
          aria-pressed={opcao.valor === atual}
          onClick={() => onMudar(opcao.valor)}
        >
          {opcao.rotulo}
          {opcao.numero !== undefined && <span className="admin-pedidos__filtro-numero">{opcao.numero}</span>}
        </button>
      ))}
    </div>
  );
}

function CartaoPedido({ pedido, ocupado, erro, onMudar }) {
  const idTitulo = `pedido-${pedido.id}`;
  const { cliente, itens } = pedido;
  return (
    <article className="admin-pedidos__cartao" aria-labelledby={idTitulo}>
      <header className="admin-pedidos__cabecalho">
        <div>
          <h2 id={idTitulo} className="t-headline-sm">
            Pedido nº {pedido.id}
          </h2>
          <p className="t-body-sm t-muted">
            Enviado em {data(pedido.criadoEm)}
            {pedido.atualizadoEm !== pedido.criadoEm && ` · atualizado em ${data(pedido.atualizadoEm)}`}
          </p>
        </div>
        <span className={cn('admin-pedidos__status t-label-caps-sm', `admin-pedidos__status--${pedido.status}`)}>
          {ROTULO_STATUS[pedido.status]}
        </span>
      </header>

      <div className="admin-pedidos__corpo">
        <section aria-label="Cliente">
          <h3 className="t-label-caps">Cliente</h3>
          <dl className="admin-pedidos__dados">
            <div>
              <dt className="t-label-caps-sm t-muted">Nome</dt>
              <dd className="t-body-sm">{cliente.nome || <span className="t-muted">não informado</span>}</dd>
            </div>
            <div>
              <dt className="t-label-caps-sm t-muted">E-mail</dt>
              <dd className="t-body-sm admin-pedidos__email">{cliente.email}</dd>
            </div>
            <div>
              <dt className="t-label-caps-sm t-muted">Telefone</dt>
              <dd className="t-body-sm">{cliente.telefone || <span className="t-muted">não informado</span>}</dd>
            </div>
          </dl>
        </section>

        <section aria-label="Produtos">
          <h3 className="t-label-caps">
            {pedido.totalItens} {pedido.totalItens === 1 ? 'produto' : 'produtos'}
          </h3>
          <ul className="admin-pedidos__itens">
            {itens.map((item, indice) => (
              <li key={`${item.codigo}-${indice}`} className="admin-pedidos__item">
                <FotoProduto className="admin-pedidos__foto" url={item.imagemUrl} alt={item.nome} />
                <div className="admin-pedidos__item-texto">
                  <p className="t-codigo">{item.codigo}</p>
                  <p className="t-body-sm">{item.nome}</p>
                  <p className="t-body-sm t-muted">
                    {item.marca} · {item.categoria}
                  </p>
                  <p className="t-body-sm">{variacoesDoItem(item)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="admin-pedidos__acoes">
        {ACOES[pedido.status].map((acao) => (
          <Button key={acao.status} variante={acao.variante} disabled={ocupado} onClick={() => onMudar(acao.status)}>
            {acao.rotulo}
          </Button>
        ))}
      </footer>

      {erro && (
        <p className="t-body-sm admin-pedidos__erro" role="alert">
          {erro.mensagem}
        </p>
      )}
    </article>
  );
}

function variacoesDoItem(item) {
  const escolhas = [item.tamanho && `Tamanho ${item.tamanho}`, item.cor && `Cor ${item.cor}`].filter(Boolean);
  return escolhas.length ? escolhas.join(' · ') : <span className="t-muted">Sem tamanho ou cor escolhidos</span>;
}
