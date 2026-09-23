/*
 * Um produto no painel: dados (/admin/produtos/:id), criação (/admin/produtos/novo), imagens,
 * duplicação e a grade de variações.
 *
 * Regras do backend que corrompem dado se forem ignoradas (docs/para-o-frontend.md, "produtos"
 * e "imagens e variações"):
 * - `PATCH /admin/produtos/:id` é PARCIAL: só manda o que mudou. `descricao: null` apaga o
 *   texto; campo ausente não mexe em nada. Por isso o formulário compara com o que veio da
 *   leitura e só inclui no corpo o que é diferente.
 * - `categoriaId` já diz a coleção — não existe `colecaoId` no corpo de criar/editar. A
 *   "Coleção" do formulário é só filtro de tela para o seletor de categoria: trocar a coleção
 *   troca as opções de categoria e limpa a escolhida, mas o que viaja para o backend é só o
 *   `categoriaId`.
 * - `PATCH /admin/produtos/:id/imagens/ordem` SUBSTITUI o conjunto: manda a lista COMPLETA de
 *   ids na ordem nova, nunca só o que mudou. A imagem de ordem 1 é a capa.
 * - `PATCH /admin/produtos/:id/variacoes` SUBSTITUI o conjunto inteiro (ver GradeVariacoes,
 *   inalterada desde a rodada anterior).
 * - Duplicar sempre nasce OCULTO e sem destaque — é decisão do backend, não bug.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Esqueleto, EstadoErro } from '../../components/Estados.jsx';
import { FotoProduto } from '../../components/Produto.jsx';
import { IconeFechar } from '../../components/Icones.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { catalogoService } from '../../services/catalogoService.js';
import { coresService } from '../../services/coresService.js';
import { categoriasService } from '../../services/categoriasService.js';
import { marcasService } from '../../services/marcasService.js';
import { produtosAdminService } from '../../services/produtosAdminService.js';
import { ROTULO_STATUS } from './rotulosProduto.js';
import './Produtos.css';

export default function AdminProduto() {
  const { id } = useParams();
  const location = useLocation();
  const voltarPara = `/admin/produtos${location.state?.voltarPara || ''}`;

  const produto = useRequisicao((sinal) => produtosAdminService.obter(id, sinal), [id]);

  return (
    <section className="admin__pagina">
      <Link to={voltarPara} className="link-caps admin-produto__voltar">
        ← Produtos
      </Link>

      {produto.carregando ? (
        <div className="estado-carregando" aria-busy="true" aria-label="Carregando produto">
          <Esqueleto className="esqueleto--titulo" />
          <Esqueleto className="esqueleto--linha esqueleto--curta" />
          <Esqueleto className="esqueleto--bloco" />
        </div>
      ) : produto.erro ? (
        produto.erro.status === 404 ? (
          <EstadoErroProduto />
        ) : (
          <EstadoErro erro={produto.erro} onTentar={produto.recarregar} titulo="Não conseguimos abrir este produto." />
        )
      ) : (
        // `key`: ao trocar de produto (voltar à lista e abrir outro), a cópia local reinicia do
        // que veio do banco, em vez de arrastar o estado de edição do produto anterior.
        <ProdutoCarregado key={produto.dados.id} inicial={produto.dados} aviso={location.state?.aviso} />
      )}
    </section>
  );
}

/** Formulário de um produto novo. Ao criar, segue para a edição — é lá que imagens e variações entram. */
export function AdminProdutoNovo() {
  const navegar = useNavigate();

  async function criar(dados) {
    const novo = await produtosAdminService.criar(dados);
    navegar(`/admin/produtos/${novo.id}`, {
      replace: true,
      state: { aviso: 'Produto criado. Falta adicionar fotos e a grade de variações.' },
    });
    return novo;
  }

  return (
    <section className="admin__pagina">
      <Link to="/admin/produtos" className="link-caps admin-produto__voltar">
        ← Produtos
      </Link>
      <header className="admin-produto__topo">
        <p className="t-label-caps-sm t-muted">/admin/produtos/novo</p>
        <h1 className="t-headline-lg">Novo produto</h1>
      </header>
      <DadosProduto modo="criar" onSalvar={criar} />
    </section>
  );
}

