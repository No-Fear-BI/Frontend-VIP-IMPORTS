import { useRef, useState } from 'react';
import { decidirProduto, listarPendentes } from '../../services/revisaoService.js';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { EstadoErro, EstadoVazio, EsqueletoGrade } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import Card from '../../components/ui/Card.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ImagemAmpliavel from '../../components/ImagemAmpliavel.jsx';
import './Revisao.css';
import CampoNovidades from './CampoNovidades.jsx';
import CampoPreco from './CampoPreco.jsx';
import CampoQuantidade, { quantidadeValida, quantidadeParaApi } from './CampoQuantidade.jsx';
import FotosDoAlbum from './FotosDoAlbum.jsx';
import AtualizarProdutos from './AtualizarProdutos.jsx';
import { categoriasService } from '../../services/categoriasService.js';
import DestinosProduto, { destinosCompletos, destinosVazios } from './DestinosProduto.jsx';
import SeletorMarca, { GENERICO, NOVA, nomeDaMarca } from './SeletorMarca.jsx';
import { marcasService } from '../../services/marcasService.js';
import { linkDaOrigem } from '../../lib/linkOrigem.js';
import { lerPreco } from '../../lib/preco.js';

const chaveDaMarca = (nome) => nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Marca que o título do álbum sugere: a cadastrada de mesmo nome ("Hermes" = "Hermès") ou, se ainda não
// existe, "+ Nova marca" já com o nome. Sem a lista de marcas carregada não há sugestão (evita piscar).
function marcaSugerida(nome, cadastradas) {
  if (!nome || !cadastradas) return undefined;
  const achada = cadastradas.find((m) => m.ativa && chaveDaMarca(m.nome) === chaveDaMarca(nome));
  return achada ? { escolha: String(achada.id), nova: '' } : { escolha: NOVA, nova: nome };
}

function EscolherPagina({ id, pagina, paginas, disabled, onMudar }) {
  const [destino, setDestino] = useState(String(pagina));
  return (
    <form className="revisao__ir-pagina" onSubmit={(evento) => {
      evento.preventDefault();
      const numero = Number(destino);
      if (Number.isInteger(numero) && numero >= 1 && numero <= paginas) onMudar(numero);
    }}>
      <Field id={id} rotulo={`Página (de ${paginas})`} type="number" inputMode="numeric"
        min={1} max={paginas} step={1} required value={destino} disabled={disabled}
        onChange={(evento) => setDestino(evento.target.value)} />
    </form>
  );
}

