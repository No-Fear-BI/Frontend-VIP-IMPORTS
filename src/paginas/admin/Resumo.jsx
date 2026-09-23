/*
 * Resumo do painel (/admin/resumo — docs/para-o-frontend.md, seção 4.1: GET /admin/resumo).
 * Abre a cada login: seis números fixos, sem filtro nem paginação.
 */

import { Link } from 'react-router-dom';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { resumoService } from '../../services/resumoService.js';
import { selecoesAdminService } from '../../services/selecoesAdminService.js';
import { produtosAdminService } from '../../services/produtosAdminService.js';
import { listarPendentes } from '../../services/revisaoService.js';
import './Resumo.css';

const POR_PAGINA_SELECOES_RESUMO = 5;
const POR_PAGINA_ESGOTADOS_RESUMO = 5;
const formatoDataResumo = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

export default function AdminResumo() {
  const resumo = useRequisicao((sinal) => resumoService.obter(sinal), []);

  return (
    <section className="admin__pagina">
      <header className="admin-resumo__topo">
        <p className="t-label-caps-sm t-muted">/admin/resumo</p>
        <h1 className="t-headline-lg">Resumo</h1>
      </header>

      {resumo.carregando ? (
        <EsqueletoResumo />
      ) : resumo.erro ? (
        <EstadoErro erro={resumo.erro} onTentar={resumo.recarregar} titulo="Não conseguimos carregar o resumo." />
      ) : resumo.dados.totalProdutos === 0 ? (
        <EstadoVazio
          titulo="Nenhum produto cadastrado ainda."
          texto="Os números da loja aparecem aqui assim que o catálogo tiver a primeira peça."
          acao={{ rotulo: 'Cadastrar produto', para: '/admin/produtos/novo' }}
        />
      ) : (
        <ResumoCarregado dados={resumo.dados} />
      )}
    </section>
  );
}