/** 404 do painel: o EstadoErro da loja mandaria para "Ver novidades", que aqui não faz sentido. */
function EstadoErroProduto() {
  return (
    <div className="estado estado--erro" role="alert">
      <h2 className="t-headline-md">Este produto não existe mais.</h2>
      <p className="estado__texto">Ele pode ter sido excluído. Volte para a lista e procure de novo.</p>
      <Button variante="secundaria" para="/admin/produtos">
        Ver produtos
      </Button>
    </div>
  );
}

/**
 * Dono do estado do produto depois de carregado: dados, imagens e variações vivem aqui, e cada
 * seção some sua atualização de volta para este componente — é o que mantém o cabeçalho (nome,
 * código, status) em dia assim que o formulário de dados salva, sem precisar recarregar a rota.
 */
function ProdutoCarregado({ inicial, aviso }) {
  const [produto, setProduto] = useState(inicial);

  return (
    <>
      <header className="admin-produto__topo">
        <div className="admin-produto__topo-linha">
          <div>
            <p className="t-codigo t-muted">{produto.codigo}</p>
            <h1 className="t-headline-lg">{produto.nome}</h1>
            <p className="t-label-caps-sm t-muted">
              {produto.marca.nome} · {produto.categoria.nome} · {produto.colecao.nome} ·{' '}
              {ROTULO_STATUS[produto.status]}
            </p>
          </div>
          <BotaoDuplicar
            produtoId={produto.id}
            render={(abrir) => (
              <Button variante="secundaria" onClick={abrir}>
                Duplicar
              </Button>
            )}
          />
        </div>
        {aviso && (
          <p className="t-body-sm admin-produto__aviso" role="status">
            {aviso}
          </p>
        )}
      </header>

      <DadosProduto modo="editar" inicial={produto} onSalvar={async (patch) => {
        const atualizado = await produtosAdminService.editar(produto.id, patch);
        setProduto(atualizado);
        return atualizado;
      }} />

      <ImagensProduto
        produtoId={produto.id}
        imagens={produto.imagens}
        onMudou={(imagens) => setProduto((atual) => ({ ...atual, imagens }))}
      />

      <GradeVariacoes produtoId={produto.id} inicial={produto.variacoes} />
    </>
  );
}

/**
 * Botão de duplicar reutilizável (listagem e tela do produto): `render` decide a aparência do
 * gatilho (link de tabela ou botão), o modal e a chamada são os mesmos nos dois lugares.
 */
