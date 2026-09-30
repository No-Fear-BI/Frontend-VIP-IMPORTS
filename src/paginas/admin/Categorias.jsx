/*
 * Categorias do painel (/admin/categorias). CRUD simples, mesmo padrão de Cores.jsx/Marcas.jsx.
 *
 * O que o backend impõe (docs/para-o-frontend.md, "Painel administrativo — marcas, categorias e
 * banners" e "Feminino e Masculino viram o público do produto"):
 * 1. Desde a migração 0015 a categoria NÃO pertence a coleção. Feminino e Masculino são o
 *    PÚBLICO do produto (`publicos`, os dois = unissex), escolhido no produto; "Bolsas" existe
 *    uma vez só e vale para os dois públicos. O slug é único na tabela toda.
 * 2. O slug nasce do nome na criação e NÃO muda sozinho depois — mesma regra de marca/cor.
 * 3. Categoria com produto não é excluída: 409 `CATEGORIA_COM_PRODUTOS` com a contagem.
 * 4. `ativa` esconde a categoria da vitrine (menu, filtros, destaques da home, link direto) sem
 *    apagar o cadastro nem mexer nos produtos: eles seguem em /todos, busca, marca e nas outras
 *    categorias. O formulário avisa isso antes de salvar.
 * 5. Um tema ("Coleção de verão") é uma categoria como as outras.
 * 6. "Card Esquerda" / "Card Direita" (0016): a categoria ocupa um dos dois cards de coleção da home
 *    (esquerda = no lugar do Feminina, direita = no lugar do Masculina), com a imagem que o dono
 *    enviar. Cada lado tem UMA categoria: quem marcar toma o lugar de quem estava.
 */

import { useState } from 'react';
import { EstadoErro, EstadoVazio, Esqueleto } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral, LegendaObrigatorio } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { cn } from '../../lib/cn.js';
import { EnvioArquivo, PreviaImagem } from './Banners.jsx';
import { categoriasService } from '../../services/categoriasService.js';
import './Categorias.css';

