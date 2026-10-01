/*
 * Listagem pública (GET /produtos). Serve Feminino, Masculino, Novidades, busca e página de marca.
 * Filtros vivem na URL (?colecao=&categoria=&marca=a,b&busca=&ordem=), então o link é compartilhável.
 * Novidades (modo 'novidades') manda `novidades: true`: só peças dos últimos 14 dias (regra do
 * cliente, 29/09/2026), na primeira página e em "Carregar mais". Não vem da URL.
 * Paginação por CURSOR: "Carregar mais" manda o proximoCursor da página anterior.
 * `categoria` vai sozinha ou com `colecao`: desde a 0015 o slug de categoria é único na tabela.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { catalogoService } from '../services/catalogoService.js';
import { ErroGeral } from '../components/ui/Field.jsx';
import Modal from '../components/ui/Modal.jsx';
import { EsqueletoGrade, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import { IconeFiltro } from '../components/Icones.jsx';
import { CartaoProduto } from '../components/Produto.jsx';
import { useRequisicao } from '../hooks/useRequisicao.js';
import Button from '../components/ui/Button.jsx';
import './Listagem.css';

const POR_PAGINA = 24;

const COLECOES = [
  { slug: 'feminino', nome: 'Feminina' },
  { slug: 'masculino', nome: 'Masculina' },
];

/**
 * @param {{ modo: 'colecao'|'todos'|'novidades'|'busca'|'marca', colecaoFixa?: string }} props
 */
