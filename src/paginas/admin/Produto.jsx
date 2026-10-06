/*
 * Um produto no painel: dados (/admin/produtos/:id), criação (/admin/produtos/novo), imagens,
 * duplicação e a grade de variações.
 *
 * Regras do backend que corrompem dado se forem ignoradas (docs/para-o-frontend.md, "produtos"
 * e "imagens e variações"):
 * - `PATCH /admin/produtos/:id` é PARCIAL: só manda o que mudou. `descricao: null` apaga o
 *   texto; campo ausente não mexe em nada. Por isso o formulário compara com o que veio da
 *   leitura e só inclui no corpo o que é diferente.
 * - Desde a migração 0015 Feminino/Masculino são o PÚBLICO do produto (`publicos`, os dois =
 *   unissex), campo próprio e obrigatório; a categoria não pertence a coleção. Criar manda
 *   `categoriaId` + `publicos`; editar manda `categoriasIds` (a primeira é a principal) e
 *   `publicos` só se mudaram.
 * - `PATCH /admin/produtos/:id/imagens/ordem` SUBSTITUI o conjunto: manda a lista COMPLETA de
 *   ids na ordem nova, nunca só o que mudou. A imagem de ordem 1 é a capa.
 * - `PATCH /admin/produtos/:id/variacoes` SUBSTITUI o conjunto inteiro (ver GradeVariacoes,
 *   inalterada desde a rodada anterior).
 * - Duplicar sempre nasce OCULTO e sem destaque — é decisão do backend, não bug.
 */

import { useState } from 'react';
import CampoNovidades from './CampoNovidades.jsx';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Esqueleto, EstadoErro } from '../../components/Estados.jsx';
import { FotoProduto } from '../../components/Produto.jsx';
import { IconeFechar } from '../../components/Icones.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral, LegendaObrigatorio, MarcaObrigatorio } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { coresService } from '../../services/coresService.js';
import { categoriasService } from '../../services/categoriasService.js';
import { marcasService } from '../../services/marcasService.js';
import { produtosAdminService } from '../../services/produtosAdminService.js';
import { formatarCentavos, lerPreco } from '../../lib/preco.js';
import { ROTULO_STATUS } from './rotulosProduto.js';
import CampoPreco from './CampoPreco.jsx';
import './Produtos.css';
import DestinosProduto, { destinosCompletos, destinosDosIds, destinosVazios } from './DestinosProduto.jsx';

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

/**
 * Formulário de um produto novo. Ao criar, segue para a edição — é lá que a grade de variações
 * entra. As imagens já podem ser escolhidas aqui: como o produto ainda não existe, elas ficam
 * pendentes em memória (`imagensPendentes`) até o `POST /produtos` devolver o id — uma URL
 * digitada só precisa do `POST /imagens` depois; um arquivo escolhido (ver `ImagensPendentes`)
 * também precisa do `POST /imagens/upload`, que exige produtoId e por isso não dava pra chamar
 * antes de o produto existir.
 */
export function AdminProdutoNovo() {
  const navegar = useNavigate();
  const [imagensPendentes, setImagensPendentes] = useState([]);

  async function criar(dados) {
    const novo = await produtosAdminService.criar(dados);
    if (imagensPendentes.length === 0) {
      navegar(`/admin/produtos/${novo.id}`, {
        replace: true,
        state: { aviso: 'Produto criado. Falta adicionar fotos e a grade de variações.' },
      });
      return novo;
    }
    try {
      // Pendente de arquivo (ainda não tinha produtoId pra chamar o upload de
      // verdade — ver ImagensPendentes) sobe agora, que o id já existe.
      const resolvidas = await Promise.all(
        imagensPendentes.map(async ({ url, alt, arquivo }) => {
          if (arquivo) {
            const enviada = await produtosAdminService.uploadImagem(novo.id, arquivo, alt || undefined);
            return { url: enviada.url, ...(enviada.alt ? { alt: enviada.alt } : {}) };
          }
          return { url, ...(alt ? { alt } : {}) };
        }),
      );
      await produtosAdminService.adicionarImagens(novo.id, resolvidas);
      navegar(`/admin/produtos/${novo.id}`, {
        replace: true,
        state: { aviso: 'Produto criado. Falta a grade de variações.' },
      });
    } catch {
      // O produto já existe — as imagens ficam para tentar de novo na tela dele.
      navegar(`/admin/produtos/${novo.id}`, {
        replace: true,
        state: { aviso: 'Produto criado, mas as imagens não foram salvas. Tente adicioná-las aqui.' },
      });
    }
    return novo;
  }

  return (
    <section className="admin__pagina">
      <Link to="/admin/produtos" className="link-caps admin-produto__voltar">
        ← Produtos
      </Link>
      <header className="admin-produto__topo">
        <h1 className="t-headline-lg">Novo produto</h1>
      </header>
      <DadosProduto modo="criar" onSalvar={criar} />
      <ImagensPendentes imagens={imagensPendentes} onMudar={setImagensPendentes} />
    </section>
  );
}

