/*
 * Categorias do painel (/admin/categorias). CRUD por coleção, mesmo padrão de Cores.jsx/Marcas.jsx.
 *
 * O que o backend impõe (docs/para-o-frontend.md, "Painel administrativo — marcas, categorias e
 * banners"):
 * 1. O slug é único POR COLEÇÃO, não global — "bolsas" existe em Feminino e em Masculino como
 *    categorias diferentes. Por isso a tela separa a listagem por coleção em vez de uma tabela
 *    só, e o slug só precisa ser único dentro da coleção escolhida.
 * 2. O slug nasce do nome na criação e NÃO muda sozinho depois — mesma regra de marca/cor.
 * 3. Categoria com produto não é excluída: 409 `CATEGORIA_COM_PRODUTOS` com a contagem.
 * 4. A coleção é escolha de quando a categoria NASCE. Trocar a coleção de uma categoria com
 *    produtos também dá 409 (o caminho é criar a categoria na coleção certa e mover os produtos
 *    por `PATCH /admin/produtos/lote`) — esta tela não oferece esse caminho: editar não muda a
 *    coleção, só nome e endereço.
 */

import { useMemo, useState } from 'react';
import { EstadoErro, EstadoVazio, Esqueleto } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { catalogoService } from '../../services/catalogoService.js';
import { categoriasService } from '../../services/categoriasService.js';
import './Categorias.css';