export default function Listagem({ modo, colecaoFixa }) {
  const { slug: marcaDaRota } = useParams();
  const [params, setParams] = useSearchParams();

  const filtros = useMemo(
    () => ({
      colecao: colecaoFixa || params.get('colecao') || '',
      categoria: params.get('categoria') || '',
      marca: modo === 'marca' ? marcaDaRota : params.get('marca') || '',
      cor: params.get('cor') || '',
      busca: params.get('busca') || '',
      // '' some da query (apiClient); só o modo 'novidades' manda ?novidades=true.
      novidades: modo === 'novidades' ? true : '',
      ordem: params.get('ordem') || 'recentes',
    }),
    [params, colecaoFixa, modo, marcaDaRota],
  );

  const chave = JSON.stringify(filtros);
  const primeiraPagina = useRequisicao(
    (sinal) =>
      catalogoService.produtos(
        { ...filtros, categoria: filtros.categoria, porPagina: POR_PAGINA },
        sinal,
      ),
    [chave],
  );

  const [maisPaginas, setMaisPaginas] = useState({ itens: [], cursor: null, carregando: false, erro: null });

  useEffect(() => {
    setMaisPaginas({ itens: [], cursor: null, carregando: false, erro: null });
  }, [chave]);

  const marcas = useRequisicao((sinal) => catalogoService.marcas(sinal), []);
  const cores = useRequisicao((sinal) => catalogoService.cores(sinal), []);
  const categorias = useRequisicao(
    (sinal) => (filtros.colecao ? catalogoService.categoriasDaColecao(filtros.colecao, sinal) : Promise.resolve([])),
    [filtros.colecao],
  );

  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  function mudarFiltro(mudancas) {
    const proximo = new URLSearchParams(params);
    for (const [chaveFiltro, valor] of Object.entries(mudancas)) {
      if (valor) proximo.set(chaveFiltro, valor);
      else proximo.delete(chaveFiltro);
    }
    if ('colecao' in mudancas) proximo.delete('categoria');
    setParams(proximo, { replace: true });
  }

  function limparFiltros() {
    const proximo = new URLSearchParams();
    if (filtros.busca) proximo.set('busca', filtros.busca);
    setParams(proximo, { replace: true });
    setFiltrosAbertos(false);
  }

  const cursorAtual = maisPaginas.cursor ?? primeiraPagina.dados?.paginacao.proximoCursor;

  async function carregarMais() {
    setMaisPaginas((m) => ({ ...m, carregando: true, erro: null }));
    try {
      const pagina = await catalogoService.produtos({
        ...filtros,
        categoria: filtros.categoria,
        porPagina: POR_PAGINA,
        cursor: cursorAtual,
      });
      setMaisPaginas((m) => ({
        itens: [...m.itens, ...pagina.dados],
        cursor: pagina.paginacao.proximoCursor || '',
        carregando: false,
        erro: null,
      }));
    } catch (erro) {
      setMaisPaginas((m) => ({ ...m, carregando: false, erro }));
    }
  }

  const nomeMarca = marcas.dados?.find((m) => m.slug === filtros.marca)?.nome;
  const titulo = tituloDaPagina(modo, filtros, nomeMarca);
  const produtos = primeiraPagina.dados ? [...primeiraPagina.dados.dados, ...maisPaginas.itens] : [];
  const total = primeiraPagina.dados?.paginacao.total ?? 0;
  const temFiltroAtivo = Boolean(
    (!colecaoFixa && filtros.colecao) ||
      filtros.categoria ||
      filtros.cor ||
      (modo !== 'marca' && filtros.marca),
  );

  const painelFiltros = (
    <PainelFiltros
      modo={modo}
      filtros={filtros}
      colecaoFixa={colecaoFixa}
      marcas={marcas}
      cores={cores}
      categorias={categorias}
      onMudar={mudarFiltro}
      onLimpar={limparFiltros}
      temFiltroAtivo={temFiltroAtivo}
    />
  );

  return (
    <div className="container listagem">
      <header className="topo-pagina">
        <nav className="trilha t-label-caps-sm" aria-label="Você está em">
          <Link to="/">Início</Link>
          <span aria-hidden>/</span>
          <span>{titulo.trilha}</span>
        </nav>
        <h1 className="t-headline-lg">{titulo.principal}</h1>
      </header>

      <div className="listagem__barra">
        <p className="t-body-sm t-muted listagem__total" aria-live="polite">
          {primeiraPagina.carregando
            ? 'Carregando peças…'
            : primeiraPagina.erro
              ? ''
              : `${total} ${total === 1 ? 'peça' : 'peças'}`}
        </p>
        <Button variante="secundaria" className="listagem__abrir-filtros" onClick={() => setFiltrosAbertos(true)}>
          <IconeFiltro />
          Filtrar{temFiltroAtivo ? ' (ativos)' : ''}
        </Button>
        <label className="listagem__ordem t-label-caps-sm">
          <span>Ordenar</span>
          <select value={filtros.ordem} onChange={(e) => mudarFiltro({ ordem: e.target.value === 'recentes' ? '' : e.target.value })}>
            <option value="recentes">Mais recentes</option>
            <option value="nome">Nome (A–Z)</option>
          </select>
        </label>
      </div>

      <div className="listagem__corpo">
        <aside className="listagem__lateral" aria-label="Filtros">
          {painelFiltros}
        </aside>

        <section className="listagem__resultados" aria-label="Peças">
          {primeiraPagina.carregando ? (
            <EsqueletoGrade quantidade={9} className="grade-produtos grade-produtos--listagem" />
          ) : primeiraPagina.erro ? (
            <EstadoErro erro={primeiraPagina.erro} onTentar={primeiraPagina.recarregar} />
          ) : produtos.length === 0 ? (
            <EstadoVazio
              titulo={
                modo === 'novidades'
                  ? 'Nenhuma novidade por enquanto.'
                  : filtros.busca
                    ? `Nada encontrado para "${filtros.busca}".`
                    : temFiltroAtivo
                      ? 'Nenhuma peça com esses filtros.'
                      : 'Nenhuma peça por aqui ainda.'
              }
              texto={
                modo === 'novidades'
                  ? 'As novidades ficam aqui por duas semanas.'
                  : filtros.busca
                    ? 'Tente o código da peça (como X030), o nome da marca ou uma palavra mais curta.'
                    : temFiltroAtivo
                      ? 'Tire um filtro para ver mais peças.'
                      : 'O catálogo está sendo atualizado. Volte em breve.'
              }
              acao={
                modo === 'novidades'
                  ? { rotulo: 'Ver todas as peças', para: '/todos' }
                  : temFiltroAtivo
                    ? { rotulo: 'Limpar filtros', onClick: limparFiltros }
                    : modo === 'todos'
                      ? { rotulo: 'Voltar ao início', para: '/' }
                      : { rotulo: 'Ver todas as peças', para: '/todos' }
              }
            />
          ) : (
            <>
              <div className="grade-produtos grade-produtos--listagem">
                {produtos.map((produto, i) => (
                  <CartaoProduto key={produto.id} produto={produto} carregamento={i < 6 ? 'eager' : 'lazy'} />
                ))}
              </div>
              <div className="listagem__mais">
                <p className="t-body-sm t-muted">
                  Mostrando {produtos.length} de {total}
                </p>
                {maisPaginas.erro && <ErroGeral>{maisPaginas.erro.mensagem}</ErroGeral>}
                {cursorAtual && (
                  <Button
                    variante="secundaria"
                    onClick={carregarMais}
                    disabled={maisPaginas.carregando}
                  >
                    {maisPaginas.carregando ? 'Carregando…' : maisPaginas.erro ? 'Tentar de novo' : 'Carregar mais peças'}
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <Modal aberto={filtrosAbertos} onFechar={() => setFiltrosAbertos(false)} titulo="Filtros" lateral>
        <div className="listagem__gaveta">
          <h2 className="t-headline-md">Filtros</h2>
          {painelFiltros}
          <Button variante="primaria" largo onClick={() => setFiltrosAbertos(false)}>
            Ver {total} {total === 1 ? 'peça' : 'peças'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function tituloDaPagina(modo, filtros, nomeMarca) {
  if (modo === 'colecao') {
    const nome = COLECOES.find((c) => c.slug === filtros.colecao)?.nome || '';
    return { principal: `Coleção ${nome}`, trilha: nome === 'Feminina' ? 'Feminino' : 'Masculino' };
  }
  if (modo === 'todos') return { principal: 'Todas as peças', trilha: 'Todos' };
  if (modo === 'novidades') return { principal: 'Novidades', trilha: 'Novidades' };
  if (modo === 'marca') return { principal: nomeMarca || 'Marca', trilha: 'Marcas' };
  if (filtros.busca) return { principal: `Resultados para "${filtros.busca}"`, trilha: 'Busca' };
  return { principal: 'Todas as peças', trilha: 'Peças' };
}

function PainelFiltros({
  modo,
  filtros,
  colecaoFixa,
  marcas,
  cores,
  categorias,
  onMudar,
  onLimpar,
  temFiltroAtivo,
}) {
  const marcasEscolhidas = filtros.marca ? filtros.marca.split(',') : [];
  const coresEscolhidas = filtros.cor ? filtros.cor.split(',') : [];

  function alternarMarca(slug) {
    const proximas = marcasEscolhidas.includes(slug)
      ? marcasEscolhidas.filter((s) => s !== slug)
      : [...marcasEscolhidas, slug];
    onMudar({ marca: proximas.join(',') });
  }

  function alternarCor(slug) {
    const proximas = coresEscolhidas.includes(slug)
      ? coresEscolhidas.filter((s) => s !== slug)
      : [...coresEscolhidas, slug];
    onMudar({ cor: proximas.join(',') });
  }

  return (
    <div className="filtros">
      {!colecaoFixa && (
        <fieldset className="filtros__grupo">
          <legend className="t-label-caps">Coleção</legend>
          <OpcaoFiltro tipo="radio" nome="colecao" ativo={!filtros.colecao} onChange={() => onMudar({ colecao: '' })}>
            Todas
          </OpcaoFiltro>
          {COLECOES.map((c) => (
            <OpcaoFiltro
              key={c.slug}
              tipo="radio"
              nome="colecao"
              ativo={filtros.colecao === c.slug}
              onChange={() => onMudar({ colecao: c.slug })}
            >
              {c.nome}
            </OpcaoFiltro>
          ))}
        </fieldset>
      )}

      {filtros.colecao && (
        <fieldset className="filtros__grupo">
          <legend className="t-label-caps">Categoria</legend>
          {categorias.carregando && <p className="t-body-sm t-muted">Carregando…</p>}
          {categorias.erro && (
            <button type="button" className="link-caps" onClick={categorias.recarregar}>
              Tentar de novo
            </button>
          )}
          {categorias.dados && categorias.dados.length === 0 && (
            <p className="t-body-sm t-muted">Nenhuma categoria nesta coleção.</p>
          )}
          {categorias.dados && categorias.dados.length > 0 && (
            <>
              <OpcaoFiltro tipo="radio" nome="categoria" ativo={!filtros.categoria} onChange={() => onMudar({ categoria: '' })}>
                Todas
              </OpcaoFiltro>
              {categorias.dados.map((c) => (
                <OpcaoFiltro
                  key={c.id}
                  tipo="radio"
                  nome="categoria"
                  ativo={filtros.categoria === c.slug}
                  onChange={() => onMudar({ categoria: c.slug })}
                  contagem={c.totalProdutos}
                >
                  {c.nome}
                </OpcaoFiltro>
              ))}
            </>
          )}
        </fieldset>
      )}

      {modo !== 'marca' && (
        <fieldset className="filtros__grupo">
          <legend className="t-label-caps">Marca</legend>
          {marcas.carregando && <p className="t-body-sm t-muted">Carregando…</p>}
          {marcas.erro && (
            <button type="button" className="link-caps" onClick={marcas.recarregar}>
              Tentar de novo
            </button>
          )}
          {marcas.dados?.map((m) => (
            <OpcaoFiltro
              key={m.id}
              tipo="checkbox"
              nome="marca"
              ativo={marcasEscolhidas.includes(m.slug)}
              onChange={() => alternarMarca(m.slug)}
              contagem={m.totalProdutos}
            >
              {m.nome}
            </OpcaoFiltro>
          ))}
        </fieldset>
      )}

      {/* Sem `modo !== 'marca'`: cor faz sentido até dentro da página de uma marca. */}
      <fieldset className="filtros__grupo">
        <legend className="t-label-caps">Cor</legend>
        {cores.carregando && <p className="t-body-sm t-muted">Carregando…</p>}
        {cores.erro && (
          <button type="button" className="link-caps" onClick={cores.recarregar}>
            Tentar de novo
          </button>
        )}
        {cores.dados && cores.dados.length === 0 && (
          <p className="t-body-sm t-muted">Nenhuma cor cadastrada ainda.</p>
        )}
        {cores.dados?.map((c) => (
          <OpcaoFiltro
            key={c.id}
            tipo="checkbox"
            nome="cor"
            ativo={coresEscolhidas.includes(c.slug)}
            onChange={() => alternarCor(c.slug)}
            contagem={c.totalProdutos}
          >
            {c.nome}
          </OpcaoFiltro>
        ))}
      </fieldset>

      {temFiltroAtivo && (
        <button type="button" className="link-caps filtros__limpar" onClick={onLimpar}>
          Limpar filtros
        </button>
      )}
    </div>
  );
}

function OpcaoFiltro({ tipo, nome, ativo, onChange, contagem, children }) {
  return (
    <label className={`opcao-filtro ${ativo ? 'opcao-filtro--ativa' : ''}`}>
      <input type={tipo} name={nome} checked={ativo} onChange={onChange} />
      <span className="opcao-filtro__marcador" aria-hidden />
      <span className="opcao-filtro__texto">{children}</span>
      {typeof contagem === 'number' && <span className="t-body-sm t-muted">{contagem}</span>}
    </label>
  );
}
