import { useEffect, useState } from 'react';
import { clienteService } from '../services/clienteService.js';
import { favoritosService } from '../services/favoritosService.js';
import { selecoesService } from '../services/selecoesService.js';
import CabecalhoSecao from '../components/CabecalhoSecao.jsx';
import Field, { ErroGeral } from '../components/ui/Field.jsx';
import { EsqueletoGrade, Esqueleto, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import FormIdentificacao from '../components/FormIdentificacao.jsx';
import { CartaoProduto } from '../components/Produto.jsx';
import { useSessaoCliente } from '../contexto/SessaoCliente.jsx';
import { useRequisicao } from '../hooks/useRequisicao.js';
import Button from '../components/ui/Button.jsx';
import './Conta.css';

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' });

export default function Conta() {
  const { cliente, verificando } = useSessaoCliente();

  const topo = (
    <header className="topo-pagina">
      <p className="t-label-caps t-muted">Área do cliente</p>
      <h1 className="t-headline-lg">Minha conta</h1>
    </header>
  );

  if (verificando) {
    return (
      <div className="container conta">
        {topo}
        <Esqueleto className="esqueleto--bloco" style={{ maxWidth: 'var(--largura-formulario)' }} />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="container conta">
        {topo}
        <div className="conta__identificar">
          <p className="t-body-lg">Entre com seu e-mail para ver favoritos e seleções enviadas. Não tem senha.</p>
          <FormIdentificacao idBase="conta" rotuloBotao="Entrar" />
        </div>
      </div>
    );
  }

  return (
    <div className="container conta">
      {topo}
      <div className="conta__grade">
        <DadosCliente />
        <div className="conta__principal">
          <Favoritos />
          <Historico />
        </div>
      </div>
    </div>
  );
}

function DadosCliente() {
  const { cliente, setCliente, sair, avisar } = useSessaoCliente();
  const [form, setForm] = useState({ nome: cliente.nome || '', telefone: cliente.telefone || '' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [saindo, setSaindo] = useState(false);

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const atualizado = await clienteService.atualizarEu({ nome: form.nome || null, telefone: form.telefone || null });
      setCliente(atualizado);
      avisar('Dados salvos.');
    } catch (falha) {
      setErro(falha);
    } finally {
      setSalvando(false);
    }
  }

  async function encerrar() {
    setSaindo(true);
    try {
      await sair();
    } catch (falha) {
      setErro(falha);
      setSaindo(false);
    }
  }

  return (
    <aside className="conta__dados" aria-labelledby="titulo-dados">
      <h2 id="titulo-dados" className="t-label-caps">
        Seus dados
      </h2>
      <p className="t-body-sm">
        <span className="t-muted">E-mail</span>
        <br />
        {cliente.email}
      </p>
      <form onSubmit={salvar} className="conta__form" noValidate>
        <Field
          id="conta-nome"
          rotulo="Nome"
          autoComplete="name"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          erro={erro?.campos?.nome}
        />
        <Field
          id="conta-telefone"
          rotulo="Telefone (WhatsApp)"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          ajuda="Ajuda o atendimento a achar sua conversa."
          value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          erro={erro?.campos?.telefone}
        />
        {erro && !erro.campos?.nome && !erro.campos?.telefone && <ErroGeral>{erro.mensagem}</ErroGeral>}
        <Button variante="secundaria" largo type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar dados'}
        </Button>
      </form>
      <hr className="filete" />
      <button type="button" className="link-caps" onClick={encerrar} disabled={saindo}>
        {saindo ? 'Saindo…' : 'Sair desta conta'}
      </button>
    </aside>
  );
}

function Favoritos() {
  const { favoritos } = useSessaoCliente();
  const { dados, erro, carregando, recarregar } = useRequisicao((sinal) => favoritosService.listar(sinal), [favoritos.size]);

  return (
    <section aria-labelledby="titulo-favoritos">
      <CabecalhoSecao id="titulo-favoritos" rotulo="Guardadas para depois" titulo="Favoritos" />
      {carregando && !dados ? (
        <EsqueletoGrade quantidade={3} className="grade-produtos grade-produtos--conta" />
      ) : erro ? (
        <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos carregar seus favoritos." />
      ) : dados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum favorito ainda."
          texto="Na página de uma peça, toque em Salvar nos favoritos."
          acao={{ rotulo: 'Ver novidades', para: '/novidades' }}
        />
      ) : (
        <div className="grade-produtos grade-produtos--conta">
          {dados.map((produto) => (
            <CartaoProduto key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </section>
  );
}

function Historico() {
  const [paginas, setPaginas] = useState({ itens: [], cursor: null, carregando: true, erro: null, fim: false });

  async function carregar(cursor) {
    setPaginas((p) => ({ ...p, carregando: true, erro: null }));
    try {
      const resposta = await selecoesService.historico(cursor);
      setPaginas((p) => ({
        itens: cursor ? [...p.itens, ...resposta.dados] : resposta.dados,
        cursor: resposta.paginacao.proximoCursor || null,
        carregando: false,
        erro: null,
        fim: !resposta.paginacao.proximoCursor,
      }));
    } catch (erro) {
      setPaginas((p) => ({ ...p, carregando: false, erro }));
    }
  }

  useEffect(() => {
    carregar(null);
  }, []);

  return (
    <section className="secao" aria-labelledby="titulo-historico">
      <CabecalhoSecao id="titulo-historico" rotulo="O que você já mandou" titulo="Seleções enviadas" />
      {paginas.carregando && paginas.itens.length === 0 ? (
        <Esqueleto className="esqueleto--bloco" />
      ) : paginas.erro && paginas.itens.length === 0 ? (
        <EstadoErro erro={paginas.erro} onTentar={() => carregar(null)} titulo="Não conseguimos carregar o histórico." />
      ) : paginas.itens.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma seleção enviada."
          texto="Quando você chamar o atendimento pelo WhatsApp, a lista de peças fica registrada aqui."
          acao={{ rotulo: 'Ver novidades', para: '/novidades' }}
        />
      ) : (
        <>
          <ol className="historico">
            {paginas.itens.map((selecao) => (
              <li key={selecao.id} className="historico__item">
                <div className="historico__cabecalho">
                  <p className="t-label-caps">{formatoData.format(new Date(selecao.criadoEm))}</p>
                  <p className="t-body-sm t-muted">
                    {selecao.totalItens} {selecao.totalItens === 1 ? 'peça' : 'peças'}
                  </p>
                </div>
                <ul className="historico__pecas">
                  {selecao.itens.map((peca, i) => (
                    <li key={`${peca.codigo}-${i}`} className="t-body-sm">
                      <span className="t-codigo">{peca.codigo}</span> {peca.nome}{' '}
                      <span className="t-muted">
                        · {peca.marca}
                        {peca.variacao && ` · ${peca.variacao}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          {paginas.erro && <ErroGeral>{paginas.erro.mensagem}</ErroGeral>}
          {!paginas.fim && (
            <Button
              variante="secundaria"
              className="historico__mais"
              onClick={() => carregar(paginas.cursor)}
              disabled={paginas.carregando}
            >
              {paginas.carregando ? 'Carregando…' : 'Ver seleções anteriores'}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
