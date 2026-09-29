/*
 * Paleta da loja (/admin/cores). Primeira tela de conteúdo do painel.
 *
 * Três coisas que o backend impõe e a tela precisa respeitar (docs/para-o-frontend.md, "Cores"):
 * 1. Renomear reescreve o texto em todas as variações que usam a cor. Quando algum produto já
 *    tem outra cor com o nome novo, vem 409 COR_EM_CONFLITO com `detalhes.codigoProduto` —
 *    mostramos o código, porque "não deu" não diz a ninguém o que fazer.
 * 2. Excluir cor em uso é 409 COR_EM_USO com `detalhes.totalProdutos`. Por isso a contagem
 *    aparece na linha ANTES do botão, e a confirmação já sabe o número.
 * 3. O slug é a URL do filtro público (`/feminino?cor=preta`) e NÃO muda ao renomear. Trocar
 *    exige mandar `slug`, e a tela avisa que link antigo para de funcionar.
 */

import { useState } from 'react';
import { EstadoErro, EstadoVazio, Esqueleto } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { coresService } from '../../services/coresService.js';
import './Cores.css';

export default function AdminCores() {
  const { dados: cores, erro, carregando, recarregar } = useRequisicao(
    (sinal) => coresService.listar(sinal),
    [],
  );
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [vendoProdutos, setVendoProdutos] = useState(null);

  return (
    <section className="admin__pagina">
      <header className="admin-cores__topo">
        <div>
          <h1 className="t-headline-lg">Cores</h1>
          <p className="t-body-sm t-muted admin-cores__ajuda">
            A paleta que o cliente vê como filtro na loja. Cada peça escolhe as cores desta lista.
          </p>
        </div>
        <Button variante="primaria" onClick={() => setCriando(true)}>
          Nova cor
        </Button>
      </header>

      {carregando ? (
        <div className="estado-carregando" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Esqueleto key={i} className="esqueleto--linha" />
          ))}
        </div>
      ) : erro ? (
        <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos carregar as cores." />
      ) : cores.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma cor cadastrada ainda."
          texto="Cadastre as cores que a loja usa: elas viram o filtro da vitrine."
          acao={{ rotulo: 'Nova cor', onClick: () => setCriando(true) }}
        />
      ) : (
        <table className="admin-tabela">
          <thead>
            <tr>
              <th scope="col" className="t-label-caps-sm">Cor</th>
              <th scope="col" className="t-label-caps-sm">Filtro na loja</th>
              <th scope="col" className="t-label-caps-sm">Peças</th>
              <th scope="col" className="t-label-caps-sm">Na loja</th>
              <th scope="col"><span className="visualmente-oculto">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {cores.map((cor) => (
              <tr key={cor.id}>
                <td className="t-body-sm">{cor.nome}</td>
                <td className="t-codigo admin-cores__slug">?cor={cor.slug}</td>
                <td className="t-body-sm">
                  {cor.totalProdutos > 0 ? (
                    <button
                      type="button"
                      className="link-caps"
                      onClick={() => setVendoProdutos(cor)}
                    >
                      {cor.totalProdutos} {cor.totalProdutos === 1 ? 'peça' : 'peças'}
                    </button>
                  ) : (
                    <span className="t-muted">nenhuma</span>
                  )}
                </td>
                <td className="t-body-sm">
                  {cor.ativa ? 'Aparece' : <span className="t-muted">Escondida</span>}
                </td>
                <td>
                  <div className="admin-tabela__acoes">
                    <button type="button" className="link-caps" onClick={() => setEditando(cor)}>
                      Editar
                    </button>
                    <button type="button" className="link-caps" onClick={() => setExcluindo(cor)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal aberto={criando} onFechar={() => setCriando(false)} titulo="Nova cor">
        <FormCor
          onPronto={() => {
            setCriando(false);
            recarregar();
          }}
        />
      </Modal>

      <Modal aberto={Boolean(editando)} onFechar={() => setEditando(null)} titulo="Editar cor">
        {editando && (
          <FormCor
            cor={editando}
            onPronto={() => {
              setEditando(null);
              recarregar();
            }}
          />
        )}
      </Modal>

      <Modal aberto={Boolean(excluindo)} onFechar={() => setExcluindo(null)} titulo="Excluir cor">
        {excluindo && (
          <ConfirmarExclusao
            cor={excluindo}
            onPronto={() => {
              setExcluindo(null);
              recarregar();
            }}
          />
        )}
      </Modal>

      <Modal
        aberto={Boolean(vendoProdutos)}
        onFechar={() => setVendoProdutos(null)}
        titulo={vendoProdutos ? `Peças na cor ${vendoProdutos.nome}` : ''}
        lateral
      >
        {vendoProdutos && <ProdutosDaCor cor={vendoProdutos} />}
      </Modal>
    </section>
  );
}

function FormCor({ cor, onPronto }) {
  const edicao = Boolean(cor);
  const [nome, setNome] = useState(cor?.nome || '');
  const [slug, setSlug] = useState(cor?.slug || '');
  const [ativa, setAtiva] = useState(cor ? cor.ativa : true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const slugMudou = edicao && slug.trim() !== cor.slug;

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      if (edicao) {
        // Só o que mudou: mandar `slug` igual ao atual seria pedir a troca da URL à toa.
        const dados = { ativa };
        if (nome.trim() !== cor.nome) dados.nome = nome.trim();
        if (slugMudou) dados.slug = slug.trim();
        await coresService.editar(cor.id, dados);
      } else {
        await coresService.criar({ nome: nome.trim(), ...(slug.trim() ? { slug: slug.trim() } : {}) });
      }
      onPronto();
    } catch (falha) {
      setErro(falha);
      setSalvando(false);
    }
  }

  return (
    <form className="admin-cores__form" onSubmit={salvar}>
      <Field
        id="cor-nome"
        rotulo="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        erro={erro?.campos?.nome}
        required
        maxLength={60}
      />
      <Field
        id="cor-slug"
        rotulo="Endereço do filtro"
        ajuda={edicao ? 'Aparece na URL da loja.' : 'Deixe vazio para gerar a partir do nome.'}
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        erro={erro?.campos?.slug}
        maxLength={60}
      />
      {slugMudou && (
        <p className="t-body-sm admin-cores__aviso" role="status">
          Trocar o endereço quebra links antigos para <span className="t-codigo">?cor={cor.slug}</span>.
        </p>
      )}
      {edicao && nome.trim() !== cor.nome && cor.totalProdutos > 0 && (
        <p className="t-body-sm admin-cores__aviso" role="status">
          O nome novo vale para as {cor.totalProdutos}{' '}
          {cor.totalProdutos === 1 ? 'peça' : 'peças'} que usam esta cor.
        </p>
      )}
      {edicao && (
        <label className="admin-cores__checkbox">
          <input type="checkbox" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} />
          <span className="t-body-sm">Mostrar no filtro da loja</span>
        </label>
      )}
      {erro && !erro.campos && (
        <ErroGeral>
          {erro.mensagem}
          {erro.detalhes?.codigoProduto && ` (produto ${erro.detalhes.codigoProduto})`}
        </ErroGeral>
      )}
      <Button variante="primaria" largo type="submit" disabled={salvando || !nome.trim()}>
        {salvando ? 'Salvando…' : edicao ? 'Salvar' : 'Criar cor'}
      </Button>
    </form>
  );
}

function ConfirmarExclusao({ cor, onPronto }) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState(null);

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    try {
      await coresService.excluir(cor.id);
      onPronto();
    } catch (falha) {
      setErro(falha);
      setExcluindo(false);
    }
  }

  return (
    <div className="admin-cores__form">
      {cor.totalProdutos > 0 ? (
        <p className="t-body-lg">
          {cor.totalProdutos} {cor.totalProdutos === 1 ? 'peça usa' : 'peças usam'} a cor{' '}
          {cor.nome}. Tire a cor dessas peças antes de excluir — ou esconda a cor do filtro, que
          não mexe em peça nenhuma.
        </p>
      ) : (
        <p className="t-body-lg">Excluir a cor {cor.nome}? Nenhuma peça usa esta cor.</p>
      )}
      {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button
        variante="primaria"
        largo
        onClick={excluir}
        disabled={excluindo || cor.totalProdutos > 0}
      >
        {excluindo ? 'Excluindo…' : 'Excluir'}
      </Button>
    </div>
  );
}

function ProdutosDaCor({ cor }) {
  const { dados, erro, carregando, recarregar } = useRequisicao(
    (sinal) => coresService.produtosDaCor(cor.id, sinal),
    [cor.id],
  );

  if (carregando) {
    return (
      <div className="estado-carregando" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Esqueleto key={i} className="esqueleto--linha" />
        ))}
      </div>
    );
  }
  if (erro) return <EstadoErro erro={erro} onTentar={recarregar} />;

  return (
    <div className="admin-cores__produtos">
      <p className="t-body-sm t-muted">
        {dados.paginacao.total} {dados.paginacao.total === 1 ? 'peça' : 'peças'}, incluindo as
        escondidas da loja.
      </p>
      <ul>
        {dados.dados.map((produto) => (
          <li key={produto.id} className="admin-cores__produto">
            <span className="t-codigo">{produto.codigo}</span>
            <span className="t-body-sm">{produto.nome}</span>
            <span className="t-label-caps-sm t-muted">{produto.marca.nome}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
