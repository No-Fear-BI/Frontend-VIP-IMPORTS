/*
 * Seleções recebidas no painel (/admin/selecoes). Lista, mais recentes primeiro, com detalhe ao
 * clicar num item (Selecao.jsx).
 *
 * O que o backend impõe (docs/para-o-frontend.md, "Painel administrativo — destaques e
 * consultas"):
 * - A paginação é por PÁGINA, não por cursor (`pagina`/`porPagina`) — igual ao resto do painel,
 *   diferente da loja (`selecoesService.historico`, que pagina por cursor).
 * - Os itens de cada seleção são dado CONGELADO: não são um JOIN com o catálogo de hoje. Ver
 *   Selecao.jsx para o detalhe disso.
 */

import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { selecoesAdminService } from '../../services/selecoesAdminService.js';
import './Selecoes.css';

const POR_PAGINA = 20;

export const formatoDataSelecao = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' });

export default function AdminSelecoes() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const pagina = Math.max(1, Number(params.get('pagina')) || 1);

  const lista = useRequisicao(
    (sinal) => selecoesAdminService.listar({ pagina, porPagina: POR_PAGINA }, sinal),
    [pagina],
  );

  function irPara(proxima) {
    const novo = new URLSearchParams(params);
    if (proxima > 1) novo.set('pagina', String(proxima));
    else novo.delete('pagina');
    setParams(novo);
  }

  const total = lista.dados?.paginacao.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <section className="admin__pagina">
      <header className="admin-selecoes__topo">
        <p className="t-label-caps-sm t-muted">/admin/selecoes</p>
        <h1 className="t-headline-lg">Seleções</h1>
        <p className="t-body-sm t-muted admin-selecoes__ajuda">
          O que os clientes mandaram pelo WhatsApp, mais recente primeiro.
        </p>
      </header>

      {lista.carregando ? (
        <div className="estado-carregando" aria-busy="true" aria-label="Carregando seleções">
          {Array.from({ length: 6 }, (_, i) => (
            <Esqueleto key={i} className="esqueleto--linha admin-selecoes__esqueleto" />
          ))}
        </div>
      ) : lista.erro ? (
        <EstadoErro erro={lista.erro} onTentar={lista.recarregar} titulo="Não conseguimos carregar as seleções." />
      ) : lista.dados.dados.length === 0 ? (
        pagina > 1 ? (
          <EstadoVazio
            titulo="Esta página não existe mais."
            texto="A lista ficou mais curta desde que o link foi aberto."
            acao={{ rotulo: 'Ir para a primeira página', onClick: () => irPara(1) }}
          />
        ) : (
          <EstadoVazio
            titulo="Nenhuma seleção recebida ainda."
            texto="Quando um cliente chamar o atendimento pelo WhatsApp, a seleção aparece aqui."
          />
        )
      ) : (
        <>
          <table className="admin-tabela admin-selecoes__tabela">
            <thead>
              <tr>
                <th scope="col" className="t-label-caps-sm">Data</th>
                <th scope="col" className="t-label-caps-sm">Cliente</th>
                <th scope="col" className="t-label-caps-sm">Peças</th>
                <th scope="col"><span className="visualmente-oculto">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.dados.dados.map((selecao) => (
                <tr key={selecao.id}>
                  <td className="t-body-sm">{formatoDataSelecao.format(new Date(selecao.criadoEm))}</td>
                  <td>
                    <p className="t-body-sm">{selecao.cliente.nome}</p>
                    <p className="t-label-caps-sm t-muted">{selecao.cliente.email}</p>
                  </td>
                  <td className="t-body-sm">
                    {selecao.totalItens} {selecao.totalItens === 1 ? 'peça' : 'peças'}
                  </td>
                  <td className="admin-selecoes__acoes">
                    <Link
                      to={`/admin/selecoes/${selecao.id}`}
                      state={{ voltarPara: location.search }}
                      className="link-caps"
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginas > 1 && (
            <nav className="admin-selecoes__paginacao" aria-label="Páginas">
              <Button variante="secundaria" disabled={pagina <= 1} onClick={() => irPara(pagina - 1)}>
                Anterior
              </Button>
              <span className="t-body-sm">
                Página {pagina} de {paginas}
              </span>
              <Button variante="secundaria" disabled={pagina >= paginas} onClick={() => irPara(pagina + 1)}>
                Próxima
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
