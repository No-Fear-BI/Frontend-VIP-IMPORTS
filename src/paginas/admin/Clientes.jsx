/*
 * Clientes cadastrados (/admin/clientes). Busca por nome/e-mail e paginação, ambos na URL. Tela
 * só de consulta: sem edição nem exclusão (docs/para-o-frontend.md, "Painel administrativo —
 * destaques e consultas").
 */

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { clientesAdminService } from '../../services/clientesAdminService.js';
import './Clientes.css';

const POR_PAGINA = 20;

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminClientes() {
  const [params, setParams] = useSearchParams();

  const filtros = useMemo(
    () => ({ busca: params.get('busca') || '', pagina: Math.max(1, Number(params.get('pagina')) || 1) }),
    [params],
  );
  const temBusca = Boolean(filtros.busca);

  const lista = useRequisicao(
    (sinal) => clientesAdminService.listar({ ...filtros, porPagina: POR_PAGINA }, sinal),
    [filtros.busca, filtros.pagina],
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

  const total = lista.dados?.paginacao.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <section className="admin__pagina">
      <header className="admin-clientes__topo">
        <h1 className="t-headline-lg">Clientes</h1>
        <p className="t-body-sm t-muted admin-clientes__ajuda">
          Quem já se identificou na loja. Sem edição por aqui — é só consulta.
        </p>
      </header>

      <FormBusca key={filtros.busca} inicial={filtros.busca} onBuscar={(busca) => mudarFiltro({ busca })} />

      <p className="t-body-sm t-muted admin-clientes__contagem" aria-live="polite">
        {lista.carregando || lista.erro
          ? ' '
          : `${total} ${total === 1 ? 'cliente' : 'clientes'}${temBusca ? ' com esta busca' : ''}`}
        {temBusca && (
          <button type="button" className="link-caps admin-clientes__limpar" onClick={limpar}>
            Limpar busca
          </button>
        )}
      </p>

      {lista.carregando ? (
        <div className="estado-carregando" aria-busy="true" aria-label="Carregando clientes">
          {Array.from({ length: 6 }, (_, i) => (
            <Esqueleto key={i} className="esqueleto--linha admin-clientes__esqueleto" />
          ))}
        </div>
      ) : lista.erro ? (
        <EstadoErro erro={lista.erro} onTentar={lista.recarregar} titulo="Não conseguimos carregar os clientes." />
      ) : lista.dados.dados.length === 0 ? (
        temBusca ? (
          <EstadoVazio
            titulo="Nenhum cliente com esta busca."
            texto="Busque por outro nome ou e-mail."
            acao={{ rotulo: 'Limpar busca', onClick: limpar }}
          />
        ) : filtros.pagina > 1 ? (
          <EstadoVazio
            titulo="Esta página não existe mais."
            texto="A lista ficou mais curta desde que o link foi aberto."
            acao={{ rotulo: 'Ir para a primeira página', onClick: () => mudarFiltro({ pagina: '' }) }}
          />
        ) : (
          <EstadoVazio
            titulo="Nenhum cliente cadastrado ainda."
            texto="Quando alguém se identificar na loja para consultar valores, aparece aqui."
          />
        )
      ) : (
        <>
          <table className="admin-tabela admin-clientes__tabela">
            <thead>
              <tr>
                <th scope="col" className="t-label-caps-sm">Nome</th>
                <th scope="col" className="t-label-caps-sm">E-mail</th>
                <th scope="col" className="t-label-caps-sm">Telefone</th>
                <th scope="col" className="t-label-caps-sm">Seleções</th>
                <th scope="col" className="t-label-caps-sm">Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {lista.dados.dados.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="t-body-sm">{cliente.nome}</td>
                  <td className="t-body-sm">{cliente.email}</td>
                  <td className="t-body-sm">
                    {cliente.telefone || <span className="t-muted">não informado</span>}
                  </td>
                  <td className="t-body-sm">{cliente.totalSelecoes}</td>
                  <td className="t-body-sm">
                    {cliente.ultimoAcessoEm ? formatoData.format(new Date(cliente.ultimoAcessoEm)) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginas > 1 && (
            <nav className="admin-clientes__paginacao" aria-label="Páginas">
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
      className="campo admin-clientes__busca"
      role="search"
      onSubmit={(evento) => {
        evento.preventDefault();
        onBuscar(texto.trim());
      }}
    >
      <label htmlFor="filtro-cliente-busca" className="t-label-caps">
        Buscar
      </label>
      <div className="admin-clientes__busca-linha">
        <input
          id="filtro-cliente-busca"
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