function ResumoCarregado({ dados }) {
  return (
    <>
      <ul className="admin-resumo__grade">
        <Estatistica rotulo="Produtos" valor={dados.totalProdutos} />
        <Estatistica rotulo="Esgotados" valor={dados.produtosEsgotados} />
        <Estatistica rotulo="Ocultos" valor={dados.produtosOcultos} />
        <Estatistica rotulo="Seleções no mês" valor={dados.selecoesNoMes} />
        <Estatistica rotulo="Clientes" valor={dados.totalClientes} />
      </ul>

      <div className="admin-resumo__colunas">
        <div className="admin-resumo__bloco">
          <h2 className="t-headline-md">Produtos por marca</h2>
          {dados.porMarca.length === 0 ? (
            <p className="t-body-sm t-muted">Nenhuma marca cadastrada ainda.</p>
          ) : (
            <table className="admin-tabela">
              <thead>
                <tr>
                  <th scope="col" className="t-label-caps-sm">Marca</th>
                  <th scope="col" className="t-label-caps-sm">Produtos</th>
                </tr>
              </thead>
              <tbody>
                {dados.porMarca.map((marca) => (
                  <tr key={marca.marcaId}>
                    <td className="t-body-sm">{marca.nome}</td>
                    <td className="t-body-sm">{marca.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <BlocoEsgotadosRecentes />

        <div className="admin-resumo__lateral">
          <BlocoUltimasSelecoes />
          <BlocoAtalhos />
        </div>
      </div>
    </>
  );
}

function BlocoEsgotadosRecentes() {
  const produtos = useRequisicao(
    (sinal) =>
      produtosAdminService.listar({ status: 'esgotado', pagina: 1, porPagina: POR_PAGINA_ESGOTADOS_RESUMO }, sinal),
    [],
  );

  return (
    <div className="admin-resumo__bloco">
      <div className="admin-resumo__cabecalho-bloco">
        <h2 className="t-headline-md">Produtos esgotados recentes</h2>
        <Link to="/admin/produtos?status=esgotado" className="link-caps">ver todos →</Link>
      </div>

      {produtos.carregando ? (
        <div className="admin-resumo__lista-esqueleto" aria-busy="true" aria-label="Carregando produtos esgotados">
          {Array.from({ length: POR_PAGINA_ESGOTADOS_RESUMO }, (_, i) => (
            <Esqueleto key={i} className="esqueleto--linha" />
          ))}
        </div>
      ) : produtos.erro ? (
        <p className="t-body-sm t-muted">Não conseguimos carregar os produtos esgotados.</p>
      ) : produtos.dados.dados.length === 0 ? (
        <p className="t-body-sm t-muted">Nenhum produto esgotado no momento.</p>
      ) : (
        <ul className="admin-resumo__lista">
          {produtos.dados.dados.map((produto) => (
            <li key={produto.id}>
              <Link to={`/admin/produtos/${produto.id}`} className="admin-resumo__item">
                <span className="t-body-sm">{produto.nome}</span>
                <span className="t-label-caps-sm t-muted">
                  {produto.codigo} · {produto.marca.nome}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BlocoUltimasSelecoes() {
  const selecoes = useRequisicao(
    (sinal) => selecoesAdminService.listar({ pagina: 1, porPagina: POR_PAGINA_SELECOES_RESUMO }, sinal),
    [],
  );

  return (
    <div className="admin-resumo__bloco">
      <div className="admin-resumo__cabecalho-bloco">
        <h2 className="t-headline-md">Últimas seleções recebidas</h2>
        <Link to="/admin/selecoes" className="link-caps">ver todas →</Link>
      </div>

      {selecoes.carregando ? (
        <div className="admin-resumo__lista-esqueleto" aria-busy="true" aria-label="Carregando seleções recentes">
          {Array.from({ length: POR_PAGINA_SELECOES_RESUMO }, (_, i) => (
            <Esqueleto key={i} className="esqueleto--linha" />
          ))}
        </div>
      ) : selecoes.erro ? (
        <p className="t-body-sm t-muted">Não conseguimos carregar as seleções recentes.</p>
      ) : selecoes.dados.dados.length === 0 ? (
        <p className="t-body-sm t-muted">Nenhuma seleção recebida ainda.</p>
      ) : (
        <ul className="admin-resumo__lista">
          {selecoes.dados.dados.map((selecao) => (
            <li key={selecao.id}>
              <Link to={`/admin/selecoes/${selecao.id}`} className="admin-resumo__item">
                <span className="t-body-sm">{selecao.cliente.nome || selecao.cliente.email}</span>
                <span className="t-label-caps-sm t-muted">
                  {formatoDataResumo.format(new Date(selecao.criadoEm))} · {selecao.totalItens}{' '}
                  {selecao.totalItens === 1 ? 'peça' : 'peças'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BlocoAtalhos() {
  const revisao = useRequisicao((sinal) => listarPendentes({ pagina: 1, porPagina: 1 }, sinal), []);
  const pendentes = revisao.dados?.total;

  return (
    <div className="admin-resumo__bloco">
      <h2 className="t-headline-md">Atalhos</h2>
      <ul className="admin-resumo__atalhos">
        <li>
          <Link to="/admin/produtos/novo" className="link-caps">Novo produto →</Link>
        </li>
        <li>
          <Link to="/admin/banners" className="link-caps">Novo banner →</Link>
        </li>
        <li>
          <Link to="/admin/revisao" className="link-caps">
            Revisão{pendentes ? ` (${pendentes})` : ''} →
          </Link>
        </li>
      </ul>
    </div>
  );
}

function Estatistica({ rotulo, valor }) {
  return (
    <li className="admin-resumo__estatistica">
      <p className="t-headline-lg admin-resumo__valor">{valor.toLocaleString('pt-BR')}</p>
      <p className="t-label-caps-sm t-muted">{rotulo}</p>
    </li>
  );
}

function EsqueletoResumo() {
  return (
    <div className="estado-carregando" aria-busy="true" aria-label="Carregando resumo">
      <ul className="admin-resumo__grade">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="admin-resumo__estatistica">
            <Esqueleto className="admin-resumo__esqueleto-valor" />
            <Esqueleto className="esqueleto--linha esqueleto--curta" />
          </li>
        ))}
      </ul>
      <div className="admin-resumo__colunas">
        <Esqueleto className="esqueleto--bloco" />
        <Esqueleto className="esqueleto--bloco" />
        <div className="admin-resumo__lateral">
          <Esqueleto className="esqueleto--bloco" />
          <Esqueleto className="esqueleto--bloco" />
        </div>
      </div>
    </div>
  );
}
