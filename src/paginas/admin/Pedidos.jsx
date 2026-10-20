/*
 * Pedidos (/admin/pedidos). O que os clientes encomendaram pela loja, com os dados de quem pediu
 * (cópia do momento do envio) e se o pagamento já foi confirmado. A loja não cobra pelo site:
 * quem confirma o pagamento é a equipe, aqui. Busca, situação e paginação ficam na URL.
 */

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import { cn } from '../../lib/cn.js';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { pedidosAdminService } from '../../services/pedidosAdminService.js';
import './Pedidos.css';

const POR_PAGINA = 20;

const SITUACOES = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'pendente', rotulo: 'Aguardando pagamento' },
  { valor: 'pago', rotulo: 'Pagos' },
];

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminPedidos() {
  const [params, setParams] = useSearchParams();
  const [alterando, setAlterando] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);

  const filtros = useMemo(
    () => ({
      busca: params.get('busca') || '',
      situacao: params.get('situacao') || '',
      pagina: Math.max(1, Number(params.get('pagina')) || 1),
    }),
    [params],
  );
  const temFiltro = Boolean(filtros.busca || filtros.situacao);

  const lista = useRequisicao(
    (sinal) => pedidosAdminService.listar({ ...filtros, porPagina: POR_PAGINA }, sinal),
    [filtros.busca, filtros.situacao, filtros.pagina],
  );

  function mudarFiltro(mudancas) {
    const proximo = new URLSearchParams(params);
    for (const [nome, valor] of Object.entries(mudancas)) {
      if (valor) proximo.set(nome, valor);
      else proximo.delete(nome);
    }
    if (!('pagina' in mudancas)) proximo.delete('pagina');
    setParams(proximo, { replace: !('pagina' in mudancas) });
  }

  const limpar = () => setParams(new URLSearchParams(), { replace: true });

  async function alternarPagamento(pedido) {
    setAlterando(pedido.id);
    setErroAcao(null);
    try {
      await pedidosAdminService.definirPagamento(pedido.id, !pedido.pago);
      lista.recarregar();
    } catch (falha) {
      setErroAcao(falha.mensagem || 'Não conseguimos atualizar o pagamento. Tente de novo.');
    } finally {
      setAlterando(null);
    }
  }

  const total = lista.dados?.paginacao.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <section className="admin__pagina">
      <header className="admin-pedidos__topo">
        <h1 className="t-headline-lg">Pedidos</h1>
        <p className="t-body-sm t-muted admin-pedidos__ajuda">
          O que os clientes encomendaram, com os dados de quem pediu. Quando o pagamento chegar, marque o pedido
          como pago.
        </p>
      </header>

      <div className="admin-pedidos__filtros">
        <FormBusca key={filtros.busca} inicial={filtros.busca} onBuscar={(busca) => mudarFiltro({ busca })} />
        <div className="admin-pedidos__situacoes" role="group" aria-label="Situação do pagamento">
          {SITUACOES.map((s) => (
            <Button
              key={s.valor || 'todos'}
              variante={filtros.situacao === s.valor ? 'primaria' : 'secundaria'}
              aria-pressed={filtros.situacao === s.valor}
              onClick={() => mudarFiltro({ situacao: s.valor })}
            >
              {s.rotulo}
            </Button>
          ))}
        </div>
      </div>

      <p className="t-body-sm t-muted admin-pedidos__contagem" aria-live="polite">
        {lista.carregando || lista.erro
          ? ' '
          : `${total} ${total === 1 ? 'pedido' : 'pedidos'}${temFiltro ? ' com estes filtros' : ''}`}
        {temFiltro && (
          <button type="button" className="link-caps" onClick={limpar}>
            Limpar filtros
          </button>
        )}
      </p>

      {erroAcao && (
        <p className="t-body-sm admin-pedidos__erro" role="alert">
          {erroAcao}
        </p>
      )}

      {lista.carregando ? (
        <div className="estado-carregando" aria-busy="true" aria-label="Carregando pedidos">
          {Array.from({ length: 6 }, (_, i) => (
            <Esqueleto key={i} className="esqueleto--linha admin-pedidos__esqueleto" />
          ))}
        </div>
      ) : lista.erro ? (
        <EstadoErro erro={lista.erro} onTentar={lista.recarregar} titulo="Não conseguimos carregar os pedidos." />
      ) : lista.dados.dados.length === 0 ? (
        temFiltro ? (
          <EstadoVazio
            titulo="Nenhum pedido com estes filtros."
            texto="Busque por outro nome ou e-mail, ou mude a situação."
            acao={{ rotulo: 'Limpar filtros', onClick: limpar }}
          />
        ) : filtros.pagina > 1 ? (
          <EstadoVazio
            titulo="Esta página não existe mais."
            texto="A lista ficou mais curta desde que o link foi aberto."
            acao={{ rotulo: 'Ir para a primeira página', onClick: () => mudarFiltro({ pagina: '' }) }}
          />
        ) : (
          <EstadoVazio
            titulo="Nenhum pedido ainda."
            texto="Quando um cliente encomendar pela loja, o pedido aparece aqui."
          />
        )
      ) : (
        <>
          <table className="admin-tabela admin-pedidos__tabela">
            <thead>
              <tr>
                <th scope="col" className="t-label-caps-sm">Pedido</th>
                <th scope="col" className="t-label-caps-sm">Cliente</th>
                <th scope="col" className="t-label-caps-sm">Peças</th>
                <th scope="col" className="t-label-caps-sm">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {lista.dados.dados.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="t-body-sm">
                    <strong>#{pedido.id}</strong>
                    <span className="admin-pedidos__detalhe t-muted">
                      {formatoData.format(new Date(pedido.criadoEm))}
                    </span>
                  </td>
                  <td className="t-body-sm">
                    <strong>{pedido.clienteNome || <span className="t-muted">sem nome</span>}</strong>
                    <span className="admin-pedidos__detalhe">{pedido.clienteEmail}</span>
                    <span className="admin-pedidos__detalhe">
                      {pedido.clienteTelefone || <span className="t-muted">telefone não informado</span>}
                    </span>
                  </td>
                  <td className="t-body-sm">
                    <ul className="admin-pedidos__itens">
                      {pedido.itens.map((item, i) => (
                        <li key={i}>
                          {item.codigo} — {item.nome}
                          <span className="t-muted">
                            {' '}
                            ({item.variacao ? `${item.marca}, ${item.variacao}` : item.marca})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="t-body-sm">
                    <span
                      className={cn('admin-pedidos__selo t-label-caps-sm', pedido.pago && 'admin-pedidos__selo--pago')}
                    >
                      {pedido.pago ? 'Pago' : 'Aguardando pagamento'}
                    </span>
                    {pedido.pago && pedido.pagoEm && (
                      <span className="admin-pedidos__detalhe t-muted">
                        em {formatoData.format(new Date(pedido.pagoEm))}
                      </span>
                    )}
                    <div className="admin-pedidos__acao">
                      <Button
                        variante={pedido.pago ? 'texto' : 'secundaria'}
                        disabled={alterando === pedido.id}
                        onClick={() => alternarPagamento(pedido)}
                      >
                        {pedido.pago ? 'Desfazer pagamento' : 'Marcar como pago'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginas > 1 && (
            <nav className="admin-pedidos__paginacao" aria-label="Páginas">
              <Button
                variante="secundaria"
                disabled={filtros.pagina <= 1}
                onClick={() => mudarFiltro({ pagina: filtros.pagina - 1 > 1 ? String(filtros.pagina - 1) : '' })}
              >
                Anterior
              </Button>
              <span className="t-body-sm">
                Página {filtros.pagina} de {paginas}
              </span>
              <Button
                variante="secundaria"
                disabled={filtros.pagina >= paginas}
                onClick={() => mudarFiltro({ pagina: String(filtros.pagina + 1) })}
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

/** A busca vai para a URL ao enviar, não a cada tecla: cada letra seria uma consulta. */
function FormBusca({ inicial, onBuscar }) {
  const [texto, setTexto] = useState(inicial);
  return (
    <form
      className="campo admin-pedidos__busca"
      role="search"
      onSubmit={(evento) => {
        evento.preventDefault();
        onBuscar(texto.trim());
      }}
    >
      <label htmlFor="filtro-pedido-busca" className="t-label-caps">
        Buscar cliente
      </label>
      <div className="admin-pedidos__busca-linha">
        <input
          id="filtro-pedido-busca"
          type="search"
          className="campo__input"
          placeholder="Nome ou e-mail"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Button variante="secundaria" type="submit">
          Buscar
        </Button>
      </div>
    </form>
  );
}
