import { Fragment } from 'react';
import { catalogoService } from '../services/catalogoService.js';
import CabecalhoSecao from '../components/CabecalhoSecao.jsx';
import Carregando from '../components/Carregando.jsx';
import DivisorOnda from '../components/DivisorOnda.jsx';
import { EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import { useRequisicao } from '../hooks/useRequisicao.js';
import { CartaoCategoria } from './Home.jsx';

// As duas coleções são fixas no backend (não existe CRUD de coleção).
const COLECOES = [
  { slug: 'feminino', nome: 'Feminina' },
  { slug: 'masculino', nome: 'Masculina' },
];

// Cada bloco tem o próprio .container para a onda entre Feminina e Masculina ocupar a largura toda
// da tela, como na home.
export default function Categorias() {
  return (
    <>
      <header className="container topo-pagina">
        <p className="t-label-caps t-muted">Por tipo de peça</p>
        <h1 className="t-headline-lg">Categorias</h1>
      </header>
      {COLECOES.map((colecao, i) => (
        <Fragment key={colecao.slug}>
          {i > 0 && <DivisorOnda />}
          <CategoriasDaColecao colecao={colecao} />
        </Fragment>
      ))}
    </>
  );
}

function CategoriasDaColecao({ colecao }) {
  const { dados, erro, carregando, recarregar } = useRequisicao(
    (sinal) => catalogoService.categoriasDaColecao(colecao.slug, sinal),
    [colecao.slug],
  );

  return (
    <section className="container secao" aria-labelledby={`titulo-${colecao.slug}`}>
      <CabecalhoSecao
        id={`titulo-${colecao.slug}`}
        rotulo="Coleção"
        titulo={colecao.nome}
        link={{ rotulo: `Ver toda a coleção ${colecao.nome.toLowerCase()}`, para: `/${colecao.slug}` }}
      />
      {carregando ? (
        <Carregando rotulo="Carregando categorias…" />
      ) : erro ? (
        <EstadoErro sacola erro={erro} onTentar={recarregar} titulo="Não conseguimos carregar as categorias." />
      ) : dados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma categoria nesta coleção ainda."
          acao={{ rotulo: `Ver coleção ${colecao.nome.toLowerCase()}`, para: `/${colecao.slug}` }}
        />
      ) : (
        <ul className="grade-categorias">
          {dados.map((categoria) => (
            <li key={categoria.id}>
              <CartaoCategoria categoria={categoria} colecao={colecao} degrade />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