export default function AdminCategorias() {
  const { dados: categorias, erro, carregando, recarregar } = useRequisicao(
    (sinal) => categoriasService.listar(sinal),
    [],
  );
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);

  return (
    <section className="admin__pagina">
      <header className="admin-categorias__topo">
        <div>
          <h1 className="t-headline-lg">Categorias</h1>
          <p className="t-body-sm t-muted admin-categorias__ajuda">
            Tipos de peça e temas ("Bolsas", "Coleção de verão"). Feminino e Masculino são o público de
            cada produto, escolhido no cadastro da peça.
          </p>
        </div>
        <Button variante="primaria" onClick={() => setCriando(true)}>
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
      ) : categorias.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma categoria cadastrada ainda."
          texto="Cadastre as categorias da loja: todo produto precisa de uma."
          acao={{ rotulo: 'Nova categoria', onClick: () => setCriando(true) }}
        />
      ) : (
        <table className="admin-tabela admin-categorias__tabela">
          <thead>
            <tr>
              <th scope="col" className="t-label-caps-sm admin-categorias__col-nome">Categoria</th>
              <th scope="col" className="t-label-caps-sm admin-categorias__col-slug">Endereço na loja</th>
              <th scope="col" className="t-label-caps-sm admin-categorias__col-pecas">Peças</th>
              <th scope="col" className="t-label-caps-sm admin-categorias__col-situacao">Na loja</th>
              <th scope="col"><span className="visualmente-oculto">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr
                key={categoria.id}
                className={cn(!categoria.ativa && 'admin-categorias__linha--escondida')}
              >
                <td className="t-body-sm">
                  {categoria.nome}
                  {categoria.cardHome && (
                    <span className="t-label-caps-sm t-muted"> · Card {categoria.cardHome}</span>
                  )}
                </td>
                <td className="t-codigo admin-categorias__slug">?categoria={categoria.slug}</td>
                <td className="t-body-sm">
                  {categoria.totalProdutos > 0 ? (
                    `${categoria.totalProdutos} ${categoria.totalProdutos === 1 ? 'peça' : 'peças'}`
                  ) : (
                    <span className="t-muted">nenhuma</span>
                  )}
                </td>
                <td className="t-body-sm">
                  {categoria.ativa ? 'Aparece' : <span className="t-muted">Escondida</span>}
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

      <Modal aberto={criando} onFechar={() => setCriando(false)} titulo="Nova categoria">
        <FormCategoria
          categorias={categorias || []}
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
            categorias={categorias || []}
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

const LADOS = [
  { valor: 'esquerda', rotulo: 'Card Esquerda', quem: 'Feminina' },
  { valor: 'direita', rotulo: 'Card Direita', quem: 'Masculina' },
];

function FormCategoria({ categoria, categorias, onPronto }) {
  const edicao = Boolean(categoria);
  const [nome, setNome] = useState(categoria?.nome || '');
  const [slug, setSlug] = useState(categoria?.slug || '');
  const [ativa, setAtiva] = useState(categoria ? categoria.ativa : true);
  const [card, setCard] = useState(categoria?.cardHome || '');
  const [cardImagem, setCardImagem] = useState(categoria?.cardHomeImagemUrl || '');
  const [erroNome, setErroNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const slugMudou = edicao && slug.trim() !== categoria.slug;
  const escondendo = edicao && categoria.ativa && !ativa;
  const avisoEsconder = escondendo && (categoria.totalProdutos > 0 || categoria.destaque);
  // Quem ocupa hoje o lado escolhido (se não for esta categoria): ela sai do card ao salvar.
  const ocupante = card ? categorias.find((c) => c.cardHome === card && c.id !== categoria?.id) : null;

  function alternarCard(lado, marcado) {
    setCard(marcado ? lado : '');
    if (!marcado) setCardImagem('');
  }

  async function salvar(evento) {
    evento.preventDefault();
    // O nome é obrigatório: sem ele a categoria não é criada (nem editada).
    if (!nome.trim()) {
      setErroNome('Informe o nome da categoria.');
      return;
    }
    setErroNome('');
    setSalvando(true);
    setErro(null);
    try {
      if (edicao) {
        const dados = {};
        if (nome.trim() !== categoria.nome) dados.nome = nome.trim();
        if (slugMudou) dados.slug = slug.trim();
        if (ativa !== categoria.ativa) dados.ativa = ativa;
        if (card !== (categoria.cardHome || '')) dados.cardHome = card || null;
        if (card && cardImagem.trim() !== (categoria.cardHomeImagemUrl || '')) {
          dados.cardHomeImagemUrl = cardImagem.trim() || null;
        }
        await categoriasService.editar(categoria.id, dados);
      } else {
        await categoriasService.criar({
          nome: nome.trim(),
          ativa,
          ...(slug.trim() ? { slug: slug.trim() } : {}),
          ...(card ? { cardHome: card } : {}),
          ...(card && cardImagem.trim() ? { cardHomeImagemUrl: cardImagem.trim() } : {}),
        });
      }
      onPronto();
    } catch (falha) {
      setErro(falha);
      setSalvando(false);
    }
  }

  return (
    <form className="admin-categorias__form" onSubmit={salvar} noValidate>
      <LegendaObrigatorio />
      <Field
        id="categoria-nome"
        rotulo="Nome"
        obrigatorio
        value={nome}
        onChange={(e) => {
          setNome(e.target.value);
          if (erroNome) setErroNome('');
        }}
        erro={erroNome || erro?.campos?.nome}
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
      <label className="admin-categorias__checkbox">
        <input type="checkbox" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} />
        <span className="t-body-sm">Mostrar na loja</span>
      </label>
      {avisoEsconder && (
        <p className="t-body-sm admin-categorias__aviso" role="status">
          Escondida, a categoria sai do menu, dos filtros e dos destaques da home.
          {categoria.totalProdutos > 0 &&
            ` ${categoria.totalProdutos === 1 ? 'A peça continua' : `As ${categoria.totalProdutos} peças continuam`} no catálogo.`}
        </p>
      )}
      {erro?.campos?.ativa && <ErroGeral>{erro.campos.ativa}</ErroGeral>}

      <fieldset className="admin-categorias__card">
        <legend className="t-label-caps">Card na página inicial</legend>
        <p className="t-body-sm t-muted">
          Esquerda ocupa o lugar do card Feminina e Direita, o do card Masculina. Só uma categoria por lado.
        </p>
        {LADOS.map((lado) => (
          <label key={lado.valor} className="admin-categorias__checkbox">
            <input
              type="checkbox"
              checked={card === lado.valor}
              onChange={(e) => alternarCard(lado.valor, e.target.checked)}
            />
            <span className="t-body-sm">{lado.rotulo}</span>
          </label>
        ))}
        {ocupante && (
          <p className="t-body-sm admin-categorias__aviso" role="status">
            Hoje este card é da categoria {ocupante.nome}. Ao salvar, ela sai dele.
          </p>
        )}
        {card && (
          <>
            <Field
              id="categoria-card-imagem"
              rotulo="Imagem do card"
              ajuda="Endereço da imagem (https://…) ou envie um arquivo. Sem imagem, vale a imagem da categoria."
              value={cardImagem}
              onChange={(e) => setCardImagem(e.target.value)}
              erro={erro?.campos?.cardHomeImagemUrl}
            />
            <EnvioArquivo id="categoria-card-arquivo" alt={nome} onEnviado={setCardImagem} />
            <PreviaImagem url={cardImagem} alt={nome} className="admin-categorias__previa" />
            <p className="t-body-sm t-muted">
              Proporção recomendada: quadrada (1:1), por exemplo 1200 × 1200 px. No celular o card fica
              mais largo que alto, então deixe o assunto da foto no centro.
            </p>
          </>
        )}
      </fieldset>
      {erro && !erro.campos && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button variante="primaria" largo type="submit" disabled={salvando || !nome.trim()}>
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
          categoria {categoria.nome}. Mova ou exclua essas peças antes de excluir a categoria — ou
          esconda a categoria da loja, que não mexe em peça nenhuma.
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
