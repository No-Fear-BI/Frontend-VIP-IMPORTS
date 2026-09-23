/*
 * Detalhe de uma seleção (/admin/selecoes/:id).
 *
 * Os itens são dado CONGELADO (docs/para-o-frontend.md, "Painel administrativo — destaques e
 * consultas"): `codigo`, `nome`, `marca`, `categoria`, `colecao`, `imagemUrl` e `variacao` são
 * cópias do que o cliente viu no envio, não um JOIN com o catálogo de hoje. Se o produto foi
 * excluído depois, `produtoId` vem `null` — o item continua aparecendo normalmente, só sem link
 * para o produto (nada de esconder o item ou tentar buscar por esse id).
 */

import { Link, useLocation, useParams } from 'react-router-dom';
import { Esqueleto, EstadoErro } from '../../components/Estados.jsx';
import { FotoProduto } from '../../components/Produto.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { selecoesAdminService } from '../../services/selecoesAdminService.js';
import { formatoDataSelecao } from './Selecoes.jsx';
import './Selecoes.css';

export default function AdminSelecaoDetalhe() {
  const { id } = useParams();
  const location = useLocation();
  const voltarPara = `/admin/selecoes${location.state?.voltarPara || ''}`;

  const selecao = useRequisicao((sinal) => selecoesAdminService.obter(id, sinal), [id]);

  return (
    <section className="admin__pagina">
      <Link to={voltarPara} className="link-caps admin-selecao__voltar">
        ← Seleções
      </Link>

      {selecao.carregando ? (
        <div className="estado-carregando" aria-busy="true" aria-label="Carregando seleção">
          <Esqueleto className="esqueleto--titulo" />
          <Esqueleto className="esqueleto--linha esqueleto--curta" />
          <Esqueleto className="esqueleto--bloco" />
        </div>
      ) : selecao.erro ? (
        <EstadoErro
          erro={selecao.erro}
          onTentar={selecao.recarregar}
          titulo="Não conseguimos abrir esta seleção."
        />
      ) : (
        <SelecaoCarregada selecao={selecao.dados} />
      )}
    </section>
  );
}

function SelecaoCarregada({ selecao }) {
  return (
    <>
      <header className="admin-selecao__topo">
        <p className="t-label-caps-sm t-muted">{formatoDataSelecao.format(new Date(selecao.criadoEm))}</p>
        <h1 className="t-headline-lg">
          {selecao.totalItens ?? selecao.itens.length} {(selecao.totalItens ?? selecao.itens.length) === 1 ? 'peça' : 'peças'}
        </h1>
      </header>

      <div className="admin-selecao__cliente">
        <p className="t-label-caps-sm t-muted">Cliente</p>
        <p className="t-body-lg">{selecao.cliente.nome}</p>
        <p className="t-body-sm t-muted">{selecao.cliente.email}</p>
        {selecao.cliente.telefone && <p className="t-body-sm t-muted">{selecao.cliente.telefone}</p>}
      </div>

      <ul className="admin-selecao__itens">
        {selecao.itens.map((item, i) => (
          <li key={`${item.codigo}-${i}`} className="admin-selecao__item">
            <FotoProduto url={item.imagemUrl} alt="" className="admin-selecao__item-foto" />
            <div className="admin-selecao__item-info">
              <p className="t-label-caps-sm t-muted">{item.marca}</p>
              {item.produtoId ? (
                <Link to={`/admin/produtos/${item.produtoId}`} className="admin-selecao__item-link">
                  <span className="t-codigo">{item.codigo}</span> {item.nome}
                </Link>
              ) : (
                <p className="t-body-sm">
                  <span className="t-codigo">{item.codigo}</span> {item.nome}
                  <span className="t-label-caps-sm t-muted admin-selecao__item-excluido"> · produto excluído</span>
                </p>
              )}
              <p className="t-body-sm t-muted">
                {item.categoria}
                {item.colecao && ` · ${item.colecao}`}
                {item.variacao && ` · ${item.variacao}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