export default function AdminCategorias() {
  const categorias = useRequisicao((sinal) => categoriasService.listar(undefined, sinal), []);
  const colecoes = useRequisicao((sinal) => catalogoService.colecoes(sinal), []);
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);

  const carregando = categorias.carregando || colecoes.carregando;
  const erro = categorias.erro || colecoes.erro;
  const recarregar = () => {
    categorias.recarregar();
    colecoes.recarregar();
  };

  const porColecao = useMemo(() => {
    if (!categorias.dados || !colecoes.dados) return [];
    return colecoes.dados.map((colecao) => ({
      colecao,
      itens: categorias.dados.filter((c) => c.colecaoId === colecao.id),
    }));
  }, [categorias.dados, colecoes.dados]);

  const semNenhuma = categorias.dados?.length === 0;

  return (
    <section className="admin__pagina">
      <header className="admin-categorias__topo">
        <div>
          <p className="t-label-caps-sm t-muted">/admin/categorias</p>
          <h1 className="t-headline-lg">Categorias</h1>
          <p className="t-body-sm t-muted admin-categorias__ajuda">
            Uma por coleção: "Bolsas" no Feminino e "Bolsas" no Masculino são categorias diferentes.
          </p>
        </div>
        <Button variante="primaria" onClick={() => setCriando(true)} disabled={!colecoes.dados?.length}>
          Nova categoria
        </Button>
      </header>

      {carregando ? (
        <div className="estado-carregando" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Esqueleto key={i} className="esqueleto--linha" />
          ))}
        </div>
      ) : erro ? (
        <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos carregar as categorias." />
      ) : semNenhuma ? (
        <EstadoVazio
          titulo="Nenhuma categoria cadastrada ainda."
          texto="Cadastre as categorias das duas coleções: todo produto precisa de uma."
          acao={{ rotulo: 'Nova categoria', onClick: () => setCriando(true) }}
        />
      ) : (
        <div className="admin-categorias__colecoes">
          {porColecao.map(({ colecao, itens }) => (
            <section key={colecao.id} className="admin-categorias__bloco">
              <h2 className="t-headline-md">{colecao.nome}</h2>
              {itens.length === 0 ? (
                <p className="t-body-sm t-muted">Nenhuma categoria nesta coleção ainda.</p>
              ) : (
                <table className="admin-tabela admin-categorias__tabela">
                  <thead>
                    <tr>
                      <th scope="col" className="t-label-caps-sm admin-categorias__col-nome">Categoria</th>
                      <th scope="col" className="t-label-caps-sm admin-categorias__col-slug">Endereço na loja</th>
                      <th scope="col" className="t-label-caps-sm admin-categorias__col-pecas">Peças</th>
                      <th scope="col"><span className="visualmente-oculto">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((categoria) => (
                      <tr key={categoria.id}>
                        <td className="t-body-sm">{categoria.nome}</td>
                        <td className="t-codigo admin-categorias__slug">
                          ?colecao={colecao.slug}&amp;categoria={categoria.slug}
                        </td>
                        <td className="t-body-sm">
                          {categoria.totalProdutos > 0 ? (
                            `${categoria.totalProdutos} ${categoria.totalProdutos === 1 ? 'peça' : 'peças'}`
                          ) : (
                            <span className="t-muted">nenhuma</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-tabela__acoes">
                            <button type="button" className="link-caps" onClick={() => setEditando(categoria)}>
                              Editar
                            </button>
                            <button type="button" className="link-caps" onClick={() => setExcluindo(categoria)}>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          ))}
        </div>
      )}

      <Modal aberto={criando} onFechar={() => setCriando(false)} titulo="Nova categoria">
        <FormCategoria
          colecoes={colecoes.dados || []}
          onPronto={() => {
            setCriando(false);
            recarregar();
          }}
        />
      </Modal>

      <Modal aberto={Boolean(editando)} onFechar={() => setEditando(null)} titulo="Editar categoria">
        {editando && (
          <FormCategoria
            categoria={editando}
            colecoes={colecoes.dados || []}
            onPronto={() => {
              setEditando(null);
              recarregar();
            }}
          />
        )}
      </Modal>

      <Modal aberto={Boolean(excluindo)} onFechar={() => setExcluindo(null)} titulo="Excluir categoria">
        {excluindo && (
          <ConfirmarExclusao
            categoria={excluindo}
            onPronto={() => {
              setExcluindo(null);
              recarregar();
            }}
          />
        )}
      </Modal>
    </section>
  );
}

function FormCategoria({ categoria, colecoes, onPronto }) {
  const edicao = Boolean(categoria);
  const [nome, setNome] = useState(categoria?.nome || '');
  const [slug, setSlug] = useState(categoria?.slug || '');
  const [colecaoId, setColecaoId] = useState(categoria ? String(categoria.colecaoId) : '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const slugMudou = edicao && slug.trim() !== categoria.slug;
  const colecaoNome = (id) => colecoes.find((c) => c.id === Number(id))?.nome;

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      if (edicao) {
        // Coleção não muda aqui: é escolha de quando a categoria nasce (ver comentário do topo).
        const dados = {};
        if (nome.trim() !== categoria.nome) dados.nome = nome.trim();
        if (slugMudou) dados.slug = slug.trim();
        await categoriasService.editar(categoria.id, dados);
      } else {
        await categoriasService.criar({
          colecaoId: Number(colecaoId),
          nome: nome.trim(),
          ...(slug.trim() ? { slug: slug.trim() } : {}),
        });
      }
      onPronto();
    } catch (falha) {
      setErro(falha);
      setSalvando(false);
    }
  }

  return (
    <form className="admin-categorias__form" onSubmit={salvar}>
      {edicao ? (
        <p className="t-body-sm t-muted">Coleção: {colecaoNome(colecaoId)}</p>
      ) : (
        <div className="campo">
          <label htmlFor="categoria-colecao" className="t-label-caps">
            Coleção
          </label>
          <select
            id="categoria-colecao"
            className="campo__input"
            value={colecaoId}
            onChange={(e) => setColecaoId(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            {colecoes.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      )}
      <Field
        id="categoria-nome"
        rotulo="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        erro={erro?.campos?.nome}
        required
        maxLength={80}
      />
      <Field
        id="categoria-slug"
        rotulo="Endereço na loja"
        ajuda={edicao ? 'Aparece na URL pública da categoria.' : 'Deixe vazio para gerar a partir do nome.'}
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        erro={erro?.campos?.slug}
        maxLength={80}
      />
      {slugMudou && (
        <p className="t-body-sm admin-categorias__aviso" role="status">
          Trocar o endereço quebra links antigos para{' '}
          <span className="t-codigo">?categoria={categoria.slug}</span>.
        </p>
      )}
      {erro && !erro.campos && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button
        variante="primaria"
        largo
        type="submit"
        disabled={salvando || !nome.trim() || (!edicao && !colecaoId)}
      >
        {salvando ? 'Salvando…' : edicao ? 'Salvar' : 'Criar categoria'}
      </Button>
    </form>
  );
}

function ConfirmarExclusao({ categoria, onPronto }) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState(null);

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    try {
      await categoriasService.excluir(categoria.id);
      onPronto();
    } catch (falha) {
      setErro(falha);
      setExcluindo(false);
    }
  }

  return (
    <div className="admin-categorias__form">
      {categoria.totalProdutos > 0 ? (
        <p className="t-body-lg">
          {categoria.totalProdutos} {categoria.totalProdutos === 1 ? 'peça usa' : 'peças usam'} a
          categoria {categoria.nome}. Mova ou exclua essas peças antes de excluir a categoria.
        </p>
      ) : (
        <p className="t-body-lg">Excluir a categoria {categoria.nome}? Nenhuma peça usa esta categoria.</p>
      )}
      {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button
        variante="primaria"
        largo
        onClick={excluir}
        disabled={excluindo || categoria.totalProdutos > 0}
      >
        {excluindo ? 'Excluindo…' : 'Excluir'}
      </Button>
    </div>
  );
}