/** 404 do painel: o EstadoErro da loja mandaria para "Ver todas as peças", que aqui não faz sentido. */
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
  const navegar = useNavigate();

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
          <div className="admin-produto__acoes-topo">
            <BotaoDuplicar
              produtoId={produto.id}
              render={(abrir) => (
                <Button variante="secundaria" onClick={abrir}>
                  Duplicar
                </Button>
              )}
            />
            <BotaoExcluir
              produto={produto}
              render={(abrir) => (
                <Button variante="secundaria" onClick={abrir}>
                  Excluir produto
                </Button>
              )}
              onExcluido={(aviso) => navegar('/admin/produtos', { replace: true, state: { aviso } })}
            />
          </div>
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
      }}>
        <GradeVariacoes produtoId={produto.id} inicial={produto.variacoes} />
      </DadosProduto>

      <ImagensProduto
        produtoId={produto.id}
        imagens={produto.imagens}
        onMudou={(imagens) => setProduto((atual) => ({ ...atual, imagens }))}
      />
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

/**
 * Excluir o produto, com confirmação explícita — é irreversível. Reutilizável (listagem e tela
 * do produto): `render` decide a aparência do gatilho, `onExcluido` decide para onde ir depois.
 * A mensagem de erro é a da API (`erro.mensagem`), sem texto genérico por cima.
 */
