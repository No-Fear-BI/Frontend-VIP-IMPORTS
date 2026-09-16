import { catalogoService } from '../services/catalogoService.js';
import CabecalhoSecao from '../components/CabecalhoSecao.jsx';
import { Esqueleto, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import { useRequisicao } from '../hooks/useRequisicao.js';
import { CartaoCategoria } from './Home.jsx';

// As duas coleções são fixas no backend (não existe CRUD de coleção).
const COLECOES = [
  { slug: 'feminino', nome: 'Feminina' },
  { slug: 'masculino', nome: 'Masculina' },
];

export default function Categorias() {
  return (
    <div className="container">
      <header className="topo-pagina">
        <p className="t-label-caps t-muted">Por tipo de peça</p>
        <h1 className="t-headline-lg">Categorias</h1>
      </header>
      {COLECOES.map((colecao) => (
        <CategoriasDaColecao key={colecao.slug} colecao={colecao} />
      ))}
    </div>
  );
}

function CategoriasDaColecao({ colecao }) {
  const { dados, erro, carregando, recarregar } = useRequisicao(
    (sinal) => catalogoService.categoriasDaColecao(colecao.slug, sinal),
    [colecao.slug],
  );

  return (
    <section className="secao" aria-labelledby={`titulo-${colecao.slug}`}>
      <CabecalhoSecao
        id={`titulo-${colecao.slug}`}
        rotulo="Coleção"
        titulo={colecao.nome}
        link={{ rotulo: `Ver toda a coleção ${colecao.nome.toLowerCase()}`, para: `/${colecao.slug}` }}
      />
      {carregando ? (
        <div className="grade-categorias">
          {Array.from({ length: 4 }, (_, i) => (
            <Esqueleto key={i} className="esqueleto--quadrado" />
          ))}
        </div>
      ) : erro ? (
        <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos carregar as categorias." />
      ) : dados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma categoria nesta coleção ainda."
          acao={{ rotulo: `Ver coleção ${colecao.nome.toLowerCase()}`, para: `/${colecao.slug}` }}
        />
      ) : (
        <ul className="grade-categorias">
          {dados.map((categoria) => (
            <li key={categoria.id}>
              <CartaoCategoria categoria={categoria} colecao={colecao} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
