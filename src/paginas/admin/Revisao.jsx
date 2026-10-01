import { useRef, useState } from 'react';
import { decidirProduto, listarPendentes } from '../../services/revisaoService.js';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { EstadoErro, EstadoVazio, EsqueletoGrade } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import Card from '../../components/ui/Card.jsx';
import ImagemAmpliavel from '../../components/ImagemAmpliavel.jsx';
import './Revisao.css';
import CampoNovidades from './CampoNovidades.jsx';
import FotosDoAlbum from './FotosDoAlbum.jsx';
import { categoriasService } from '../../services/categoriasService.js';
import DestinosProduto, { destinosCompletos, destinosVazios } from './DestinosProduto.jsx';
import SeletorMarca, { GENERICO, NOVA, nomeDaMarca } from './SeletorMarca.jsx';
import { marcasService } from '../../services/marcasService.js';

// O Yupoo responde 404 a um álbum aberto sem `uid=1` na URL, e os links salvos na fila vêm sem ele.
function linkDaOrigem(url) {
  try {
    const link = new URL(url);
    if (!link.searchParams.has('uid')) link.searchParams.set('uid', '1');
    return link.toString();
  } catch {
    return url;
  }
}

export default function Revisao() {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [pagina, setPagina] = useState(1);
  const [nomes, setNomes] = useState({});
  const [marcas, setMarcas] = useState({});
  const [destinos, setDestinos] = useState({});
  // Só guarda quem desmarcou; ausente = marcado (padrão: aprovar já coloca em novidades).
  const [semNovidades, setSemNovidades] = useState({});
  // Fotos escolhidas por produto, na ordem final (a primeira é a capa). Ausente = só a foto do cartão.
  const [fotos, setFotos] = useState({});
  const emNovidadesDe = (id) => !semNovidades[id];
  const opcoes = useRequisicao(async (sinal) => ({ categorias: await categoriasService.listar(sinal) }), []);
  // Pedido à parte das categorias: recarregar a lista depois de criar marca não
  // pode esconder o bloco de categorias de todos os cartões enquanto carrega.
  const listaMarcas = useRequisicao((sinal) => marcasService.listar(sinal), []);
  const marcaDe = (id) => nomeDaMarca(marcas[id], listaMarcas.dados || []);
  const [salvando, setSalvando] = useState(null);
  const [erroDecisao, setErroDecisao] = useState(null);
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
    if (!destinosCompletos(destinos[item.id] || destinosVazios()) || !marcaDe(item.id)) {
      setErroDecisao({ itemId: item.id, mensagem: 'Informe a marca, o público (Feminino e/ou Masculino) e a categoria.', campos: {} });
      return;
    }
    trava.current = true;
    setSalvando(item.id);
    setErroDecisao(null);
    try {
      await decidirProduto({
        productId: item.id,
        status: 'approved',
        translatedName: nomes[item.id] ?? item.translatedName,
        marca: marcaDe(item.id),
        categoriasIds: destinos[item.id].categoriasIds.map(Number),
        publicos: destinos[item.id].publicos,
        emNovidades: emNovidadesDe(item.id),
        ...(fotos[item.id] ? { fotos: fotos[item.id] } : {}),
      });
      setNomes((atual) => { const novo = { ...atual }; delete novo[item.id]; return novo; });
      setMarcas((atual) => { const novo = { ...atual }; delete novo[item.id]; return novo; });
      setDestinos((atual) => { const novo = { ...atual }; delete novo[item.id]; return novo; });
      setSemNovidades((atual) => { const novo = { ...atual }; delete novo[item.id]; return novo; });
      setFotos((atual) => { const novo = { ...atual }; delete novo[item.id]; return novo; });
      if ([NOVA, GENERICO].includes(marcas[item.id]?.escolha)) listaMarcas.recarregar();
      recarregar();
    } catch (falha) {
      setErroDecisao({ itemId: item.id, mensagem: falha.mensagem, campos: falha.campos || {} });
    } finally {
      trava.current = false;
      setSalvando(null);
    }
  };
  return (
    <section className="revisao">
      <header className="revisao__cabecalho">
        <div><p className="t-label-caps">VIP IMPORTS</p><h1 className="t-headline-lg">Revisão interna do catálogo</h1></div>
        <a href="/" target="_blank" rel="noreferrer">Ver catálogo publicado →</a>
      </header>
      <div className="revisao__resumo" aria-live="polite">
        <strong className="t-headline-lg">{carregando ? '…' : total.toLocaleString('pt-BR')}</strong> itens aguardando revisão
        <p>Confira a imagem e o nome, informe a marca e escolha o público e as categorias do produto.</p>
        <p className="t-body-sm t-muted"><span aria-hidden="true">*</span> Campo obrigatório para aprovar.</p>
      </div>
      <div className="revisao__filtros">
        <label className="campo">Categoria
          <select className="campo__input" value={categoria} disabled={Boolean(salvando)} onChange={(e) => { setCategoria(e.target.value); setPagina(1); }}>
            <option>Todos</option>{categorias.map((nome) => <option key={nome}>{nome}</option>)}
          </select>
        </label>
        <Field id="busca-revisao" rotulo="Buscar pelo título original" value={busca} disabled={Boolean(salvando)} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} />
      </div>
      {opcoes.carregando && <p role="status">Carregando categorias…</p>}
      {opcoes.erro && <EstadoErro erro={opcoes.erro} onTentar={opcoes.recarregar} />}
      {listaMarcas.erro && <EstadoErro erro={listaMarcas.erro} onTentar={listaMarcas.recarregar} />}
      {erroDecisao?.mensagem && !erroDecisao.campos?.marca && !erroDecisao.campos?.colecao && (
        <ErroGeral>{erroDecisao.mensagem}</ErroGeral>
      )}
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
            <ImagemAmpliavel
              lupa
              url={`/api/v1/admin/revisao/imagem?url=${encodeURIComponent(item.image)}&source=${encodeURIComponent(item.sourceUrl)}`}
              alt={item.translatedName}
            />
            <div className="revisao__conteudo">
              <small>{item.category} • {item.supplier}</small>
              <Field id={`nome-${item.id}`} rotulo="Nome em português" value={nomes[item.id] ?? item.translatedName} disabled={Boolean(salvando)} onChange={(e) => setNomes((atual) => ({ ...atual, [item.id]: e.target.value }))} />
              <p>{item.translatedDetails}</p>
              <details><summary>Nome original</summary><p>{item.name}</p></details>
              <SeletorMarca
                id={`marca-${item.id}`}
                marcas={listaMarcas.dados}
                carregando={listaMarcas.carregando}
                valor={marcas[item.id]}
                disabled={Boolean(salvando)}
                erro={erroDecisao?.itemId === item.id ? erroDecisao.campos?.marca : undefined}
                onMudar={(valor) => setMarcas((atual) => ({ ...atual, [item.id]: valor }))}
              />
              {opcoes.dados && <DestinosProduto
                id={`destinos-${item.id}`} categorias={opcoes.dados.categorias}
                valor={destinos[item.id] || destinosVazios()} disabled={Boolean(salvando) || opcoes.carregando} obrigatorio
                onMudar={(valor) => setDestinos((atual) => ({ ...atual, [item.id]: valor }))}
                erro={erroDecisao?.itemId === item.id ? erroDecisao.campos?.categoriasIds : undefined}
                erroPublicos={erroDecisao?.itemId === item.id ? erroDecisao.campos?.publicos : undefined}
              />}
              <FotosDoAlbum
                produtoId={item.id}
                origem={item.sourceUrl}
                valor={fotos[item.id]}
                disabled={Boolean(salvando)}
                onMudar={(valor) => setFotos((atual) => ({ ...atual, [item.id]: valor }))}
              />
              <CampoNovidades
                id={`novidades-${item.id}`}
                rotulo="Colocar em novidades ao permitir?"
                marcado={emNovidadesDe(item.id)}
                disabled={Boolean(salvando)}
                onMudar={(marcado) => setSemNovidades((atual) => ({ ...atual, [item.id]: !marcado }))}
              />
              <nav className="revisao__acoes">
                {item.sourceUrl ? <a href={linkDaOrigem(item.sourceUrl)} target="_blank" rel="noopener noreferrer">Ver origem ↗</a> : <span>Origem indisponível</span>}
                <Button disabled={Boolean(salvando) || opcoes.carregando || Boolean(opcoes.erro) || !destinosCompletos(destinos[item.id] || destinosVazios()) || !marcaDe(item.id)} onClick={() => aprovar(item)}>{salvando === item.id ? 'Salvando…' : 'Aprovar'}</Button>
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