export default function Revisao() {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [pagina, setPagina] = useState(1);
  const [nomes, setNomes] = useState({});
  const [quantidades, setQuantidades] = useState({});
  const [statusProdutos, setStatusProdutos] = useState({});
  const [marcas, setMarcas] = useState({});
  const [destinos, setDestinos] = useState({});
  // Só guarda quem desmarcou; ausente = marcado (padrão: aprovar já coloca em novidades).
  const [semNovidades, setSemNovidades] = useState({});
  // Fotos escolhidas por produto, na ordem final (a primeira é a capa). Ausente = só a foto do cartão.
  const [fotos, setFotos] = useState({});
  // Texto digitado do preço (opcional, só consulta interna), por produto.
  const [precos, setPrecos] = useState({});
  const emNovidadesDe = (id) => !semNovidades[id];
  const opcoes = useRequisicao(async (sinal) => ({ categorias: await categoriasService.listar(sinal) }), []);
  // Pedido à parte das categorias: recarregar a lista depois de criar marca não
  // pode esconder o bloco de categorias de todos os cartões enquanto carrega.
  const listaMarcas = useRequisicao((sinal) => marcasService.listar(sinal), []);
  // Escolha do cartão; enquanto ninguém mexeu, vale a marca sugerida pelo título do álbum (`item.brand`).
  const valorMarca = (item) => marcas[item.id] ?? marcaSugerida(item.brand, listaMarcas.dados);
  const marcaDe = (item) => nomeDaMarca(valorMarca(item), listaMarcas.dados || []);
  const [salvando, setSalvando] = useState(null);
  const [erroDecisao, setErroDecisao] = useState(null);
  // Produto à espera da confirmação de "Reprovar"; reprovar nunca acontece num clique só.
  const [reprovando, setReprovando] = useState(null);
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
  // Larga o que foi preenchido no cartão: o item saiu da fila, e o `id` não volta a ser usado.
  const esquecer = (id) => {
    const sem = (atual) => { const novo = { ...atual }; delete novo[id]; return novo; };
    setNomes(sem); setMarcas(sem); setDestinos(sem); setSemNovidades(sem); setFotos(sem); setPrecos(sem);
    setQuantidades(sem); setStatusProdutos(sem);
  };
  const aprovar = async (item) => {
    if (trava.current || !quantidadeValida(quantidades[item.id] ?? '')) return;
    if (!destinosCompletos(destinos[item.id] || destinosVazios()) || !marcaDe(item)) {
      setErroDecisao({ itemId: item.id, mensagem: 'Informe a marca, o público (Feminino e/ou Masculino) e a categoria.', campos: {} });
      return;
    }
    const { centavos: precoCentavos, erro: erroPreco } = lerPreco(precos[item.id]);
    if (erroPreco) {
      setErroDecisao({ itemId: item.id, mensagem: erroPreco, campos: { precoCentavos: erroPreco } });
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
        marca: marcaDe(item),
        categoriasIds: destinos[item.id].categoriasIds.map(Number),
        publicos: destinos[item.id].publicos,
        emNovidades: emNovidadesDe(item.id),
        ...(precoCentavos !== null ? { precoCentavos } : {}),
        quantidadeDisponivel: quantidadeParaApi(quantidades[item.id] ?? ''),
        statusProduto: statusProdutos[item.id] || 'normal',
        ...(fotos[item.id] ? { fotos: fotos[item.id] } : {}),
      });
      esquecer(item.id);
      if ([NOVA, GENERICO].includes(valorMarca(item).escolha)) listaMarcas.recarregar();
      recarregar();
    } catch (falha) {
      setErroDecisao({ itemId: item.id, mensagem: falha.mensagem, campos: falha.campos || {} });
    } finally {
      trava.current = false;
      setSalvando(null);
    }
  };
  const reprovar = async (item) => {
    if (trava.current) return;
    trava.current = true;
    setSalvando(item.id);
    setErroDecisao(null);
    try {
      await decidirProduto({ productId: item.id, status: 'rejected' });
      esquecer(item.id);
      setReprovando(null);
      recarregar();
    } catch (falha) {
      setReprovando(null);
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
        <AtualizarProdutos aoConcluir={recarregar} />
      </div>
      <div className="revisao__filtros">
        <label className="campo">Categoria
          <select className="campo__input" value={categoria} disabled={Boolean(salvando)} onChange={(e) => { setCategoria(e.target.value); setPagina(1); }}>
            <option>Todos</option>{categorias.map((nome) => <option key={nome}>{nome}</option>)}
          </select>
        </label>
        <Field id="busca-revisao" rotulo="Buscar por nome ou categoria" value={busca} disabled={Boolean(salvando)} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} />
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
          <div className="revisao__controles-pagina">
            <Button variante="secundaria" disabled={paginaAtual <= 1 || Boolean(salvando)} onClick={() => setPagina(paginaAtual - 1)}>Anterior</Button>
            <EscolherPagina key={`topo-${paginaAtual}-${paginas}`} id="pagina-revisao-topo" pagina={paginaAtual} paginas={paginas} disabled={Boolean(salvando)} onMudar={setPagina} />
            <Button variante="secundaria" disabled={paginaAtual >= paginas || Boolean(salvando)} onClick={() => setPagina(paginaAtual + 1)}>Próxima</Button>
          </div>
        </nav>
        <div className="revisao__grade">{itens.map((item) => (
          <Card como="article" borda className="revisao__card" key={item.id}>
            <ImagemAmpliavel
              lupa
              url={`/api/v1/admin/revisao/imagem?url=${encodeURIComponent(item.image)}&source=${encodeURIComponent(item.sourceUrl)}`}
              alt={item.translatedName}
            />
            <div className="revisao__conteudo">
              <small>{item.category}</small>
              <Field id={`nome-${item.id}`} rotulo="Nome em português" value={nomes[item.id] ?? item.translatedName} disabled={Boolean(salvando)} onChange={(e) => setNomes((atual) => ({ ...atual, [item.id]: e.target.value }))} />
              <p>{item.translatedDetails}</p>
              <details><summary>Nome original</summary><p>{item.name}</p></details>
              <SeletorMarca
                id={`marca-${item.id}`}
                marcas={listaMarcas.dados}
                carregando={listaMarcas.carregando}
                valor={valorMarca(item)}
                disabled={Boolean(salvando)}
                erro={erroDecisao?.itemId === item.id ? erroDecisao.campos?.marca : undefined}
                onMudar={(valor) => setMarcas((atual) => ({ ...atual, [item.id]: valor }))}
              />
              {!marcas[item.id] && item.brand && valorMarca(item) && <p className="t-body-sm t-muted">Marca sugerida pelo título do álbum: confira antes de aprovar.</p>}
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
              <CampoPreco
                id={`preco-${item.id}`}
                valor={precos[item.id] ?? ''}
                onMudar={(texto) => setPrecos((atual) => ({ ...atual, [item.id]: texto }))}
                erro={erroDecisao?.itemId === item.id ? erroDecisao.campos?.precoCentavos : undefined}
                disabled={Boolean(salvando)}
              />
              <CampoQuantidade id={`quantidade-${item.id}`} valor={quantidades[item.id] ?? ''}
                disabled={Boolean(salvando)}
                erro={erroDecisao?.itemId === item.id ? erroDecisao.campos?.quantidadeDisponivel : undefined}
                onMudar={(valor) => setQuantidades((atual) => ({ ...atual, [item.id]: valor }))} />
              <label className="campo" htmlFor={`status-${item.id}`}>
                <span className="t-label-caps">Disponibilidade</span>
                <select id={`status-${item.id}`} className="campo__input" value={statusProdutos[item.id] || 'normal'}
                  disabled={Boolean(salvando)} onChange={(evento) => setStatusProdutos((atual) => ({ ...atual, [item.id]: evento.target.value }))}>
                  <option value="normal">Na loja</option>
                  <option value="esgotado">Encomendar</option>
                </select>
              </label>
              <CampoNovidades
                id={`novidades-${item.id}`}
                rotulo="Colocar em novidades ao permitir?"
                marcado={emNovidadesDe(item.id)}
                disabled={Boolean(salvando)}
                onMudar={(marcado) => setSemNovidades((atual) => ({ ...atual, [item.id]: !marcado }))}
              />
              <nav className="revisao__acoes">
                {item.sourceUrl ? <a href={linkDaOrigem(item.sourceUrl)} target="_blank" rel="noopener noreferrer">Ver origem ↗</a> : <span>Origem indisponível</span>}
                <div className="revisao__decisao">
                  <button type="button" className="link-caps" disabled={Boolean(salvando)} onClick={() => setReprovando(item)}>Reprovar</button>
                  <Button disabled={!quantidadeValida(quantidades[item.id] ?? '') || Boolean(salvando) || opcoes.carregando || Boolean(opcoes.erro) || !destinosCompletos(destinos[item.id] || destinosVazios()) || !marcaDe(item)} onClick={() => aprovar(item)}>{salvando === item.id ? 'Salvando…' : 'Aprovar'}</Button>
                </div>
              </nav>
            </div>
          </Card>
        ))}</div>
        <nav className="revisao__paginacao" aria-label="Continuar revisão">
          <div className="revisao__controles-pagina">
            <Button variante="secundaria" disabled={paginaAtual <= 1 || Boolean(salvando)} onClick={() => setPagina(paginaAtual - 1)}>Anterior</Button>
            <EscolherPagina key={`fim-${paginaAtual}-${paginas}`} id="pagina-revisao-fim" pagina={paginaAtual} paginas={paginas} disabled={Boolean(salvando)} onMudar={setPagina} />
            <Button variante="secundaria" disabled={paginaAtual >= paginas || Boolean(salvando)} onClick={() => setPagina(paginaAtual + 1)}>Próxima</Button>
          </div>
        </nav>
      </>}
      <Modal aberto={Boolean(reprovando)} onFechar={() => !salvando && setReprovando(null)} titulo="Reprovar este produto?">
        {reprovando && (
          <div className="revisao__confirmar">
            <p className="t-body-lg">{nomes[reprovando.id] ?? reprovando.translatedName}</p>
            <p className="t-body-sm t-muted">Ele sai da fila de revisão e não vai para a loja. Só confirme se tem certeza de que não quer essa peça.</p>
            <div className="revisao__confirmar-acoes">
              <Button variante="secundaria" disabled={Boolean(salvando)} onClick={() => setReprovando(null)}>Cancelar</Button>
              <Button variante="primaria" disabled={Boolean(salvando)} onClick={() => reprovar(reprovando)}>{salvando === reprovando.id ? 'Reprovando…' : 'Sim, reprovar'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
