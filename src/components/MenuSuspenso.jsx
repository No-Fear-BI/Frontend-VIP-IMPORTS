import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/cn.js';
import { catalogoService } from '../services/catalogoService.js';
import { useRequisicao } from '../hooks/useRequisicao.js';
import Carregando from './Carregando.jsx';
import { IconeSeta } from './Icones.jsx';
import './MenuSuspenso.css';

/*
 * Janela que abre sob "Marcas" e "Categorias" no cabeçalho (docs/decisoes-frontend.md, seção 38):
 * os nomes em colunas e "Ver todas", que leva à página de cada uma. Quem abre e fecha é o
 * Cabecalho; aqui fica só o conteúdo. A busca acontece na primeira vez que a janela abre, e o
 * resultado fica para o resto da visita, porque o cabeçalho não desmonta.
 */

// Até 8 nomes por coluna; passando disso, as colunas crescem por igual até o limite de cada lista.
const LINHAS_POR_COLUNA = 8;

// As mesmas de paginas/Categorias.jsx: as duas coleções são fixas no backend.
const COLECOES = [
  { slug: 'feminino', nome: 'Feminina' },
  { slug: 'masculino', nome: 'Masculina' },
];

const CONTEUDO = {
  marcas: { pagina: '/marcas', Lista: ListaMarcas },
  categorias: { pagina: '/categorias', Lista: ListaCategorias },
};

export default function MenuSuspenso({ id, tipo, aberto }) {
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    if (aberto) setMontado(true);
  }, [aberto]);

  const { pagina, Lista } = CONTEUDO[tipo];
  return (
    <div id={id} className={cn('menu-suspenso', aberto && 'menu-suspenso--aberto')}>
      {montado && (
        <>
          <Lista />
          <div className="menu-suspenso__rodape">
            <Link to={pagina} className="link-caps">
              Ver todas <IconeSeta />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function ListaMarcas() {
  const requisicao = useRequisicao((sinal) => catalogoService.marcas(sinal), []);
  const marcas = requisicao.dados ? [...requisicao.dados].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')) : [];

  return (
    <EstadosDaLista requisicao={requisicao} rotulo="Carregando marcas…" vazio={marcas.length === 0 && 'Nenhuma marca por enquanto.'}>
      <Colunas itens={marcas} maxColunas={3} para={(marca) => `/marcas/${marca.slug}`} />
    </EstadosDaLista>
  );
}

function ListaCategorias() {
  const requisicao = useRequisicao(
    (sinal) =>
      Promise.all(
        COLECOES.map((colecao) =>
          catalogoService.categoriasDaColecao(colecao.slug, sinal).then((categorias) => ({ colecao, categorias })),
        ),
      ),
    [],
  );
  const grupos = requisicao.dados?.filter((grupo) => grupo.categorias.length > 0) ?? [];

  return (
    <EstadosDaLista
      requisicao={requisicao}
      rotulo="Carregando categorias…"
      vazio={grupos.length === 0 && 'Nenhuma categoria por enquanto.'}
    >
      <div className="menu-suspenso__grupos">
        {grupos.map(({ colecao, categorias }) => (
          <div key={colecao.slug} className="menu-suspenso__grupo">
            <p className="t-label-caps-sm t-muted">{colecao.nome}</p>
            {/* O mesmo destino do cartão de categoria (CartaoCategoria, em paginas/Home.jsx). */}
            <Colunas
              itens={categorias}
              maxColunas={2}
              para={(categoria) => `/produtos?colecao=${colecao.slug}&categoria=${categoria.slug}`}
            />
          </div>
        ))}
      </div>
    </EstadosDaLista>
  );
}

// Os três estados em linha, como nos filtros da listagem: a janela é pequena demais para o
// carregador de bloco ou para a sacola do erro.
function EstadosDaLista({ requisicao, rotulo, vazio, children }) {
  if (requisicao.carregando) return <Carregando variante="compacto" rotulo={rotulo} />;
  if (requisicao.erro) {
    return (
      <div className="menu-suspenso__estado">
        <p className="t-body-sm">Não conseguimos carregar esta lista.</p>
        <button type="button" className="link-caps" onClick={requisicao.recarregar}>
          Tentar de novo
        </button>
      </div>
    );
  }
  if (vazio) return <p className="menu-suspenso__estado t-body-sm t-muted">{vazio}</p>;
  return children;
}

// Preenche coluna por coluna, de cima para baixo, como a referência.
function Colunas({ itens, maxColunas, para }) {
  const linhas =
    itens.length <= LINHAS_POR_COLUNA ? itens.length : Math.max(LINHAS_POR_COLUNA, Math.ceil(itens.length / maxColunas));
  return (
    <ul className="menu-suspenso__lista" style={{ '--linhas-menu': linhas }}>
      {itens.map((item) => (
        <li key={item.id}>
          <Link to={para(item)} className="menu-suspenso__link t-body-sm">
            {item.nome}
          </Link>
        </li>
      ))}
    </ul>
  );
}
