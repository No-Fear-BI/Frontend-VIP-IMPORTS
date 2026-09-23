import { useRef, useState } from 'react';
import { catalogoService } from '../../services/catalogoService.js';
import { marcasService } from '../../services/marcasService.js';
import { categoriasService } from '../../services/categoriasService.js';
import { decidirProduto, listarPendentes } from '../../services/revisaoService.js';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { EstadoErro, EstadoVazio, EsqueletoGrade } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import Card from '../../components/ui/Card.jsx';
import './Revisao.css';

export default function Revisao() {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [pagina, setPagina] = useState(1);
  const [nomes, setNomes] = useState({});
  const [destinos, setDestinos] = useState({});
  const [publicado, setPublicado] = useState(null);
  const opcoes = useRequisicao(async (sinal) => {
    const [colecoes, marcas, categorias] = await Promise.all([
      catalogoService.colecoes(sinal), marcasService.listar(sinal), categoriasService.listar(undefined, sinal),
    ]);
    return { colecoes, marcas: marcas.filter((m) => m.ativa), categorias: categorias.filter((c) => c.ativa) };
  }, []);
  const mudarDestino = (id, mudanca) => setDestinos((atual) => ({ ...atual, [id]: { ...atual[id], ...mudanca } }));
  const [salvando, setSalvando] = useState(null);
  const [erroDecisao, setErroDecisao] = useState('');
  const trava = useRef(false);
  const { dados, erro, carregando, recarregar } = useRequisicao(
    (sinal) => listarPendentes({ busca, categoria, pagina, porPagina: 60 }, sinal),
    [busca, categoria, pagina],
  );
  const fila = dados?.dados || dados;
  const itens = fila?.items || fila?.itens || [];
  const categorias = fila?.categories || fila?.categorias || [];
  const total = fila?.total || 0;
  const paginaAtual = fila?.pagina || 1;
  const paginas = fila?.paginas || 1;
  const limpar = () => { setBusca(''); setCategoria('Todos'); setPagina(1); };
  const aprovar = async (item) => {
    if (trava.current) return;
    const destino = destinos[item.id];
    if (!destinoCompleto(destino)) {
      setErroDecisao('Marque uma ou ambas as coleções, escolha a categoria de cada uma e a marca.');
      return;
    }
    trava.current = true;
    setSalvando(item.id);
    setErroDecisao('');
    try {
      const resposta = await decidirProduto({
        productId: item.id, status: 'approved', translatedName: nomes[item.id] ?? item.translatedName,
        categoriasIds: Object.values(destino.categorias).map(Number), marcaId: Number(destino.marcaId),
      });
      setPublicado({
        nome: resposta.product.translatedName, codigo: resposta.codigo,
        colecoes: opcoes.dados.colecoes.filter((c) => Object.hasOwn(destino.categorias, String(c.id))),
        marca: opcoes.dados.marcas.find((m) => String(m.id) === destino.marcaId),
      });
      setDestinos((atual) => { const novo = { ...atual }; delete novo[item.id]; return novo; });
      setNomes((atual) => { const novo = { ...atual }; delete novo[item.id]; return novo; });
      recarregar();
    } catch (falha) {
      setErroDecisao(falha.mensagem || 'A decisão não foi salva. Tente novamente.');
    } finally {
      trava.current = false;
      setSalvando(null);
    }
  };
  return (
    <section className="revisao">
      <header className="revisao__cabecalho">
        <div><p className="t-label-caps">VIP IMPORTS</p><h1 className="t-headline-lg">Revisão interna do catálogo</h1></div>
        <a href="/todos" target="_blank" rel="noreferrer">Ver catálogo publicado →</a>
      </header>
      <div className="revisao__resumo" aria-live="polite">
        <strong className="t-headline-lg">{carregando ? '…' : total.toLocaleString('pt-BR')}</strong> itens aguardando revisão
        <p>Confira a imagem, ajuste o nome e marque Masculino, Feminino ou ambos, com a categoria de cada coleção e a marca. Todo produto aprovado também aparece em Todos.</p>
      </div>
      <div className="revisao__filtros">
        <label className="campo">Categoria
          <select className="campo__input" value={categoria} disabled={Boolean(salvando)} onChange={(e) => { setCategoria(e.target.value); setPagina(1); }}>
            <option>Todos</option>{categorias.map((nome) => <option key={nome}>{nome}</option>)}
          </select>
        </label>
        <Field id="busca-revisao" rotulo="Buscar pelo título original" value={busca} disabled={Boolean(salvando)} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} />
      </div>
      {publicado && <div className="revisao__publicado" role="status">
        <p><strong>{publicado.nome}</strong> publicado com sucesso.</p>
        <p>Disponível em <a href="/todos" target="_blank" rel="noreferrer">Todos</a>,{' '}
          {publicado.colecoes.map((c) => <span key={c.id}><a href={`/${c.slug}`} target="_blank" rel="noreferrer">{c.nome}</a>, </span>)}
          e{' '}
          <a href={`/marcas/${publicado.marca.slug}`} target="_blank" rel="noreferrer">{publicado.marca.nome}</a>.
        </p>
        <a className="link-caps" href={`/produto/${publicado.codigo}`} target="_blank" rel="noreferrer">Ver produto na loja →</a>
      </div>}
      {opcoes.carregando && <p role="status">Carregando opções de publicação…</p>}
      {opcoes.erro && <EstadoErro erro={opcoes.erro} onTentar={opcoes.recarregar} />}
      {opcoes.dados && !opcoes.dados.marcas.length && <EstadoVazio titulo="Cadastre uma marca ativa para publicar" acao={{ rotulo: 'Cadastrar marca', para: '/admin/marcas' }} />}
      {erroDecisao && <ErroGeral>{erroDecisao}</ErroGeral>}
      {carregando ? <EsqueletoGrade className="revisao__grade" /> : erro ? <EstadoErro erro={erro} onTentar={recarregar} /> : itens.length === 0 ? (
        <EstadoVazio titulo="Nenhum produto pendente" texto="Limpe os filtros ou atualize a fila para conferir novos produtos." acao={{ rotulo: busca || categoria !== 'Todos' ? 'Limpar filtros' : 'Atualizar fila', onClick: busca || categoria !== 'Todos' ? limpar : recarregar }} />
      ) : <>
        <nav className="revisao__paginacao" aria-label="Páginas da revisão">
          <Button variante="secundaria" disabled={paginaAtual <= 1 || Boolean(salvando)} onClick={() => setPagina(paginaAtual - 1)}>Anterior</Button>
          <span>Página {paginaAtual} de {paginas} · {itens.length} produtos</span>
          <Button variante="secundaria" disabled={paginaAtual >= paginas || Boolean(salvando)} onClick={() => setPagina(paginaAtual + 1)}>Próxima</Button>
        </nav>
        <div className="revisao__grade">{itens.map((item) => (
          <Card como="article" borda className="revisao__card" key={item.id}>
            <img loading="lazy" src={`/api/v1/admin/revisao/imagem?url=${encodeURIComponent(item.image)}&source=${encodeURIComponent(item.sourceUrl)}`} alt={item.translatedName} />
            <div className="revisao__conteudo">
              <small>{item.category} • {item.supplier}</small>
              <Field id={`nome-${item.id}`} rotulo="Nome em português" value={nomes[item.id] ?? item.translatedName} maxLength={180} disabled={Boolean(salvando)} onChange={(e) => setNomes((atual) => ({ ...atual, [item.id]: e.target.value }))} />
              <DestinoPublicacao
                id={item.id} valor={destinos[item.id] || {}} opcoes={opcoes.dados}
                desabilitado={Boolean(salvando) || opcoes.carregando || Boolean(opcoes.erro)}
                onMudar={(mudanca) => mudarDestino(item.id, mudanca)}
              />
              <p>{item.translatedDetails}</p>
              <details><summary>Nome original</summary><p>{item.name}</p></details>
              <nav className="revisao__acoes">
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">Ver origem ↗</a>
                <Button disabled={Boolean(salvando) || !opcoes.dados || Boolean(opcoes.erro) || !destinoCompleto(destinos[item.id]) || !(nomes[item.id] ?? item.translatedName).trim()} onClick={() => aprovar(item)}>{salvando === item.id ? 'Salvando…' : 'Aprovar e publicar'}</Button>
              </nav>
            </div>
          </Card>
        ))}</div>
        <nav className="revisao__paginacao" aria-label="Continuar revisão">
          <Button variante="secundaria" disabled={paginaAtual <= 1 || Boolean(salvando)} onClick={() => setPagina(paginaAtual - 1)}>Anterior</Button>
          <span>Página {paginaAtual} de {paginas}</span>
          <Button variante="secundaria" disabled={paginaAtual >= paginas || Boolean(salvando)} onClick={() => setPagina(paginaAtual + 1)}>Próxima</Button>
        </nav>
      </>}
    </section>
  );
}

