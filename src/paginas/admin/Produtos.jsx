/*
 * Produtos do painel (/admin/produtos). Nesta rodada: a listagem e a entrada para a grade de
 * variações de cada produto (Produto.jsx).
 *
 * O que o backend impõe (docs/para-o-frontend.md, "Painel administrativo — produtos"):
 * - A listagem traz os OCULTOS junto — é daqui que o admin reexibe o que escondeu.
 * - A paginação é por PÁGINA, não por cursor: `pagina` + `porPagina` (máx. 100).
 * - Os filtros são por id. Eles vivem na URL (?busca=&marcaId=&colecaoId=&categoriaId=&status=
 *   &pagina=), para recarregar, voltar do produto ou mandar o link sem perder a busca.
 */
import { useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import { FotoProduto } from '../../components/Produto.jsx';
import ImagemAmpliavel from '../../components/ImagemAmpliavel.jsx';
import Button from '../../components/ui/Button.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { catalogoService } from '../../services/catalogoService.js';
import { categoriasService } from '../../services/categoriasService.js';
import { marcasService } from '../../services/marcasService.js';
import { produtosAdminService } from '../../services/produtosAdminService.js';
import { linkDaOrigem } from '../../lib/linkOrigem.js';
import { formatarReais } from '../../lib/preco.js';
import { BotaoDuplicar, BotaoExcluir } from './Produto.jsx';
import { ROTULO_STATUS } from './rotulosProduto.js';
import './Produtos.css';
const POR_PAGINA = 50;
/** Mesma janela do backend (DIAS_NOVIDADE): só quem ainda está nos 14 dias tem o que remover. */
const DIAS_NOVIDADE = 14;
const nasNovidades = (produto) =>
  produto.emNovidades && Date.now() - new Date(produto.criadoEm).getTime() < DIAS_NOVIDADE * 86400000;

const FILTROS = ['busca', 'marcaId', 'colecaoId', 'categoriaId', 'status'];
export default function AdminProdutos() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  // Aviso de exclusão: vem da tela do produto (estado da rota) ou de um "Excluir" da própria lista.
  const [aviso, setAviso] = useState(location.state?.aviso || '');
  const filtros = useMemo(() => {
    const lidos = Object.fromEntries(FILTROS.map((nome) => [nome, params.get(nome) || '']));
    return { ...lidos, pagina: Math.max(1, Number(params.get('pagina')) || 1) };
  }, [params]);
  const temFiltro = FILTROS.some((nome) => filtros[nome]);
  const chave = JSON.stringify(filtros);
  const lista = useRequisicao(
    (sinal) => produtosAdminService.listar({ ...filtros, porPagina: POR_PAGINA }, sinal),
    [chave],
  );
  const marcas = useRequisicao((sinal) => marcasService.listar(sinal), []);
  const colecoes = useRequisicao((sinal) => catalogoService.colecoes(sinal), []);
  const categorias = useRequisicao((sinal) => categoriasService.listar(sinal), []);

  /** Qualquer filtro novo volta para a página 1. */
  function mudarFiltro(mudancas) {
    const proximo = new URLSearchParams(params);
    for (const [nome, valor] of Object.entries(mudancas)) {
      if (valor) proximo.set(nome, valor);
      else proximo.delete(nome);
    }
    if (!('pagina' in mudancas)) proximo.delete('pagina');
    setParams(proximo, { replace: !('pagina' in mudancas) });
  }

  async function removerDasNovidades(produto) {
    setAviso('');
    try {
      await produtosAdminService.editar(produto.id, { emNovidades: false });
      setAviso(`${produto.codigo} saiu das novidades.`);
      lista.recarregar();
    } catch (falha) {
      setAviso(falha.mensagem);
    }
  }

  async function realocarNasNovidades(produto) {
    setAviso('');
    try {
      await produtosAdminService.editar(produto.id, { emNovidades: true });
      setAviso(`${produto.codigo} voltou para as novidades.`);
      lista.recarregar();
    } catch (falha) {
      setAviso(falha.mensagem);
    }
  }

  const limpar = () => setParams(new URLSearchParams(), { replace: true });
  const total = lista.dados?.paginacao.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  return (
    <section className="admin__pagina">
      <header className="admin-produtos__topo admin-produtos__topo-linha">
        <div>
          <h1 className="t-headline-lg">Produtos</h1>
          <p className="t-body-sm t-muted admin-produtos__ajuda">
            O catálogo inteiro, inclusive o que está oculto da loja.
          </p>
        </div>
        <Button variante="primaria" para="/admin/produtos/novo">
          Novo produto
        </Button>
      </header>
      {aviso && (
        <p className="t-body-sm admin-produto__aviso" role="status">
          {aviso}
        </p>
      )}
      <div className="admin-produtos__filtros" role="search">
        <FormBusca
          key={filtros.busca}
          inicial={filtros.busca}
          onBuscar={(busca) => mudarFiltro({ busca })}
        />
        <Selecao
          id="filtro-marca"
          rotulo="Marca"
          valor={filtros.marcaId}
          onMudar={(marcaId) => mudarFiltro({ marcaId })}
          opcoes={marcas.dados?.map((m) => ({ valor: m.id, rotulo: m.ativa ? m.nome : `${m.nome} (inativa)` }))}
          falhou={Boolean(marcas.erro)}
        />
        <Selecao
          id="filtro-colecao"
          rotulo="Público"
          valor={filtros.colecaoId}
          onMudar={(colecaoId) => mudarFiltro({ colecaoId })}
          opcoes={colecoes.dados?.map((c) => ({ valor: c.id, rotulo: c.nome }))}
          falhou={Boolean(colecoes.erro)}
        />
        <Selecao
          id="filtro-categoria"
          rotulo="Categoria"
          valor={filtros.categoriaId}
          onMudar={(categoriaId) => mudarFiltro({ categoriaId })}
          opcoes={categorias.dados?.map((c) => ({ valor: c.id, rotulo: c.nome }))}
          falhou={Boolean(categorias.erro)}
        />
        <Selecao
          id="filtro-status"
          rotulo="Status"
          valor={filtros.status}
          onMudar={(status) => mudarFiltro({ status })}
          opcoes={Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => ({ valor, rotulo }))}
        />
      </div>
      <p className="t-body-sm t-muted admin-produtos__contagem" aria-live="polite">
        {lista.carregando || lista.erro
          ? ' '
          : `${total} ${total === 1 ? 'produto' : 'produtos'}${temFiltro ? ' com estes filtros' : ''}`}
        {temFiltro && (
          <button type="button" className="link-caps admin-produtos__limpar" onClick={limpar}>
            Limpar filtros
          </button>
        )}
      </p>
      {lista.carregando ? (
        <div className="estado-carregando" aria-busy="true" aria-label="Carregando produtos">
          {Array.from({ length: 6 }, (_, i) => (
            <Esqueleto key={i} className="esqueleto--linha admin-produtos__esqueleto" />
          ))}
        </div>
      ) : lista.erro ? (
        <EstadoErro erro={lista.erro} onTentar={lista.recarregar} titulo="Não conseguimos carregar os produtos." />
      ) : lista.dados.dados.length === 0 ? (
        temFiltro ? (
          <EstadoVazio
            titulo="Nenhum produto com estes filtros."
            texto="Tire algum filtro ou busque por outro nome ou código."
            acao={{ rotulo: 'Limpar filtros', onClick: limpar }}
          />
        ) : filtros.pagina > 1 ? (
          <EstadoVazio
            titulo="Esta página não existe mais."
            texto="A lista ficou mais curta desde que o link foi aberto."
            acao={{ rotulo: 'Ir para a primeira página', onClick: () => mudarFiltro({ pagina: '' }) }}
          />
        ) : (
          <EstadoVazio
            titulo="Nenhum produto cadastrado ainda."
            texto="Os produtos importados da planilha aparecem aqui, inclusive os ocultos."
          />
        )
      ) : (
        <>
          <table className="admin-tabela admin-produtos__tabela">
            <thead>
              <tr>
                <th scope="col"><span className="visualmente-oculto">Foto</span></th>
                <th scope="col" className="t-label-caps-sm">Código</th>
                <th scope="col" className="t-label-caps-sm">Produto</th>
                <th scope="col" className="t-label-caps-sm">Categoria</th>
                <th scope="col" className="t-label-caps-sm">Status</th>
                <th scope="col"><span className="visualmente-oculto">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.dados.dados.map((produto) => (
                <tr key={produto.id}>
                  <td className="admin-produtos__foto">
                    <ImagemAmpliavel url={produto.capa?.url} alt={produto.nome}>
                      <FotoProduto url={produto.capa?.url} alt="" />
                    </ImagemAmpliavel>
                  </td>
                  <td className="t-codigo">
                    <Link
                      to={String(produto.id)}
                      state={{ voltarPara: location.search }}
                      className="admin-produtos__link"
                    >
                      {produto.codigo}
                    </Link>
                  </td>
                  <td>
                    <p className="t-body-sm">{produto.nome}</p>
                    <p className="t-label-caps-sm t-muted">{produto.marca.nome}</p>
                    {produto.precoCentavos != null && (
                      <p className="t-body-sm t-muted">Preço interno: {formatarReais(produto.precoCentavos)}</p>
                    )}
                  </td>
                  <td className="t-body-sm">
                    {produto.categoria.nome}
                    <span className="t-muted"> · {produto.colecao.nome}</span>
                  </td>
                  <td className="t-body-sm">
                    <span className={produto.status === 'normal' ? undefined : 't-muted'}>
                      {ROTULO_STATUS[produto.status]}
                    </span>
                    {produto.destaque && <span className="t-muted"> · destaque</span>}
                    {nasNovidades(produto) && <span className="t-muted"> · em novidades</span>}
                    {!produto.emNovidades && <span className="t-muted"> · fora das novidades</span>}
                  </td>
                  <td className="admin-produtos__acoes">
                    <Link
                      to={String(produto.id)}
                      state={{ voltarPara: location.search }}
                      className="link-caps"
                    >
                      Editar
                    </Link>
                    {nasNovidades(produto) && (
                      <button type="button" className="link-caps" onClick={() => removerDasNovidades(produto)}>
                        Remover das novidades
                      </button>
                    )}
                    {!produto.emNovidades && (
                      <button type="button" className="link-caps" onClick={() => realocarNasNovidades(produto)}>
                        Realocar nas novidades
                      </button>
                    )}
                    {produto.origemUrl && (
                      <a className="link-caps" href={linkDaOrigem(produto.origemUrl)} target="_blank" rel="noopener noreferrer">
                        Ver origem ↗
                      </a>
                    )}
                    <BotaoDuplicar
                      produtoId={produto.id}
                      render={(abrir) => (
                        <button type="button" className="link-caps" onClick={abrir}>
                          Duplicar
                        </button>
                      )}
                    />
                    <BotaoExcluir
                      produto={produto}
                      render={(abrir) => (
                        <button type="button" className="link-caps" onClick={abrir}>
                          Excluir
                        </button>
                      )}
                      onExcluido={(texto) => {
                        setAviso(texto);
                        lista.recarregar();
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginas > 1 && (
            <nav className="admin-produtos__paginacao" aria-label="Páginas">
              <Button
                variante="secundaria"
                disabled={filtros.pagina <= 1}
                onClick={() => mudarFiltro({ pagina: filtros.pagina - 1 > 1 ? String(filtros.pagina - 1) : '' })}
              >
                Anterior
              </Button>
              <span className="t-body-sm">
                Página {filtros.pagina} de {paginas}
              </span>
              <Button
                variante="secundaria"
                disabled={filtros.pagina >= paginas}
                onClick={() => mudarFiltro({ pagina: String(filtros.pagina + 1) })}
              >
                Próxima
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
/** A busca vai para a URL ao enviar, não a cada tecla: cada letra seria uma consulta. */
function FormBusca({ inicial, onBuscar }) {
  const [texto, setTexto] = useState(inicial);
  return (
    <form
      className="campo admin-produtos__busca"
      onSubmit={(evento) => {
        evento.preventDefault();
        onBuscar(texto.trim());
      }}
    >
      <label htmlFor="filtro-busca" className="t-label-caps">
        Buscar
      </label>
      <div className="admin-produtos__busca-linha">
        <input
          id="filtro-busca"
          type="search"
          className="campo__input"
          placeholder="Nome ou código"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Button variante="secundaria" type="submit">
          Buscar
        </Button>
      </div>
    </form>
  );
}
/**
 * Seletor de filtro. Enquanto as opções carregam, fica desabilitado com "Carregando…"; se a
 * lista falhar, diz isso no próprio campo — a listagem continua funcionando sem esse filtro.
 */
function Selecao({ id, rotulo, valor, onMudar, opcoes, falhou = false }) {
  const pronto = Array.isArray(opcoes);
  return (
    <div className="campo">
      <label htmlFor={id} className="t-label-caps">
        {rotulo}
      </label>
      <select
        id={id}
        className="campo__input"
        value={valor}
        disabled={!pronto}
        onChange={(e) => onMudar(e.target.value)}
      >
        <option value="">{falhou ? 'Não carregou' : pronto ? 'Todos' : 'Carregando…'}</option>
        {pronto &&
          opcoes.map((opcao) => (
            <option key={opcao.valor} value={String(opcao.valor)}>
              {opcao.rotulo}
            </option>
          ))}
      </select>
    </div>
  );
}