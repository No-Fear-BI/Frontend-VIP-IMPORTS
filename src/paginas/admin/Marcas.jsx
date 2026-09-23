/*
 * Marcas do painel (/admin/marcas). CRUD simples, no mesmo padrão de Cores.jsx.
 *
 * O que o backend impõe (docs/para-o-frontend.md, "Painel administrativo — marcas, categorias e
 * banners"):
 * 1. O slug nasce do nome na criação e NÃO muda sozinho depois. Editar "chanel" para "Chanel"
 *    não mexe na URL pública (`/marcas/chanel`, já compartilhada/indexada) — só muda se `slug`
 *    vier explicitamente no corpo.
 * 2. Marca com produto não é excluída: 409 `MARCA_COM_PRODUTOS` com a contagem. Por isso
 *    `totalProdutos` aparece na linha ANTES do botão de excluir, e o botão já nasce desabilitado
 *    quando há produtos — a mensagem do 409 é o reforço para quem forçar por fora da tela.
 */

import { useState } from 'react';
import { EstadoErro, EstadoVazio, Esqueleto } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useRequisicao } from '../../hooks/useRequisicao.js';
import { marcasService } from '../../services/marcasService.js';
import './Marcas.css';

export default function AdminMarcas() {
  const { dados: marcas, erro, carregando, recarregar } = useRequisicao(
    (sinal) => marcasService.listar(sinal),
    [],
  );
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);

  return (
    <section className="admin__pagina">
      <header className="admin-marcas__topo">
        <div>
          <p className="t-label-caps-sm t-muted">/admin/marcas</p>
          <h1 className="t-headline-lg">Marcas</h1>
          <p className="t-body-sm t-muted admin-marcas__ajuda">
            As grifes do catálogo. Cada produto pertence a uma marca desta lista.
          </p>
        </div>
        <Button variante="primaria" onClick={() => setCriando(true)}>
          Nova marca
        </Button>
      </header>

      {carregando ? (
        <div className="estado-carregando" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Esqueleto key={i} className="esqueleto--linha" />
          ))}
        </div>
      ) : erro ? (
        <EstadoErro erro={erro} onTentar={recarregar} titulo="Não conseguimos carregar as marcas." />
      ) : marcas.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma marca cadastrada ainda."
          texto="Cadastre as grifes que a loja vende: todo produto precisa de uma."
          acao={{ rotulo: 'Nova marca', onClick: () => setCriando(true) }}
        />
      ) : (
        <table className="admin-tabela">
          <thead>
            <tr>
              <th scope="col" className="t-label-caps-sm">Marca</th>
              <th scope="col" className="t-label-caps-sm">Endereço na loja</th>
              <th scope="col" className="t-label-caps-sm">Peças</th>
              <th scope="col"><span className="visualmente-oculto">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {marcas.map((marca) => (
              <tr key={marca.id}>
                <td className="t-body-sm">{marca.nome}</td>
                <td className="t-codigo admin-marcas__slug">/marcas/{marca.slug}</td>
                <td className="t-body-sm">
                  {marca.totalProdutos > 0 ? (
                    `${marca.totalProdutos} ${marca.totalProdutos === 1 ? 'peça' : 'peças'}`
                  ) : (
                    <span className="t-muted">nenhuma</span>
                  )}
                </td>
                <td className="admin-marcas__acoes">
                  <button type="button" className="link-caps" onClick={() => setEditando(marca)}>
                    Editar
                  </button>
                  <button type="button" className="link-caps" onClick={() => setExcluindo(marca)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal aberto={criando} onFechar={() => setCriando(false)} titulo="Nova marca">
        <FormMarca
          onPronto={() => {
            setCriando(false);
            recarregar();
          }}
        />
      </Modal>

      <Modal aberto={Boolean(editando)} onFechar={() => setEditando(null)} titulo="Editar marca">
        {editando && (
          <FormMarca
            marca={editando}
            onPronto={() => {
              setEditando(null);
              recarregar();
            }}
          />
        )}
      </Modal>

      <Modal aberto={Boolean(excluindo)} onFechar={() => setExcluindo(null)} titulo="Excluir marca">
        {excluindo && (
          <ConfirmarExclusao
            marca={excluindo}
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

function FormMarca({ marca, onPronto }) {
  const edicao = Boolean(marca);
  const [nome, setNome] = useState(marca?.nome || '');
  const [slug, setSlug] = useState(marca?.slug || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const slugMudou = edicao && slug.trim() !== marca.slug;

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      if (edicao) {
        // Só o que mudou: mandar `slug` igual ao atual pediria a troca da URL à toa.
        const dados = {};
        if (nome.trim() !== marca.nome) dados.nome = nome.trim();
        if (slugMudou) dados.slug = slug.trim();
        await marcasService.editar(marca.id, dados);
      } else {
        await marcasService.criar({ nome: nome.trim(), ...(slug.trim() ? { slug: slug.trim() } : {}) });
      }
      onPronto();
    } catch (falha) {
      setErro(falha);
      setSalvando(false);
    }
  }

  return (
    <form className="admin-marcas__form" onSubmit={salvar}>
      <Field
        id="marca-nome"
        rotulo="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        erro={erro?.campos?.nome}
        required
        maxLength={80}
      />
      <Field
        id="marca-slug"
        rotulo="Endereço na loja"
        ajuda={edicao ? 'Aparece na URL pública da marca.' : 'Deixe vazio para gerar a partir do nome.'}
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        erro={erro?.campos?.slug}
        maxLength={80}
      />
      {slugMudou && (
        <p className="t-body-sm admin-marcas__aviso" role="status">
          Trocar o endereço quebra links antigos para <span className="t-codigo">/marcas/{marca.slug}</span>.
        </p>
      )}
      {erro && !erro.campos && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button variante="primaria" largo type="submit" disabled={salvando || !nome.trim()}>
        {salvando ? 'Salvando…' : edicao ? 'Salvar' : 'Criar marca'}
      </Button>
    </form>
  );
}

function ConfirmarExclusao({ marca, onPronto }) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState(null);

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    try {
      await marcasService.excluir(marca.id);
      onPronto();
    } catch (falha) {
      setErro(falha);
      setExcluindo(false);
    }
  }

  return (
    <div className="admin-marcas__form">
      {marca.totalProdutos > 0 ? (
        <p className="t-body-lg">
          {marca.totalProdutos} {marca.totalProdutos === 1 ? 'peça usa' : 'peças usam'} a marca{' '}
          {marca.nome}. Mova ou exclua essas peças antes de excluir a marca.
        </p>
      ) : (
        <p className="t-body-lg">Excluir a marca {marca.nome}? Nenhuma peça usa esta marca.</p>
      )}
      {erro && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button
        variante="primaria"
        largo
        onClick={excluir}
        disabled={excluindo || marca.totalProdutos > 0}
      >
        {excluindo ? 'Excluindo…' : 'Excluir'}
      </Button>
    </div>
  );
}
