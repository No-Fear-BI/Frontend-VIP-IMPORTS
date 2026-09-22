/*
 * Destaques da home (/admin/destaques): produtos (até 12) e categorias (até 8). Mesmo padrão da
 * grade de variações em Produto.jsx — carrega a lista atual, edita uma cópia local (adicionar,
 * remover, reordenar) e manda tudo de volta de uma vez, com "Salvar"/"Descartar alterações".
 *
 * O que o backend impõe (docs/para-o-frontend.md, "Painel administrativo — destaques e
 * consultas"):
 * 1. `PATCH /admin/destaques/produtos` e `PATCH /admin/destaques/categorias` SUBSTITUEM o
 *    conjunto inteiro: por isso o buffer local manda a lista com tudo que deve continuar
 *    destacado, não só o que mudou.
 * 2. A lista atual (para não começar do zero) vem de `GET /home`, que já traz os destaques na
 *    ordem gravada — é dado público, sem re-inventar uma leitura administrativa que não existe.
 * 3. Produto oculto ou categoria inativa são recusados com 400 e os ids problemáticos vêm em
 *    `erro.detalhes.ocultos`/`erro.detalhes.inativas` — marcados na lista em vez de um erro
 *    genérico, para o admin saber exatamente o que tirar antes de salvar de novo.
 */

import { useState } from 'react';
import { EstadoErro, Esqueleto } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { cn } from '../../lib/cn.js';
import { catalogoService } from '../../services/catalogoService.js';
import { categoriasService } from '../../services/categoriasService.js';
import { destaquesService } from '../../services/destaquesService.js';
import { produtosAdminService } from '../../services/produtosAdminService.js';
import './Destaques.css';

const TETO_PRODUTOS = 12;
const TETO_CATEGORIAS = 8;

const assinatura = (itens) => itens.map((i) => i.id).join(',');

export default function AdminDestaques() {
  const home = useRequisicao((sinal) => catalogoService.home(sinal), []);

  return (
    <section className="admin__pagina">
      <header className="admin-destaques__topo">
        <p className="t-label-caps-sm t-muted">/admin/destaques</p>
        <h1 className="t-headline-lg">Destaques</h1>
        <p className="t-body-sm t-muted admin-destaques__ajuda">
          O que a home mostra em "Escolhidas pela casa" e na grade de categorias.
        </p>
      </header>

      {home.carregando ? (
        <div className="estado-carregando" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} className="esqueleto--linha" />
          ))}
        </div>
      ) : home.erro ? (
        <EstadoErro erro={home.erro} onTentar={home.recarregar} titulo="Não conseguimos carregar os destaques." />
      ) : (
        <>
          <GradeDestaqueProdutos inicial={home.dados.destaques} />
          <GradeDestaqueCategorias inicial={home.dados.categoriasDestaque} />
        </>
      )}
    </section>
  );
}

// ---- Produtos ----

