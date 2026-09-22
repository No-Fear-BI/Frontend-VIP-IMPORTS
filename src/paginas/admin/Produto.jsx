/*
 * Um produto no painel (/admin/produtos/:id). Nesta rodada, só a grade de variações.
 *
 * A regra que corrompe dado se for ignorada (docs/para-o-frontend.md, "imagens e variações"):
 * PATCH /admin/produtos/:id/variacoes SUBSTITUI O CONJUNTO INTEIRO. O que não vier na lista
 * sai, sem erro — e junto sai a escolha de quem tinha aquela variação no carrinho. Por isso a
 * tela nunca manda "a variação nova": ela carrega a grade atual, edita uma cópia local e, ao
 * salvar, manda a grade completa, na ordem da tela.
 *
 * E a da revisão 0007 (cores): toda cor volta com o `corId` que veio da leitura. Pelo texto
 * não serve — renomear "Preto" para "Preto Ônix" mantém o slug `preto`, e o texto novo
 * (`preto-onix`) não casaria com nada: a paleta ganharia uma cor duplicada, sem erro.
 * Cor nova só entra escolhida da paleta (GET /admin/cores), nunca digitada.
 */

import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Esqueleto, EstadoErro } from '../../components/Estados.jsx';
import { IconeFechar } from '../../components/Icones.jsx';
import Button from '../../components/ui/Button.jsx';
import { ErroGeral } from '../../components/ui/Field.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { coresService } from '../../services/coresService.js';
import { produtosAdminService } from '../../services/produtosAdminService.js';
import { ROTULO_STATUS } from './Produtos.jsx';
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
        <>
          <header className="admin-produto__topo">
            <p className="t-codigo t-muted">{produto.dados.codigo}</p>
            <h1 className="t-headline-lg">{produto.dados.nome}</h1>
            <p className="t-label-caps-sm t-muted">
              {produto.dados.marca.nome} · {produto.dados.categoria.nome} · {produto.dados.colecao.nome} ·{' '}
              {ROTULO_STATUS[produto.dados.status]}
            </p>
          </header>
          {/* `key`: ao trocar de produto, a cópia local da grade recomeça do que veio do banco. */}
          <GradeVariacoes key={produto.dados.id} produtoId={produto.dados.id} inicial={produto.dados.variacoes} />
        </>
      )}
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
