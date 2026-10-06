import { useState } from 'react';
import { clienteService } from '../services/clienteService.js';
import { favoritosService } from '../services/favoritosService.js';
import CabecalhoSecao from '../components/CabecalhoSecao.jsx';
import Field, { ErroGeral } from '../components/ui/Field.jsx';
import { EsqueletoGrade, Esqueleto, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import FormIdentificacao from '../components/FormIdentificacao.jsx';
import { CartaoProduto } from '../components/Produto.jsx';
import { useSessaoCliente } from '../contexto/SessaoCliente.jsx';
import { useRequisicao } from '../hooks/useRequisicao.js';
import Button from '../components/ui/Button.jsx';
import './Conta.css';


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
          <p className="t-body-lg">Entre com seu e-mail para ver seus favoritos.</p>
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