export function BotaoExcluir({ produto, render, onExcluido }) {
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState(null);

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    try {
      await produtosAdminService.excluir(produto.id);
      setAberto(false);
      setExcluindo(false);
      onExcluido(`Produto ${produto.codigo} (${produto.nome}) excluído.`);
    } catch (falha) {
      setErro(falha);
      setExcluindo(false);
    }
  }

  return (
    <>
      {render(() => {
        setErro(null);
        setAberto(true);
      })}
      <Modal aberto={aberto} onFechar={() => !excluindo && setAberto(false)} titulo="Excluir produto">
        <div className="admin-produto__duplicar">
          <p className="t-body-lg">
            Excluir <strong>{produto.codigo} — {produto.nome}</strong>? <strong>Não dá para desfazer.</strong>{' '}
            As imagens, as variações, os favoritos e os itens de seleção em aberto dele somem. As
            seleções que já foram enviadas ao WhatsApp continuam no histórico, sem o link para
            o produto.
          </p>
          {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
          <Button variante="primaria" largo onClick={excluir} disabled={excluindo}>
            {excluindo ? 'Excluindo…' : 'Excluir definitivamente'}
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
function DadosProduto({ modo, inicial, onSalvar, children }) {
  const [nome, setNome] = useState(inicial?.nome || '');
  const [descricao, setDescricao] = useState(inicial?.descricao || '');
  const [codigo, setCodigo] = useState(inicial?.codigo || '');
  const [origemUrl, setOrigemUrl] = useState(inicial?.origemUrl || '');
  const [preco, setPreco] = useState(inicial?.precoCentavos != null ? formatarCentavos(inicial.precoCentavos) : '');
  const [status, setStatus] = useState(inicial?.status || 'normal');
  const [emNovidades, setEmNovidades] = useState(inicial?.emNovidades ?? true);
  const [marcaId, setMarcaId] = useState(inicial?.marcaId ? String(inicial.marcaId) : '');
  const [destinosEditados, setDestinosEditados] = useState(modo === 'criar' ? destinosVazios() : null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState('');

  const marcas = useRequisicao((sinal) => marcasService.listar(sinal), []);
  const categorias = useRequisicao((sinal) => categoriasService.listar(sinal), []);

  const idsIniciais = inicial?.categoriasIds || (inicial?.categoriaId ? [inicial.categoriaId] : []);
  const publicosIniciais = inicial?.publicos || [];
  const destinos = destinosEditados ?? destinosDosIds(idsIniciais, publicosIniciais);
  const opcoesCarregando = categorias.carregando;
  const erroOpcoes = categorias.erro;
  const faltaAlgoObrigatorio =
    !nome.trim() || !marcaId || !destinosCompletos(destinos) || opcoesCarregando || Boolean(erroOpcoes);
  const recarregarOpcoes = () => categorias.recarregar();

  async function enviar(evento) {
    evento.preventDefault();
    setErro(null);
    setAviso('');
    if (faltaAlgoObrigatorio) return;
    const { centavos: precoCentavos, erro: erroPreco } = lerPreco(preco);
    if (erroPreco) {
      setErro({ campos: { precoCentavos: erroPreco } });
      return;
    }

    if (modo === 'criar') {
      if (faltaAlgoObrigatorio) return;
      setSalvando(true);
      try {
        await onSalvar({
          nome: nome.trim(),
          ...(descricao.trim() ? { descricao: descricao.trim() } : {}),
          ...(codigo.trim() ? { codigo: codigo.trim() } : {}),
          ...(origemUrl.trim() ? { origemUrl: origemUrl.trim() } : {}),
          ...(precoCentavos !== null ? { precoCentavos } : {}),
          status,
          emNovidades,
          marcaId: Number(marcaId),
          categoriaId: Number(destinos.categoriasIds[0]),
          publicos: destinos.publicos,
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
    // Vazio apaga o link (`null`).
    if ((origemUrl.trim() || null) !== (inicial.origemUrl || null)) patch.origemUrl = origemUrl.trim() || null;
    // Vazio apaga o preço (`null`).
    if (precoCentavos !== (inicial.precoCentavos ?? null)) patch.precoCentavos = precoCentavos;
    if (status !== inicial.status) patch.status = status;
    if (emNovidades !== inicial.emNovidades) patch.emNovidades = emNovidades;
    if (marcaId && Number(marcaId) !== inicial.marcaId) patch.marcaId = Number(marcaId);
    // A ordem importa: a primeira categoria é a principal.
    const novosIds = destinos.categoriasIds.map(Number);
    if (JSON.stringify(novosIds) !== JSON.stringify(idsIniciais)) patch.categoriasIds = novosIds;
    if (JSON.stringify([...destinos.publicos].sort()) !== JSON.stringify([...publicosIniciais].sort())) {
      patch.publicos = destinos.publicos;
    }

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
    <section className="admin-produto__bloco admin-produto__dados">
      <h2 className="t-headline-md">Dados do produto</h2>
      <form className="admin-produto__dados-form" onSubmit={enviar}>
        <LegendaObrigatorio />

        <Field
          id="produto-nome"
          rotulo="Nome"
          obrigatorio
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          erro={erro?.campos?.nome}
          className="admin-produto__meia"
          maxLength={180}
          required
        />

        <Field
          id="produto-codigo"
          rotulo="Código"
          className="admin-produto__meia"
          ajuda={modo === 'criar' ? 'Deixe vazio para geração automática' : undefined}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          erro={erro?.campos?.codigo}
          maxLength={32}
        />

        <div className="campo admin-produto__campo-descricao">
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

        <Field
          id="produto-origem"
          rotulo="Link de origem"
          type="url"
          inputMode="url"
          ajuda="Opcional. Álbum ou página de onde a peça veio, para a equipe voltar à fonte."
          placeholder="https://"
          value={origemUrl}
          onChange={(e) => setOrigemUrl(e.target.value)}
          erro={erro?.campos?.origemUrl}
          disabled={salvando}
        />

        <CampoPreco
          id="produto-preco"
          valor={preco}
          onMudar={setPreco}
          erro={erro?.campos?.precoCentavos}
          disabled={salvando}
        />

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
          <CampoSelecao
            id="produto-status"
            rotulo="Status"
            valor={status}
            onMudar={setStatus}
            opcoes={Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => ({ valor, rotulo }))}
            erro={erro?.campos?.status}
          />
        </div>

        <CampoNovidades
          id="produto-em-novidades"
          rotulo="Colocar em novidades?"
          marcado={emNovidades}
          onMudar={setEmNovidades}
          disabled={salvando}
        />

        {opcoesCarregando && <p role="status">Carregando categorias…</p>}
        {erroOpcoes && <EstadoErro erro={erroOpcoes} onTentar={recarregarOpcoes} />}
        {!opcoesCarregando && !erroOpcoes && <DestinosProduto
          id="produto-destinos" categorias={categorias.dados || []}
          valor={destinos} onMudar={setDestinosEditados} disabled={salvando} obrigatorio
          somentePrincipal={modo === 'criar'}
          erro={erro?.campos?.categoriasIds || erro?.campos?.categoriaId}
          erroPublicos={erro?.campos?.publicos}
        />}

        {erro && !erro.campos && <ErroGeral>{erro.mensagem}</ErroGeral>}
        {erro?.campos && Object.keys(erro.campos).some((c) => !['nome', 'descricao', 'codigo', 'status', 'marcaId', 'categoriaId', 'categoriasIds', 'publicos', 'emNovidades', 'origemUrl', 'precoCentavos'].includes(c)) && (
          <ErroGeral>{erroGeralDe(erro)}</ErroGeral>
        )}

        <div className="admin-produto__acoes">
          <Button
            variante="primaria"
            type="submit"
            disabled={salvando || faltaAlgoObrigatorio}
          >
            {salvando ? 'Salvando…' : modo === 'criar' ? 'Criar produto' : 'Salvar dados'}
          </Button>
          <p className="t-body-sm t-muted" role="status">
            {aviso}
          </p>
        </div>
      </form>
      {children}
    </section>
  );
}

/** Seletor com rótulo, erro embaixo (mesmo padrão de `Field`) e "Carregando…" enquanto as opções não chegam. */
function CampoSelecao({ id, rotulo, valor, onMudar, opcoes, erro, vazio, disabled = false, required = false }) {
  const pronto = Array.isArray(opcoes);
  return (
    <div className={`campo${erro ? ' campo--erro' : ''}`}>
      <label htmlFor={id} className="t-label-caps">
        {rotulo}
        {required && <MarcaObrigatorio />}
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

  /** Acrescenta pela URL (digitada ou vinda do upload) — mesma chamada, um lugar só. */
  async function anexar(urlFinal, altFinal) {
    const novas = await produtosAdminService.adicionarImagens(produtoId, [
      { url: urlFinal, ...(altFinal ? { alt: altFinal } : {}) },
    ]);
    onMudou(novas);
    setUrl('');
    setAlt('');
  }

  async function adicionar(evento) {
    evento.preventDefault();
    if (!url.trim() || cheia) return;
    setEnviando(true);
    setErro(null);
    try {
      await anexar(url.trim(), alt.trim());
    } catch (falha) {
      setErro(falha);
    } finally {
      setEnviando(false);
    }
  }

  async function enviarArquivo(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ''; // deixa escolher o mesmo arquivo de novo, se precisar
    if (!arquivo || cheia) return;
    setEnviando(true);
    setErro(null);
    try {
      const enviada = await produtosAdminService.uploadImagem(produtoId, arquivo, alt.trim() || undefined);
      await anexar(enviada.url, enviada.alt || '');
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
                {i > 0 && (
                  <button
                    type="button"
                    className="link-caps"
                    disabled={Boolean(ocupada)}
                    onClick={() => mover(i, -1)}
                  >
                    Mover para cima
                  </button>
                )}
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
          obrigatorio
          ajuda={AVISO_PROPORCAO_PRODUTO}
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
        <label className="link-caps admin-produto__upload">
          ou envie um arquivo
          <input type="file" accept="image/*" capture hidden disabled={enviando || cheia} onChange={enviarArquivo} />
        </label>
      </form>
      {cheia && (
        <p className="t-body-sm t-muted">Este produto já tem o máximo de 10 imagens.</p>
      )}
    </div>
  );
}

/** A vitrine (`FotoProduto`/`.vitrine-foto`, components/Produto.css) é 4:5 com object-fit:
 * contain — a foto entra inteira, sem cortar, em qualquer tela do site. */
const AVISO_PROPORCAO_PRODUTO = 'Só https. Proporção recomendada: 4:5 (retrato) — a foto entra inteira no quadro, sem cortar.';

/**
 * Fotos escolhidas antes do produto existir: como não há id ainda, ficam em memória
 * (`imagens`/`onMudar`, estado do pai) e só viram `POST /imagens` depois que `AdminProdutoNovo`
 * cria o produto. Mesma UI de `ImagensProduto`, sem chamada de API por item — reordenar e excluir
 * mexem só na lista local.
 */
function ImagensPendentes({ imagens, onMudar }) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const cheia = imagens.length >= 10;

  function adicionar(evento) {
    evento.preventDefault();
    if (!url.trim() || cheia) return;
    onMudar([...imagens, { chave: `nova-${Math.random()}`, url: url.trim(), alt: alt.trim() }]);
    setUrl('');
    setAlt('');
  }

  function escolherArquivo(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ''; // deixa escolher o mesmo arquivo de novo, se precisar
    if (!arquivo || cheia) return;
    // Sem produtoId ainda para chamar o upload de verdade (POST /imagens/upload exige um) —
    // guarda o arquivo e mostra uma prévia local; o upload acontece em AdminProdutoNovo.criar,
    // assim que o produto existe.
    onMudar([
      ...imagens,
      { chave: `nova-${Math.random()}`, url: URL.createObjectURL(arquivo), alt: alt.trim(), arquivo },
    ]);
    setAlt('');
  }

  const remover = (chave) => onMudar(imagens.filter((i) => i.chave !== chave));

  function mover(indice, direcao) {
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= imagens.length) return;
    const proximas = [...imagens];
    [proximas[indice], proximas[alvo]] = [proximas[alvo], proximas[indice]];
    onMudar(proximas);
  }

  return (
    <div className="admin-produto__bloco">
      <h2 className="t-headline-md">Imagens</h2>
      <p className="t-body-sm t-muted admin-produtos__ajuda">
        A primeira é a <strong>capa</strong>. Ficam pendentes até "Criar produto" — depois disso,
        mais imagens entram pela tela do produto.
      </p>

      {imagens.length === 0 ? (
        <p className="t-body-sm t-muted">Nenhuma imagem ainda.</p>
      ) : (
        <ul className="admin-produto__imagens">
          {imagens.map((imagem, i) => (
            <li key={imagem.chave} className="admin-produto__imagem">
              <FotoProduto url={imagem.url} alt={imagem.alt || ''} className="admin-produto__imagem-foto" />
              <div className="admin-produto__imagem-info">
                <p className="t-label-caps-sm">{i === 0 ? 'Capa' : `Ordem ${i + 1}`}</p>
                <p className="t-body-sm t-muted admin-produto__imagem-url">
                  {imagem.arquivo ? imagem.arquivo.name : imagem.url}
                </p>
              </div>
              <div className="admin-produto__imagem-acoes">
                {i > 0 && (
                  <button type="button" className="link-caps" onClick={() => mover(i, -1)}>
                    Mover para cima
                  </button>
                )}
                <button
                  type="button"
                  className="link-caps"
                  disabled={i === imagens.length - 1}
                  onClick={() => mover(i, 1)}
                >
                  Mover para baixo
                </button>
                <button
                  type="button"
                  className="admin-produto__remover"
                  onClick={() => remover(imagem.chave)}
                  aria-label="Tirar esta imagem"
                >
                  <IconeFechar />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="admin-produto__nova-imagem" onSubmit={adicionar}>
        <Field
          id="imagem-pendente-url"
          rotulo="URL da imagem"
          obrigatorio
          ajuda={AVISO_PROPORCAO_PRODUTO}
          className="admin-produto__nova-imagem-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={cheia}
          placeholder="https://…"
        />
        <Field
          id="imagem-pendente-alt"
          rotulo="Texto alternativo"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          disabled={cheia}
        />
        <Button variante="secundaria" type="submit" disabled={cheia || !url.trim()}>
          Adicionar
        </Button>
        <label className="link-caps admin-produto__upload">
          ou envie um arquivo
          <input type="file" accept="image/*" capture hidden disabled={cheia} onChange={escolherArquivo} />
        </label>
      </form>
      {cheia && <p className="t-body-sm t-muted">Máximo de 10 imagens.</p>}
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
      <header className="admin-produto__grade-topo admin-produto__grade-largo">
        <h3 className="t-headline-md">Grade de variações</h3>
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
        <div className="admin-produto__grade-largo">
          <ErroGeral>{erro.campos?.variacoes || erro.campos?.corId || erro.mensagem}</ErroGeral>
        </div>
      )}

      <div className="admin-produto__acoes admin-produto__grade-largo">
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
