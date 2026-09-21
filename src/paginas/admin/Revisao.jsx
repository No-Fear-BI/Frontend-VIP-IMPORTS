import { useRef, useState } from 'react';
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
    trava.current = true;
    setSalvando(item.id);
    setErroDecisao('');
    try {
      await decidirProduto({ productId: item.id, status: 'approved', translatedName: nomes[item.id] ?? item.translatedName });
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
        <a href="/" target="_blank" rel="noreferrer">Ver catálogo publicado →</a>
      </header>
      <div className="revisao__resumo" aria-live="polite">
        <strong className="t-headline-lg">{carregando ? '…' : total.toLocaleString('pt-BR')}</strong> itens aguardando revisão
        <p>Confira a imagem e o título original, ajuste o nome em português e decida quais produtos publicar.</p>
      </div>
      <div className="revisao__filtros">
        <label className="campo">Categoria
          <select className="campo__input" value={categoria} disabled={Boolean(salvando)} onChange={(e) => { setCategoria(e.target.value); setPagina(1); }}>
            <option>Todos</option>{categorias.map((nome) => <option key={nome}>{nome}</option>)}
          </select>
        </label>
        <Field id="busca-revisao" rotulo="Buscar pelo título original" value={busca} disabled={Boolean(salvando)} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} />
      </div>
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
              <Field id={`nome-${item.id}`} rotulo="Nome em português" value={nomes[item.id] ?? item.translatedName} disabled={Boolean(salvando)} onChange={(e) => setNomes((atual) => ({ ...atual, [item.id]: e.target.value }))} />
              <p>{item.translatedDetails}</p>
              <details><summary>Nome original</summary><p>{item.name}</p></details>
              <nav className="revisao__acoes">
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">Ver origem ↗</a>
                <Button disabled={Boolean(salvando)} onClick={() => aprovar(item)}>{salvando === item.id ? 'Salvando…' : 'Aprovar'}</Button>
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