function destinoCompleto(valor) {
  const categorias = Object.values(valor?.categorias || {});
  return Boolean(valor?.marcaId && categorias.length && categorias.every(Boolean));
}

function DestinoPublicacao({ id, valor, opcoes, desabilitado, onMudar }) {
  const selecionadas = valor.categorias || {};
  function alternarColecao(colecaoId, marcada) {
    const proximas = { ...selecionadas };
    if (marcada) proximas[colecaoId] = '';
    else delete proximas[colecaoId];
    onMudar({ categorias: proximas });
  }
  return <fieldset className="revisao__destino" disabled={desabilitado}>
    <legend className="t-label-caps">Onde exibir na loja</legend>
    <p className="t-body-sm">Todos — incluído automaticamente</p>
    <p className="t-body-sm">Marque uma ou ambas as coleções.</p>
    {opcoes?.colecoes.map((colecao) => {
      const marcada = Object.hasOwn(selecionadas, String(colecao.id));
      const categorias = opcoes.categorias.filter((c) => c.colecaoId === colecao.id);
      return <div className="revisao__colecao" key={colecao.id}>
        <label className="revisao__opcao">
          <input type="checkbox" id={`colecao-${id}-${colecao.id}`} checked={marcada}
            onChange={(e) => alternarColecao(colecao.id, e.target.checked)} />
          <span>{colecao.nome}</span>
        </label>
        {marcada && <>
          <label className="campo" htmlFor={`categoria-${id}-${colecao.id}`}>
            <span>Categoria — {colecao.nome}</span>
            <select id={`categoria-${id}-${colecao.id}`} className="campo__input"
              value={selecionadas[colecao.id]} required
              onChange={(e) => onMudar({ categorias: { ...selecionadas, [colecao.id]: e.target.value } })}>
              <option value="">Escolha a categoria</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          {!categorias.length && <p className="t-body-sm">Sem categorias ativas nesta coleção. <a href="/admin/categorias">Cadastrar categoria</a></p>}
        </>}
      </div>;
    })}
    <label className="campo" htmlFor={`marca-${id}`}>Marca
      <select id={`marca-${id}`} className="campo__input" value={valor.marcaId || ''}
        onChange={(e) => onMudar({ marcaId: e.target.value })} required>
        <option value="">Escolha a marca</option>
        {opcoes?.marcas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
      </select>
    </label>
  </fieldset>;
}
