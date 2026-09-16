/*
 * "Minha seleção" = o carrinho do backend (GET /carrinho). Sem quantidade e sem preço.
 * - Trocar tamanho/cor: PATCH /carrinho/:itemId com o PAR inteiro, depois recarregar a lista
 *   (o item pode se fundir com outro igual e sumir).
 * - Enviar: POST /selecoes → abrir linkWhatsapp. NÃO esvazia a seleção.
 * - Limpar: DELETE item a item (o backend não tem "esvaziar").
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { carrinhoService } from '../services/carrinhoService.js';
import { catalogoService } from '../services/catalogoService.js';
import { selecoesService } from '../services/selecoesService.js';
import { ErroGeral } from '../components/ui/Field.jsx';
import { Esqueleto, EstadoErro, EstadoVazio } from '../components/Estados.jsx';
import FormIdentificacao from '../components/FormIdentificacao.jsx';
import { IconeWhatsApp } from '../components/Icones.jsx';
import { Etiqueta, FotoProduto } from '../components/Produto.jsx';
import SeletorVariacoes from '../components/SeletorVariacoes.jsx';
import { rotuloVariacao } from '../contexto/CompraWhatsApp.jsx';
import { useSessaoCliente } from '../contexto/SessaoCliente.jsx';
import Button from '../components/ui/Button.jsx';
import './Selecao.css';

export default function Selecao() {
  const { cliente, verificando, recarregarSelecao, itens, avisar } = useSessaoCliente();
  const [estado, setEstado] = useState({ carregando: true, erro: null });
  const [envio, setEnvio] = useState({ enviando: false, erro: null, selecao: null });
  const [confirmandoLimpar, setConfirmandoLimpar] = useState(false);
  const [limpando, setLimpando] = useState(false);

  async function carregar() {
    setEstado({ carregando: true, erro: null });
    try {
      await recarregarSelecao();
      setEstado({ carregando: false, erro: null });
    } catch (erro) {
      setEstado({ carregando: false, erro });
    }
  }

  useEffect(() => {
    if (cliente) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente?.id]);

  async function enviar() {
    setEnvio({ enviando: true, erro: null, selecao: null });
    try {
      const selecao = await selecoesService.enviar();
      window.open(selecao.linkWhatsapp, '_blank', 'noopener');
      setEnvio({ enviando: false, erro: null, selecao });
    } catch (erro) {
      setEnvio({ enviando: false, erro, selecao: null });
      if (erro.codigo === 'CARRINHO_VAZIO') carregar();
    }
  }

  async function limpar() {
    setLimpando(true);
    try {
      for (const item of itens) {
        await carrinhoService.remover(item.itemId);
      }
      avisar('Seleção limpa.');
    } catch (erro) {
      setEstado({ carregando: false, erro });
    } finally {
      setLimpando(false);
      setConfirmandoLimpar(false);
      carregar();
    }
  }

  const topo = (
    <header className="topo-pagina">
      <p className="t-label-caps t-muted">Antes de chamar o atendimento</p>
      <h1 className="t-headline-lg">Minha seleção</h1>
    </header>
  );

  if (verificando) {
    return (
      <div className="container selecao">
        {topo}
        <SelecaoEsqueleto />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="container selecao">
        {topo}
        <div className="selecao__identificar">
          <p className="t-body-lg">
            Informe o e-mail que você usou em Comprar no WhatsApp para ver as peças que guardou.
          </p>
          <FormIdentificacao idBase="selecao" rotuloBotao="Ver minha seleção" />
        </div>
      </div>
    );
  }

  return (
    <div className="container selecao">
      {topo}

      {estado.carregando && itens.length === 0 ? (
        <SelecaoEsqueleto />
      ) : estado.erro ? (
        <EstadoErro erro={estado.erro} onTentar={carregar} titulo="Não conseguimos abrir sua seleção." />
      ) : itens.length === 0 ? (
        <EstadoVazio
          titulo="Sua seleção está vazia."
          texto="Toque em Comprar no WhatsApp em qualquer peça e ela aparece aqui."
          acao={{ rotulo: 'Ver novidades', para: '/novidades' }}
        />
      ) : (
        <div className="selecao__grade">
          <ul className="selecao__lista" aria-label="Peças da seleção">
            {itens.map((item) => (
              <ItemSelecao key={item.itemId} item={item} onMudou={carregar} />
            ))}
          </ul>

          <aside className="selecao__resumo" aria-label="Resumo">
            <p className="t-label-caps">
              {itens.length} {itens.length === 1 ? 'peça' : 'peças'}
            </p>
            <p className="t-body-lg">Valor confirmado pelo atendimento.</p>
            <p className="t-body-sm t-muted">
              A mensagem sai pronta com o código, a marca, o tamanho e a cor de cada peça. Enviar não apaga sua
              seleção.
            </p>
            <Button variante="primaria" largo onClick={enviar} disabled={envio.enviando}>
              <IconeWhatsApp />
              {envio.enviando ? 'Abrindo o WhatsApp…' : 'Enviar seleção pelo WhatsApp'}
            </Button>
            {envio.erro && <ErroGeral>{envio.erro.mensagem}</ErroGeral>}
            {envio.selecao && (
              <p className="t-body-sm selecao__enviada" role="status">
                Mensagem pronta. Se o WhatsApp não abriu,{' '}
                <a href={envio.selecao.linkWhatsapp} target="_blank" rel="noopener noreferrer" className="link-caps">
                  toque aqui
                </a>
                .
              </p>
            )}

            <hr className="filete" />

            {confirmandoLimpar ? (
              <div className="selecao__confirmar" role="alertdialog" aria-label="Confirmar limpeza">
                <p className="t-body-sm">
                  Tirar as {itens.length} {itens.length === 1 ? 'peça' : 'peças'} da seleção?
                </p>
                <div className="selecao__confirmar-botoes">
                  <Button variante="secundaria" onClick={limpar} disabled={limpando}>
                    {limpando ? 'Limpando…' : 'Sim, limpar'}
                  </Button>
                  <button type="button" className="link-caps" onClick={() => setConfirmandoLimpar(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="link-caps" onClick={() => setConfirmandoLimpar(true)}>
                Limpar seleção
              </button>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function ItemSelecao({ item, onMudou }) {
  const [editando, setEditando] = useState(false);
  const [detalhe, setDetalhe] = useState({ dados: null, erro: null });
  const [par, setPar] = useState({
    variacaoTamanhoId: item.variacaoTamanho?.id ?? null,
    variacaoCorId: item.variacaoCor?.id ?? null,
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  async function abrirEdicao() {
    setEditando(true);
    setErro(null);
    if (detalhe.dados) return;
    try {
      setDetalhe({ dados: await catalogoService.produto(item.codigo), erro: null });
    } catch (falha) {
      setDetalhe({ dados: null, erro: falha });
    }
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      // Os DOIS campos sempre: o PATCH troca o par inteiro.
      await carrinhoService.trocarVariacao(item.itemId, par);
      setEditando(false);
      onMudou();
    } catch (falha) {
      setErro(falha.campos?.variacaoTamanhoId || falha.campos?.variacaoCorId || falha.mensagem);
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    setSalvando(true);
    try {
      await carrinhoService.remover(item.itemId);
      onMudou();
    } catch (falha) {
      setErro(falha.mensagem);
      setSalvando(false);
    }
  }

  const variacao = rotuloVariacao(item);
  const destino = `/produto/${encodeURIComponent(item.codigo)}`;

  return (
    <li className="item-selecao">
      <Link to={destino} className="item-selecao__foto" tabIndex={-1} aria-hidden>
        <FotoProduto url={item.capa?.url} alt="" />
      </Link>
      <div className="item-selecao__info">
        <p className="t-label-caps-sm t-muted">{item.marca.nome}</p>
        <Etiqueta>{item.codigo}</Etiqueta>
        <Link to={destino} className="t-headline-sm item-selecao__nome">
          {item.nome}
        </Link>
        <p className="t-body-sm t-muted">
          {variacao ? variacao : 'Tamanho e cor a combinar com o atendimento'}
          {item.status === 'esgotado' && ' · Esgotado'}
        </p>

        {editando ? (
          <div className="item-selecao__edicao">
            {!detalhe.dados && !detalhe.erro && <Esqueleto className="esqueleto--controle-compacto" style={{ width: '60%' }} />}
            {detalhe.erro && <ErroGeral>{detalhe.erro.mensagem}</ErroGeral>}
            {detalhe.dados && detalhe.dados.variacoes.length === 0 && (
              <p className="t-body-sm t-muted">Esta peça não tem tamanho nem cor para escolher.</p>
            )}
            {detalhe.dados && (
              <SeletorVariacoes
                variacoes={detalhe.dados.variacoes}
                valor={par}
                onMudar={setPar}
                idBase={`item-${item.itemId}`}
              />
            )}
            {erro && <ErroGeral>{erro}</ErroGeral>}
            <div className="item-selecao__botoes">
              <Button variante="primaria" onClick={salvar} disabled={salvando || !detalhe.dados}>
                {salvando ? 'Salvando…' : 'Salvar'}
              </Button>
              <button type="button" className="link-caps" onClick={() => setEditando(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="item-selecao__botoes">
            <button type="button" className="link-caps" onClick={abrirEdicao}>
              Alterar tamanho ou cor
            </button>
            <button type="button" className="link-caps" onClick={remover} disabled={salvando}>
              Tirar da seleção
            </button>
            {erro && <ErroGeral>{erro}</ErroGeral>}
          </div>
        )}
      </div>
    </li>
  );
}

function SelecaoEsqueleto() {
  return (
    <div className="selecao__grade" aria-busy="true" aria-label="Carregando seleção">
      <div className="selecao__lista">
        {[0, 1].map((i) => (
          <div key={i} className="item-selecao">
            <Esqueleto className="esqueleto--foto" />
            <div className="item-selecao__info">
              <Esqueleto className="esqueleto--linha esqueleto--curta" />
              <Esqueleto className="esqueleto--titulo" style={{ width: '40%' }} />
              <Esqueleto className="esqueleto--titulo" style={{ width: '70%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