export function BotaoDuplicar({ produtoId, render }) {
  const [aberto, setAberto] = useState(false);
  const [duplicando, setDuplicando] = useState(false);
  const [erro, setErro] = useState(null);
  const navegar = useNavigate();

  async function duplicar() {
    setDuplicando(true);
    setErro(null);
    try {
      const copia = await produtosAdminService.duplicar(produtoId);
      navegar(`/admin/produtos/${copia.id}`, {
        state: { aviso: 'Este produto foi duplicado e está oculto da loja. Publique-o quando estiver pronto.' },
      });
    } catch (falha) {
      setErro(falha);
      setDuplicando(false);
    }
  }

  return (
    <>
      {render(() => setAberto(true))}
      <Modal aberto={aberto} onFechar={() => setAberto(false)} titulo="Duplicar produto">
        <div className="admin-produto__duplicar">
          <p className="t-body-lg">
            A cópia nasce <strong>oculta da loja</strong>, sem destaque, com "(cópia)" no fim do
            nome. Ninguém no site vê essa cópia até você mudar o status dela para "Na loja".
          </p>
          {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
          <Button variante="primaria" largo onClick={duplicar} disabled={duplicando}>
            {duplicando ? 'Duplicando…' : 'Duplicar mesmo assim'}
          </Button>
        </div>
      </Modal>
    </>
  );
}

/** Primeiro erro de campo utilizável como mensagem geral, ou a mensagem da API. */
function erroGeralDe(erro) {
  return Object.values(erro?.campos || {})[0] || erro?.mensagem;
}

/**
 * Nome, descrição, marca, coleção/categoria e status — compartilhado por criar e editar.
 * `modo === 'criar'`: manda tudo o que foi preenchido (`onSalvar` é o POST).
 * `modo === 'editar'`: manda só o que mudou desde `inicial`, `descricao` vazia vira `null`
 * (`onSalvar` é o PATCH).
 */
function DadosProduto({ modo, inicial, onSalvar }) {
  const [nome, setNome] = useState(inicial?.nome || '');
  const [descricao, setDescricao] = useState(inicial?.descricao || '');
  const [codigo, setCodigo] = useState(inicial?.codigo || '');
  const [status, setStatus] = useState(inicial?.status || 'normal');
  const [marcaId, setMarcaId] = useState(inicial?.marcaId ? String(inicial.marcaId) : '');
  const [destinos, setDestinos] = useState(() => {
    const ids = inicial?.categoriasIds?.length ? inicial.categoriasIds : [inicial?.categoriaId];
    return ids.filter(Boolean).reduce((acc, id) => ({ ...acc, [String(id)]: true }), {});
  });
  const [categoriasIds, setCategoriasIds] = useState(() => inicial?.categoriasIds?.length ? inicial.categoriasIds.map(String) : [String(inicial?.categoriaId || '')]);
  const [colecoesMarcadas, setColecoesMarcadas] = useState(() => new Set());
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState('');

  const marcas = useRequisicao((sinal) => marcasService.listar(sinal), []);
  const colecoes = useRequisicao((sinal) => catalogoService.colecoes(sinal), []);
  const categorias = useRequisicao((sinal) => catalogoService.colecoes(sinal).then((cs) => Promise.all(cs.map((c) => categoriasService.listar(c.id, sinal)))).then((listas) => listas.flat()), []);
  useEffect(() => {
    if (categorias.dados && colecoes.dados && !colecoesMarcadas.size) {
      setColecoesMarcadas(new Set(categoriasIds.map((id) => categorias.dados.find((c) => c.id === Number(id))?.colecaoId).filter(Boolean)));
    }
  }, [categorias.dados, colecoes.dados]);
  const faltaAlgoObrigatorio = !nome.trim() || !marcaId || !categoriasIds.filter(Boolean).length;

  async function enviar(evento) {
    evento.preventDefault();
    setErro(null);
    setAviso('');

    if (modo === 'criar') {
      if (faltaAlgoObrigatorio) return;
      setSalvando(true);
      try {
        await onSalvar({
          nome: nome.trim(),
          ...(descricao.trim() ? { descricao: descricao.trim() } : {}),
          ...(codigo.trim() ? { codigo: codigo.trim() } : {}),
          status,
          marcaId: Number(marcaId),
          categoriaId: Number(categoriasIds.find(Boolean)),
          categoriasIds: categoriasIds.filter(Boolean).map(Number),
        });
      } catch (falha) {
        setErro(falha);
        setSalvando(false);
      }
      return;
    }

    // Editar: PATCH parcial — só o que mudou desde a leitura.
    const patch = {};
    if (nome.trim() && nome.trim() !== inicial.nome) patch.nome = nome.trim();
    const descricaoAtual = descricao.trim() || null;
    if (descricaoAtual !== (inicial.descricao || null)) patch.descricao = descricaoAtual;
    if (codigo.trim() && codigo.trim().toUpperCase() !== inicial.codigo) patch.codigo = codigo.trim();
    if (status !== inicial.status) patch.status = status;
    if (marcaId && Number(marcaId) !== inicial.marcaId) patch.marcaId = Number(marcaId);
    const categoriasAtuais = categoriasIds.filter(Boolean).map(Number);
    const categoriasIniciais = (inicial.categoriasIds?.length ? inicial.categoriasIds : [inicial.categoriaId]).map(Number);
    if (JSON.stringify(categoriasAtuais) !== JSON.stringify(categoriasIniciais)) patch.categoriasIds = categoriasAtuais;

    if (Object.keys(patch).length === 0) {
      setAviso('Nada para salvar: nada mudou.');
      return;
    }
    setSalvando(true);
    try {
      await onSalvar(patch);
      setAviso('Dados salvos.');
    } catch (falha) {
      setErro(falha);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="admin-produto__bloco admin-produto__dados" onSubmit={enviar}>
      <h2 className="t-headline-md">Dados do produto</h2>

      <Field
        id="produto-nome"
        rotulo="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        erro={erro?.campos?.nome}
        maxLength={180}
        required
      />

      <div className="campo">
        <label htmlFor="produto-descricao" className="t-label-caps">
          Descrição
        </label>
        <textarea
          id="produto-descricao"
          className="campo__input admin-produto__descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
        />
      </div>

      <div className="admin-produto__form-grade">
        <CampoSelecao
          id="produto-marca"
          rotulo="Marca"
          valor={marcaId}
          onMudar={setMarcaId}
          opcoes={marcas.dados?.map((m) => ({ valor: m.id, rotulo: m.ativa ? m.nome : `${m.nome} (inativa)` }))}
          erro={erro?.campos?.marcaId}
          required
        />
        <fieldset className="admin-produto__destinos">
          <legend className="t-label-caps">Coleções e categorias</legend>
          {colecoes.dados?.map((colecao) => {
            const opcoes = (categorias.dados || []).filter((categoria) => categoria.colecaoId === colecao.id);
            const atual = categoriasIds.find((id) => opcoes.some((categoria) => String(categoria.id) === id)) || '';
            const marcada = colecoesMarcadas.has(colecao.id);
            return <div key={colecao.id} className="admin-produto__destino">
              <label><input type="checkbox" checked={marcada} onChange={(e) => {
                const proximo = categoriasIds.filter((id) => !opcoes.some((categoria) => String(categoria.id) === id));
                setColecoesMarcadas((anterior) => { const novo = new Set(anterior); e.target.checked ? novo.add(colecao.id) : novo.delete(colecao.id); return novo; });
                setCategoriasIds(e.target.checked ? [...proximo, ''] : proximo);
              }} /> {colecao.nome}</label>
              <CampoSelecao id={`produto-categoria-${colecao.id}`} rotulo={`Categoria — ${colecao.nome}`} valor={atual}
                onMudar={(valor) => setCategoriasIds([...categoriasIds.filter((id) => !opcoes.some((categoria) => String(categoria.id) === id)), valor])}
                opcoes={opcoes.map((c) => ({ valor: c.id, rotulo: c.nome }))} disabled={!marcada} />
            </div>;
          })}
        </fieldset>
        <CampoSelecao
          id="produto-status"
          rotulo="Status"
          valor={status}
          onMudar={setStatus}
          opcoes={Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => ({ valor, rotulo }))}
          erro={erro?.campos?.status}
        />
      </div>

      <Field
        id="produto-codigo"
        rotulo="Código"
        ajuda={modo === 'criar' ? 'Deixe vazio para o backend gerar (ex.: CHN-0042).' : undefined}
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        erro={erro?.campos?.codigo}
        maxLength={32}
      />

      {erro && !erro.campos && <ErroGeral>{erro.mensagem}</ErroGeral>}
      {erro?.campos && Object.keys(erro.campos).some((c) => !['nome', 'descricao', 'codigo', 'status', 'marcaId', 'categoriaId', 'categoriasIds'].includes(c)) && (
        <ErroGeral>{erroGeralDe(erro)}</ErroGeral>
      )}

      <div className="admin-produto__acoes">
        <Button
          variante="primaria"
          type="submit"
          disabled={salvando || (modo === 'criar' && faltaAlgoObrigatorio)}
        >
          {salvando ? 'Salvando…' : modo === 'criar' ? 'Criar produto' : 'Salvar dados'}
        </Button>
        <p className="t-body-sm t-muted" role="status">
          {aviso}
        </p>
      </div>
    </form>
  );
}

/** Seletor com rótulo, erro embaixo (mesmo padrão de `Field`) e "Carregando…" enquanto as opções não chegam. */
function CampoSelecao({ id, rotulo, valor, onMudar, opcoes, erro, vazio, disabled = false, required = false }) {
  const pronto = Array.isArray(opcoes);
  return (
    <div className={`campo${erro ? ' campo--erro' : ''}`}>
      <label htmlFor={id} className="t-label-caps">
        {rotulo}
      </label>
      <select
        id={id}
        className="campo__input"
        value={valor}
        disabled={disabled || !pronto}
        required={required}
        onChange={(e) => onMudar(e.target.value)}
      >
        <option value="">{vazio || (pronto ? 'Selecione' : 'Carregando…')}</option>
        {pronto &&
          opcoes.map((opcao) => (
            <option key={opcao.valor} value={String(opcao.valor)}>
              {opcao.rotulo}
            </option>
          ))}
      </select>
      {erro && <p className="campo__erro t-body-sm">{erro}</p>}
    </div>
  );
}

/**
 * Imagens do produto: acrescentar por URL, excluir e reordenar. Sem estado próprio de lista —
 * `imagens` vem sempre do pai (`ProdutoCarregado`), e cada ação chama a API e devolve a galeria
 * inteira já renumerada, que sobe por `onMudou`. Evita a lista da tela e a do servidor
 * divergirem depois de uma reordenação ou exclusão.
 */
function ImagensProduto({ produtoId, imagens, onMudou }) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [ocupada, setOcupada] = useState(null);
  const [erro, setErro] = useState(null);

  const cheia = imagens.length >= 10;

  async function adicionar(evento) {
    evento.preventDefault();
    if (!url.trim() || cheia) return;
    setEnviando(true);
    setErro(null);
    try {
      const novas = await produtosAdminService.adicionarImagens(produtoId, [
        { url: url.trim(), ...(alt.trim() ? { alt: alt.trim() } : {}) },
      ]);
      onMudou(novas);
      setUrl('');
      setAlt('');
    } catch (falha) {
      setErro(falha);
    } finally {
      setEnviando(false);
    }
  }

  async function excluir(imagemId) {
    setOcupada(imagemId);
    setErro(null);
    try {
      onMudou(await produtosAdminService.excluirImagem(imagemId));
    } catch (falha) {
      setErro(falha);
    } finally {
      setOcupada(null);
    }
  }

  async function mover(indice, direcao) {
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= imagens.length) return;
    const reordenadas = [...imagens];
    [reordenadas[indice], reordenadas[alvo]] = [reordenadas[alvo], reordenadas[indice]];
    setOcupada(imagens[indice].id);
    setErro(null);
    try {
      onMudou(await produtosAdminService.reordenarImagens(produtoId, reordenadas.map((i) => i.id)));
    } catch (falha) {
      setErro(falha);
    } finally {
      setOcupada(null);
    }
  }

  return (
    <div className="admin-produto__bloco">
      <h2 className="t-headline-md">Imagens</h2>
      <p className="t-body-sm t-muted admin-produtos__ajuda">
        A primeira é a <strong>capa</strong>: é o que aparece na grade da loja.
      </p>

      {imagens.length === 0 ? (
        <p className="t-body-sm t-muted">Nenhuma imagem ainda.</p>
      ) : (
        <ul className="admin-produto__imagens">
          {imagens.map((imagem, i) => (
            <li key={imagem.id} className="admin-produto__imagem">
              <FotoProduto url={imagem.url} alt={imagem.alt || ''} className="admin-produto__imagem-foto" />
              <div className="admin-produto__imagem-info">
                <p className="t-label-caps-sm">{i === 0 ? 'Capa' : `Ordem ${i + 1}`}</p>
                <p className="t-body-sm t-muted admin-produto__imagem-url">{imagem.url}</p>
              </div>
              <div className="admin-produto__imagem-acoes">
                <button
                  type="button"
                  className="link-caps"
                  disabled={i === 0 || Boolean(ocupada)}
                  onClick={() => mover(i, -1)}
                >
                  Mover para cima
                </button>
                <button
                  type="button"
                  className="link-caps"
                  disabled={i === imagens.length - 1 || Boolean(ocupada)}
                  onClick={() => mover(i, 1)}
                >
                  Mover para baixo
                </button>
                <button
                  type="button"
                  className="admin-produto__remover"
                  onClick={() => excluir(imagem.id)}
                  disabled={Boolean(ocupada)}
                  aria-label="Excluir esta imagem"
                >
                  <IconeFechar />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {erro && <ErroGeral>{erroGeralDe(erro)}</ErroGeral>}

      <form className="admin-produto__nova-imagem" onSubmit={adicionar}>
        <Field
          id="imagem-url"
          rotulo="URL da imagem"
          ajuda="Só https."
          className="admin-produto__nova-imagem-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={enviando || cheia}
          placeholder="https://…"
        />
        <Field
          id="imagem-alt"
          rotulo="Texto alternativo"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          disabled={enviando || cheia}
        />
        <Button variante="secundaria" type="submit" disabled={enviando || cheia || !url.trim()}>
          {enviando ? 'Adicionando…' : 'Adicionar'}
        </Button>
      </form>
      {cheia && (
        <p className="t-body-sm t-muted">Este produto já tem o máximo de 10 imagens.</p>
      )}
    </div>
  );
}

/** A variação como a tela a edita. `chave` é só para o React; o backend não recebe id. */
function paraLinha(variacao) {
  return {
    chave: variacao.id ?? `nova-${Math.random()}`,
    tipo: variacao.tipo,
    valor: variacao.valor,
    corId: variacao.corId ?? null,
    disponivel: variacao.disponivel ?? true,
  };
}

/** O corpo do PATCH: a grade INTEIRA, tamanhos e cores, cada cor com o seu `corId`. */
function paraEnvio(linhas) {
  return linhas.map(({ tipo, valor, corId, disponivel }) =>
    tipo === 'cor' && corId != null ? { tipo, valor, corId, disponivel } : { tipo, valor, disponivel },
  );
}

const assinatura = (linhas) => JSON.stringify(paraEnvio(linhas));
const normalizar = (texto) => texto.trim().toLocaleLowerCase('pt-BR');

function GradeVariacoes({ produtoId, inicial }) {
  const [salva, setSalva] = useState(() => inicial.map(paraLinha));
  const [linhas, setLinhas] = useState(salva);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState('');

  const paleta = useRequisicao((sinal) => coresService.listar(sinal), []);

  const tamanhos = linhas.filter((l) => l.tipo === 'tamanho');
  const cores = linhas.filter((l) => l.tipo === 'cor');
  const mudou = assinatura(linhas) !== assinatura(salva);

  function alterar(proximas) {
    setLinhas(proximas);
    setErro(null);
    setAviso('');
  }

  const remover = (chave) => alterar(linhas.filter((l) => l.chave !== chave));
  const trocarDisponivel = (chave) =>
    alterar(linhas.map((l) => (l.chave === chave ? { ...l, disponivel: !l.disponivel } : l)));

  async function salvar() {
    setSalvando(true);
    setErro(null);
    setAviso('');
    try {
      const gravada = (await produtosAdminService.definirVariacoes(produtoId, paraEnvio(linhas))).map(paraLinha);
      setSalva(gravada);
      setLinhas(gravada);
      setAviso('Grade salva.');
    } catch (falha) {
      setErro(falha);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="admin-produto__grade">
      <header className="admin-produto__grade-topo">
        <h2 className="t-headline-md">Grade de variações</h2>
        <p className="t-body-sm t-muted admin-produtos__ajuda">
          O cliente escolhe tamanho e cor na página do produto. Tirar uma variação daqui também a
          tira da seleção de quem já tinha escolhido.
        </p>
      </header>

      <fieldset className="admin-produto__bloco" disabled={salvando}>
        <legend className="t-label-caps">Tamanhos</legend>
        <ListaVariacoes
          linhas={tamanhos}
          vazio="Sem tamanho: o produto aparece como tamanho único."
          onRemover={remover}
          onTrocarDisponivel={trocarDisponivel}
        />
        <NovoTamanho
          existentes={tamanhos}
          onAdicionar={(valor) => alterar([...linhas, paraLinha({ tipo: 'tamanho', valor })])}
        />
      </fieldset>

      <fieldset className="admin-produto__bloco" disabled={salvando}>
        <legend className="t-label-caps">Cores</legend>
        <ListaVariacoes
          linhas={cores}
          paleta={paleta.dados}
          vazio="Sem cor definida."
          onRemover={remover}
          onTrocarDisponivel={trocarDisponivel}
        />
        {paleta.carregando ? (
          <Esqueleto className="esqueleto--controle" />
        ) : paleta.erro ? (
          <div className="admin-produto__paleta-erro">
            <ErroGeral>Não conseguimos carregar a paleta de cores. {paleta.erro.mensagem}</ErroGeral>
            <Button variante="secundaria" onClick={paleta.recarregar}>
              Tentar de novo
            </Button>
          </div>
        ) : (
          <NovaCor
            paleta={paleta.dados}
            existentes={cores}
            onAdicionar={(cor) =>
              alterar([...linhas, paraLinha({ tipo: 'cor', valor: cor.nome, corId: cor.id })])
            }
          />
        )}
      </fieldset>

      {erro && (
        <ErroGeral>
          {erro.campos?.variacoes || erro.campos?.corId || erro.mensagem}
        </ErroGeral>
      )}

      <div className="admin-produto__acoes">
        <Button variante="primaria" onClick={salvar} disabled={!mudou || salvando}>
          {salvando ? 'Salvando…' : 'Salvar grade'}
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

function ListaVariacoes({ linhas, paleta, vazio, onRemover, onTrocarDisponivel }) {
  if (linhas.length === 0) return <p className="t-body-sm t-muted">{vazio}</p>;
  const porId = new Map((paleta || []).map((cor) => [cor.id, cor]));

  return (
    <ul className="admin-produto__lista">
      {linhas.map((linha) => {
        const cor = linha.corId != null ? porId.get(linha.corId) : null;
        return (
          <li key={linha.chave} className="admin-produto__variacao">
            <span className="t-body-sm admin-produto__valor">
              {/* O nome da paleta manda (é o que o backend grava com corId); o texto é reserva. */}
              {cor?.nome || linha.valor}
              {cor && !cor.ativa && <span className="t-muted"> · escondida do filtro da loja</span>}
              {linha.tipo === 'cor' && linha.corId == null && (
                <span className="t-muted"> · fora da paleta</span>
              )}
            </span>
            <label className="admin-produto__disponivel t-body-sm">
              <input type="checkbox" checked={linha.disponivel} onChange={() => onTrocarDisponivel(linha.chave)} />
              Disponível
            </label>
            <button
              type="button"
              className="admin-produto__remover"
              onClick={() => onRemover(linha.chave)}
              aria-label={`Tirar ${cor?.nome || linha.valor} da grade`}
            >
              <IconeFechar />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function NovoTamanho({ existentes, onAdicionar }) {
  const [texto, setTexto] = useState('');
  const valor = texto.trim();
  const repetido = existentes.some((l) => normalizar(l.valor) === normalizar(valor));

  function adicionar(evento) {
    evento.preventDefault();
    if (!valor || repetido) return;
    onAdicionar(valor);
    setTexto('');
  }

  return (
    <div className="campo admin-produto__novo">
      <label htmlFor="novo-tamanho" className="t-label-caps-sm">
        Novo tamanho
      </label>
      <div className="admin-produto__novo-linha">
        <input
          id="novo-tamanho"
          className="campo__input"
          value={texto}
          maxLength={60}
          placeholder="P, 38, Único…"
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionar(e)}
          aria-describedby={repetido ? 'novo-tamanho-erro' : undefined}
        />
        <Button variante="secundaria" onClick={adicionar} disabled={!valor || repetido}>
          Adicionar
        </Button>
      </div>
      {repetido && (
        <p id="novo-tamanho-erro" className="t-body-sm t-muted">
          Este tamanho já está na grade.
        </p>
      )}
    </div>
  );
}

/**
 * Cor nova vem da paleta, nunca de texto digitado: pelo caminho de texto um erro de digitação
 * vira cor nova. As inativas aparecem (marcadas) porque "escondida do filtro" não é "proibida".
 */
function NovaCor({ paleta, existentes, onAdicionar }) {
  const [escolhida, setEscolhida] = useState('');
  const usadas = new Set(existentes.map((l) => l.corId));
  const livres = paleta.filter((cor) => !usadas.has(cor.id));

  function adicionar() {
    const cor = paleta.find((c) => String(c.id) === escolhida);
    if (!cor) return;
    onAdicionar(cor);
    setEscolhida('');
  }

  if (paleta.length === 0) {
    return (
      <p className="t-body-sm t-muted">
        A paleta está vazia. <Link to="/admin/cores" className="link-caps">Cadastrar cores</Link>
      </p>
    );
  }

  return (
    <div className="campo admin-produto__novo">
      <label htmlFor="nova-cor" className="t-label-caps-sm">
        Nova cor
      </label>
      <div className="admin-produto__novo-linha">
        <select
          id="nova-cor"
          className="campo__input"
          value={escolhida}
          onChange={(e) => setEscolhida(e.target.value)}
          disabled={livres.length === 0}
        >
          <option value="">{livres.length === 0 ? 'Todas as cores já estão na grade' : 'Escolha na paleta'}</option>
          {livres.map((cor) => (
            <option key={cor.id} value={String(cor.id)}>
              {cor.ativa ? cor.nome : `${cor.nome} (escondida do filtro)`}
            </option>
          ))}
        </select>
        <Button variante="secundaria" onClick={adicionar} disabled={!escolhida}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}