function GradeDestaqueProdutos({ inicial }) {
  const [salva, setSalva] = useState(inicial);
  const [linhas, setLinhas] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState('');

  const mudou = assinatura(linhas) !== assinatura(salva);
  const cheia = linhas.length >= TETO_PRODUTOS;
  const problemas = new Set(erro?.detalhes?.ocultos || []);

  function alterar(proximas) {
    setLinhas(proximas);
    setErro(null);
    setAviso('');
  }

  const remover = (id) => alterar(linhas.filter((p) => p.id !== id));

  function mover(indice, direcao) {
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= linhas.length) return;
    const proximas = [...linhas];
    [proximas[indice], proximas[alvo]] = [proximas[alvo], proximas[indice]];
    alterar(proximas);
  }

  function adicionar(produto) {
    if (cheia || linhas.some((p) => p.id === produto.id)) return;
    alterar([...linhas, produto]);
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    setAviso('');
    try {
      await destaquesService.produtos(linhas.map((p) => p.id));
      setSalva(linhas);
      setAviso('Destaques salvos.');
    } catch (falha) {
      setErro(falha);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="admin-destaques__bloco">
      <header className="admin-destaques__bloco-topo">
        <h2 className="t-headline-md">Produtos em destaque</h2>
        <p className="t-body-sm t-muted">Até {TETO_PRODUTOS} peças — é o que a home renderiza.</p>
      </header>

      {linhas.length === 0 ? (
        <p className="t-body-sm t-muted">Nenhum produto em destaque ainda.</p>
      ) : (
        <ul className="admin-destaques__lista">
          {linhas.map((produto, i) => (
            <li
              key={produto.id}
              className={cn('admin-destaques__item', problemas.has(produto.id) && 'admin-destaques__item--problema')}
            >
              <MiniaturaDestaque url={produto.capa?.url} alt={produto.capa?.alt} />
              <div className="admin-destaques__item-info">
                <p className="t-body-sm">{produto.nome}</p>
                <p className="t-body-sm t-muted">
                  {produto.marca?.nome} · Código {produto.codigo}
                </p>
                {problemas.has(produto.id) && (
                  <p className="t-body-sm admin-destaques__erro-item" role="alert">
                    Produto oculto — não pode ser destaque. Remova ou tire de oculto.
                  </p>
                )}
              </div>
              <div className="admin-destaques__item-acoes">
                <button type="button" className="link-caps" disabled={i === 0 || salvando} onClick={() => mover(i, -1)}>
                  Mover para cima
                </button>
                <button
                  type="button"
                  className="link-caps"
                  disabled={i === linhas.length - 1 || salvando}
                  onClick={() => mover(i, 1)}
                >
                  Mover para baixo
                </button>
                <button type="button" className="link-caps" disabled={salvando} onClick={() => remover(produto.id)}>
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <BuscaProduto excluir={new Set(linhas.map((p) => p.id))} cheia={cheia} onAdicionar={adicionar} />

      {erro && !problemas.size && <ErroGeral>{erro.campos?.ids || erro.mensagem}</ErroGeral>}

      <div className="admin-destaques__acoes">
        <Button variante="primaria" onClick={salvar} disabled={!mudou || salvando}>
          {salvando ? 'Salvando…' : 'Salvar destaques'}
        </Button>
        {mudou && !salvando && (
          <Button variante="secundaria" onClick={() => alterar(salva)}>
            Descartar alterações
          </Button>
        )}
        <p className="t-body-sm t-muted" role="status">
          {aviso || (mudou ? 'Há alterações não salvas.' : '')}
        </p>
      </div>
    </div>
  );
}

function BuscaProduto({ excluir, cheia, onAdicionar }) {
  const [texto, setTexto] = useState('');
  const [termo, setTermo] = useState('');
  const resultado = useRequisicao(
    (sinal) =>
      termo ? produtosAdminService.listar({ busca: termo, porPagina: 8 }, sinal) : Promise.resolve({ dados: [] }),
    [termo],
  );

  return (
    <div className="admin-destaques__busca">
      <form
        className="admin-destaques__busca-form"
        onSubmit={(evento) => {
          evento.preventDefault();
          setTermo(texto.trim());
        }}
      >
        <Field
          id="destaques-busca-produto"
          rotulo="Adicionar produto"
          ajuda={cheia ? `Limite de ${TETO_PRODUTOS} produtos atingido — busque à vontade, mas remova algum para adicionar outro.` : 'Nome ou código.'}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex.: bolsa, X030…"
        />
        <Button variante="secundaria" type="submit" disabled={!texto.trim()}>
          Buscar
        </Button>
      </form>

      {termo && (
        resultado.carregando ? (
          <Esqueleto className="esqueleto--linha" />
        ) : resultado.erro ? (
          <ErroGeral>Não conseguimos buscar. {resultado.erro.mensagem}</ErroGeral>
        ) : resultado.dados.dados.length === 0 ? (
          <p className="t-body-sm t-muted">Nenhum produto para "{termo}".</p>
        ) : (
          <ul className="admin-destaques__resultados">
            {resultado.dados.dados.map((produto) => (
              <li key={produto.id}>
                <span className="t-body-sm">
                  {produto.nome} · Código {produto.codigo}
                  {produto.status === 'oculto' && <span className="t-muted"> (oculto)</span>}
                </span>
                <button
                  type="button"
                  className="link-caps"
                  disabled={excluir.has(produto.id) || cheia}
                  onClick={() => onAdicionar(produto)}
                >
                  {excluir.has(produto.id) ? 'Já adicionado' : 'Adicionar'}
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

// ---- Categorias ----

function GradeDestaqueCategorias({ inicial }) {
  const linhaInicial = inicial.map((c) => ({
    id: c.id,
    nome: c.nome,
    slug: c.slug,
    imagemUrl: c.imagemUrl,
    colecaoSlug: c.colecao.slug,
  }));
  const [salva, setSalva] = useState(linhaInicial);
  const [linhas, setLinhas] = useState(linhaInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState('');

  const disponiveis = useRequisicao((sinal) => categoriasService.listar(undefined, sinal), []);

  const mudou = assinatura(linhas) !== assinatura(salva);
  const cheia = linhas.length >= TETO_CATEGORIAS;
  const problemas = new Set(erro?.detalhes?.inativas || []);

  function alterar(proximas) {
    setLinhas(proximas);
    setErro(null);
    setAviso('');
  }

  const remover = (id) => alterar(linhas.filter((c) => c.id !== id));

  function mover(indice, direcao) {
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= linhas.length) return;
    const proximas = [...linhas];
    [proximas[indice], proximas[alvo]] = [proximas[alvo], proximas[indice]];
    alterar(proximas);
  }

  function adicionar(categoria) {
    if (cheia || linhas.some((c) => c.id === categoria.id)) return;
    alterar([
      ...linhas,
      { id: categoria.id, nome: categoria.nome, slug: categoria.slug, imagemUrl: categoria.imagemUrl, colecaoSlug: categoria.colecaoSlug },
    ]);
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    setAviso('');
    try {
      await destaquesService.categorias(linhas.map((c) => c.id));
      setSalva(linhas);
      setAviso('Destaques salvos.');
    } catch (falha) {
      setErro(falha);
    } finally {
      setSalvando(false);
    }
  }

  const jaEscolhidas = new Set(linhas.map((c) => c.id));
  const opcoes = (disponiveis.dados || []).filter((c) => !jaEscolhidas.has(c.id));

  return (
    <div className="admin-destaques__bloco">
      <header className="admin-destaques__bloco-topo">
        <h2 className="t-headline-md">Categorias em destaque</h2>
        <p className="t-body-sm t-muted">Até {TETO_CATEGORIAS} — a fileira de cartões da home.</p>
      </header>

      {linhas.length === 0 ? (
        <p className="t-body-sm t-muted">Nenhuma categoria em destaque ainda.</p>
      ) : (
        <ul className="admin-destaques__lista">
          {linhas.map((categoria, i) => (
            <li
              key={categoria.id}
              className={cn('admin-destaques__item', problemas.has(categoria.id) && 'admin-destaques__item--problema')}
            >
              <MiniaturaDestaque url={categoria.imagemUrl} alt={categoria.nome} />
              <div className="admin-destaques__item-info">
                <p className="t-body-sm">{categoria.nome}</p>
                <p className="t-body-sm t-muted">{categoria.colecaoSlug}</p>
                {problemas.has(categoria.id) && (
                  <p className="t-body-sm admin-destaques__erro-item" role="alert">
                    Categoria inativa — não pode ser destaque. Remova ou reative a categoria.
                  </p>
                )}
              </div>
              <div className="admin-destaques__item-acoes">
                <button type="button" className="link-caps" disabled={i === 0 || salvando} onClick={() => mover(i, -1)}>
                  Mover para cima
                </button>
                <button
                  type="button"
                  className="link-caps"
                  disabled={i === linhas.length - 1 || salvando}
                  onClick={() => mover(i, 1)}
                >
                  Mover para baixo
                </button>
                <button type="button" className="link-caps" disabled={salvando} onClick={() => remover(categoria.id)}>
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="admin-destaques__adicionar-categoria">
        <AdicionarCategoria disponiveis={opcoes} carregando={disponiveis.carregando} cheia={cheia} onAdicionar={adicionar} />
      </div>

      {erro && !problemas.size && <ErroGeral>{erro.campos?.ids || erro.mensagem}</ErroGeral>}

      <div className="admin-destaques__acoes">
        <Button variante="primaria" onClick={salvar} disabled={!mudou || salvando}>
          {salvando ? 'Salvando…' : 'Salvar destaques'}
        </Button>
        {mudou && !salvando && (
          <Button variante="secundaria" onClick={() => alterar(salva)}>
            Descartar alterações
          </Button>
        )}
        <p className="t-body-sm t-muted" role="status">
          {aviso || (mudou ? 'Há alterações não salvas.' : '')}
        </p>
      </div>
    </div>
  );
}

function AdicionarCategoria({ disponiveis, carregando, cheia, onAdicionar }) {
  const [escolhida, setEscolhida] = useState('');

  return (
    <form
      className="admin-destaques__busca-form"
      onSubmit={(evento) => {
        evento.preventDefault();
        const categoria = disponiveis.find((c) => String(c.id) === escolhida);
        if (categoria) onAdicionar(categoria);
        setEscolhida('');
      }}
    >
      <div className="campo">
        <label htmlFor="destaques-categoria" className="t-label-caps">
          Adicionar categoria
        </label>
        <select
          id="destaques-categoria"
          className="campo__input"
          value={escolhida}
          onChange={(e) => setEscolhida(e.target.value)}
          disabled={carregando || disponiveis.length === 0}
        >
          <option value="">{cheia ? `Limite de ${TETO_CATEGORIAS} atingido — remova alguma para trocar.` : 'Selecione'}</option>
          {disponiveis.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.nome} · {c.colecaoSlug}
              {!c.ativa ? ' (inativa)' : ''}
            </option>
          ))}
        </select>
      </div>
      <Button variante="secundaria" type="submit" disabled={cheia || !escolhida}>
        Adicionar
      </Button>
    </form>
  );
}

function MiniaturaDestaque({ url, alt }) {
  const [falhou, setFalhou] = useState(false);
  const semImagem = !url || falhou;
  return (
    <div className="admin-destaques__miniatura">
      {semImagem ? (
        <span className="admin-destaques__miniatura-vazia t-label-caps-sm">—</span>
      ) : (
        <img src={url} alt={alt || ''} onError={() => setFalhou(true)} />
      )}
    </div>
  );
}
