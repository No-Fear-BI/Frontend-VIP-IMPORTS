import { Link } from 'react-router-dom';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { resumoService } from '../../services/resumoService.js';
import { listarPendentes } from '../../services/revisaoService.js';
import './Resumo.css';

const ITENS_POR_BLOCO = 4;
const formatoHoje = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

function hojePorExtenso() {
  const texto = formatoHoje.format(new Date());
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** A rota da revisão às vezes vem envelopada em `dados` (mesmo desembrulho do Revisao.jsx). */
function filaDaResposta(dados) {
  return dados?.dados || dados;
}

export default function AdminResumo() {
  const resumo = useRequisicao((sinal) => resumoService.obter(sinal), []);
  // Um pedido só serve o número "Em revisão" e a lista da fila.
  const fila = useRequisicao((sinal) => listarPendentes({ pagina: 1, porPagina: ITENS_POR_BLOCO }, sinal), []);
  const totalFila = filaDaResposta(fila.dados)?.total;

  return (
    <section className="admin__pagina admin-resumo">
      <header className="admin-resumo__topo">
        <h1 className="t-headline-lg">Resumo</h1>
        <p className="t-body-sm t-muted">{hojePorExtenso()}</p>
      </header>

      {resumo.carregando ? (
        <EsqueletoResumo />
      ) : resumo.erro ? (
        <EstadoErro erro={resumo.erro} onTentar={resumo.recarregar} titulo="Não conseguimos carregar o resumo." />
      ) : (
        <>
          <ul className="admin-resumo__numeros">
            <Numero
              rotulo="Publicados"
              valor={resumo.dados.totalProdutos - resumo.dados.produtosOcultos}
            />
            <Numero rotulo="Em revisão" valor={totalFila} carregando={fila.carregando} />
            <Numero rotulo="Encomendar" valor={resumo.dados.produtosEsgotados} />
            <Numero rotulo="Clientes" valor={resumo.dados.totalClientes} />
          </ul>

          {resumo.dados.totalProdutos === 0 && !totalFila ? (
            <EstadoVazio
              titulo="Nenhum produto cadastrado ainda."
              texto="As filas aparecem aqui assim que chegar a primeira peça."
              acao={{ rotulo: 'Cadastrar produto', para: '/admin/produtos/novo' }}
            />
          ) : (
            <div className="admin-resumo__colunas">
              <BlocoFilaRevisao estado={fila} />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function BlocoFilaRevisao({ estado }) {
  const fila = filaDaResposta(estado.dados);
  const itens = fila?.items || fila?.itens || [];

  return (
    <Bloco titulo="Aguardando revisão" para="/admin/revisao" acao="ver fila">
      {estado.carregando ? (
        <ListaEsqueleto rotulo="Carregando a fila de revisão" />
      ) : estado.erro ? (
        <p className="t-body-sm t-muted">Não conseguimos carregar a fila de revisão.</p>
      ) : itens.length === 0 ? (
        <p className="t-body-sm t-muted">Nada aguardando revisão.</p>
      ) : (
        <ul className="admin-resumo__lista">
          {itens.map((item) => (
            <li key={item.id}>
              <Link to="/admin/revisao" className="admin-resumo__item admin-resumo__item--com-foto">
                <img
                  className="admin-resumo__miniatura"
                  loading="lazy"
                  alt=""
                  src={`/api/v1/admin/revisao/imagem?url=${encodeURIComponent(item.image)}&source=${encodeURIComponent(item.sourceUrl)}`}
                />
                <span className="admin-resumo__texto">
                  <span className="t-body-sm">{item.translatedName || item.name}</span>
                  <span className="t-label-caps-sm t-muted">
                    {[item.supplier, item.category].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Bloco>
  );
}

function Bloco({ titulo, para, acao, children }) {
  return (
    <div className="admin-resumo__bloco">
      <div className="admin-resumo__cabecalho-bloco">
        <h2 className="t-headline-md">{titulo}</h2>
        <Link to={para} className="link-caps">
          {acao} →
        </Link>
      </div>
      {children}
    </div>
  );
}

function Numero({ rotulo, valor, carregando = false }) {
  return (
    <li className="admin-resumo__numero">
      <p className="t-label-caps-sm t-muted">{rotulo}</p>
      {carregando || valor == null ? (
        <Esqueleto className="admin-resumo__esqueleto-valor" />
      ) : (
        <p className="t-headline-lg admin-resumo__valor">{valor.toLocaleString('pt-BR')}</p>
      )}
    </li>
  );
}

function ListaEsqueleto({ rotulo }) {
  return (
    <div className="admin-resumo__lista-esqueleto" aria-busy="true" aria-label={rotulo}>
      {Array.from({ length: ITENS_POR_BLOCO }, (_, i) => (
        <Esqueleto key={i} className="esqueleto--linha" />
      ))}
    </div>
  );
}

function EsqueletoResumo() {
  return (
    <div className="estado-carregando" aria-busy="true" aria-label="Carregando resumo">
      <ul className="admin-resumo__numeros">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="admin-resumo__numero">
            <Esqueleto className="esqueleto--linha esqueleto--curta" />
            <Esqueleto className="admin-resumo__esqueleto-valor" />
          </li>
        ))}
      </ul>
      <div className="admin-resumo__colunas">
        <Esqueleto className="esqueleto--bloco" />
      </div>
    </div>
  );
}
