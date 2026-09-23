/*
 * Fluxo "Consultar valores no WhatsApp" — o único jeito de uma peça entrar na seleção.
 *
 * Decisão registrada em docs/decisoes-frontend.md: o botão passa pelo BACKEND.
 *   1. (só a partir do cartão) escolher tamanho/cor, ambos opcionais
 *   2. identificar por e-mail, se ainda não houver sessão
 *   3. POST /carrinho com a peça
 *   4. se a seleção já tinha OUTRAS peças, perguntar: enviar só esta ou todas juntas
 *   5. POST /selecoes → abrir `linkWhatsapp` (vem pronto; o número da loja NUNCA fica no frontend)
 * POST /selecoes não esvazia o carrinho, e esta tela também não esvazia sozinha.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ehNaoIdentificado } from '../lib/apiClient.js';
import { carrinhoService } from '../services/carrinhoService.js';
import { catalogoService } from '../services/catalogoService.js';
import { selecoesService } from '../services/selecoesService.js';
import { ErroGeral } from '../components/ui/Field.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Esqueleto } from '../components/Estados.jsx';
import FormIdentificacao from '../components/FormIdentificacao.jsx';
import { IconeWhatsApp } from '../components/Icones.jsx';
import { FotoProduto, rotuloCompra } from '../components/Produto.jsx';
import SeletorVariacoes from '../components/SeletorVariacoes.jsx';
import { useSessaoCliente } from './SessaoCliente.jsx';
import Button from '../components/ui/Button.jsx';
import './CompraWhatsApp.css';

const Contexto = createContext(null);
const PAR_VAZIO = { variacaoTamanhoId: null, variacaoCorId: null };

export const rotuloVariacao = (item) =>
  [item.variacaoTamanho?.valor, item.variacaoCor?.valor].filter(Boolean).join(' / ');

export function ProvedorCompraWhatsApp({ children }) {
  const { cliente, setCliente, recarregarSelecao } = useSessaoCliente();
  const [compra, setCompra] = useState(null);
  const ultimaAcao = useRef(null);

  const atualizar = (parcial) => setCompra((atual) => (atual ? { ...atual, ...parcial } : atual));

  const fechar = useCallback(() => setCompra(null), []);

  const tratarFalha = useCallback(
    (erro) => {
      if (ehNaoIdentificado(erro)) {
        setCliente(null);
        atualizar({ etapa: 'email', erro: null });
        return;
      }
      atualizar({ etapa: 'falha', erro });
    },
    [setCliente],
  );

  const enviar = useCallback(async () => {
    ultimaAcao.current = enviar;
    atualizar({ etapa: 'processando', texto: 'Preparando sua conversa…', erro: null });
    try {
      const selecao = await selecoesService.enviar();
      window.open(selecao.linkWhatsapp, '_blank', 'noopener');
      atualizar({ etapa: 'pronto', selecao });
    } catch (erro) {
      tratarFalha(erro);
    }
  }, [tratarFalha]);

  const enviarSoEsta = useCallback(
    async (outras) => {
      ultimaAcao.current = () => enviarSoEsta(outras);
      atualizar({ etapa: 'processando', texto: 'Separando esta peça…', erro: null });
      try {
        for (const item of outras) {
          await carrinhoService.remover(item.itemId);
        }
        await recarregarSelecao();
        await enviar();
      } catch (erro) {
        tratarFalha(erro);
      }
    },
    [enviar, recarregarSelecao, tratarFalha],
  );

  const colocarNaSelecao = useCallback(
    async (produto, par) => {
      ultimaAcao.current = () => colocarNaSelecao(produto, par);
      atualizar({ etapa: 'processando', texto: 'Guardando a peça na sua seleção…', erro: null });
      try {
        await carrinhoService.adicionar({ produtoId: produto.id, ...par });
        const lista = await recarregarSelecao();
        const outras = lista.filter(
          (item) =>
            !(
              item.id === produto.id &&
              (item.variacaoTamanho?.id ?? null) === par.variacaoTamanhoId &&
              (item.variacaoCor?.id ?? null) === par.variacaoCorId
            ),
        );
        if (outras.length > 0) {
          atualizar({ etapa: 'outras', outras });
          return;
        }
        await enviar();
      } catch (erro) {
        tratarFalha(erro);
      }
    },
    [enviar, recarregarSelecao, tratarFalha],
  );

  const seguirAposEscolha = useCallback(
    (produto, par, temCliente) => {
      if (!temCliente) {
        atualizar({ etapa: 'email', par });
        return;
      }
      colocarNaSelecao(produto, par);
    },
    [colocarNaSelecao],
  );

  /**
   * @param {{ produto: object, par?: {variacaoTamanhoId, variacaoCorId} }} opcoes
   * Sem `par` (vindo do cartão da grade), abre a escolha de tamanho/cor antes.
   */
  const comprar = useCallback(
    ({ produto, par }) => {
      if (par) {
        setCompra({ produto, par, etapa: 'processando', texto: 'Um instante…' });
        seguirAposEscolha(produto, par, Boolean(cliente));
        return;
      }
      setCompra({ produto, par: PAR_VAZIO, etapa: 'escolha', detalhe: null, erro: null });
      carregarDetalhe(produto);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cliente, seguirAposEscolha],
  );

  async function carregarDetalhe(produto) {
    atualizar({ detalhe: null, erro: null });
    try {
      const detalhe = await catalogoService.produto(produto.codigo);
      if (detalhe.variacoes.length === 0) {
        seguirAposEscolha(detalhe, PAR_VAZIO, Boolean(cliente));
        setCompra((atual) => (atual ? { ...atual, produto: { ...atual.produto, ...detalhe } } : atual));
        return;
      }
      atualizar({ detalhe });
    } catch (erro) {
      atualizar({ erro });
    }
  }

  const valor = useMemo(() => ({ comprar }), [comprar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <Modal aberto={Boolean(compra)} onFechar={fechar} titulo="Consultar valores no WhatsApp">
        {compra && (
          <ConteudoCompra
            compra={compra}
            onMudarPar={(par) => atualizar({ par })}
            onContinuarEscolha={() => seguirAposEscolha(compra.produto, compra.par, Boolean(cliente))}
            onTentarDetalhe={() => carregarDetalhe(compra.produto)}
            onIdentificado={() => colocarNaSelecao(compra.produto, compra.par)}
            onEnviarTodas={enviar}
            onEnviarSoEsta={() => enviarSoEsta(compra.outras)}
            onTentarDeNovo={() => ultimaAcao.current?.()}
            onFechar={fechar}
          />
        )}
      </Modal>
    </Contexto.Provider>
  );
}

function ConteudoCompra({
  compra,
  onMudarPar,
  onContinuarEscolha,
  onTentarDetalhe,
  onIdentificado,
  onEnviarTodas,
  onEnviarSoEsta,
  onTentarDeNovo,
  onFechar,
}) {
  const { produto, etapa } = compra;
  const capa = produto.capa?.url || produto.imagens?.[0]?.url;

  return (
    <div className="compra">
      <p className="t-label-caps-sm t-muted compra__sobretitulo">{rotuloCompra(produto.status)}</p>

      <div className="compra__resumo">
        <FotoProduto url={capa} alt="" className="compra__foto" />
        <div>
          <p className="t-label-caps-sm t-muted">{produto.marca.nome}</p>
          <p className="t-headline-sm">Código {produto.codigo}</p>
          <p className="t-body-sm t-muted">{produto.nome}</p>
        </div>
      </div>

      <hr className="filete" />

      <div aria-live="polite">
        {etapa === 'escolha' && (
          <div className="compra__etapa">
            {!compra.detalhe && !compra.erro && (
              <div className="estado-carregando" aria-busy="true">
                <Esqueleto className="esqueleto--linha" style={{ width: '30%' }} />
                <Esqueleto className="esqueleto--controle-compacto" />
              </div>
            )}
            {compra.erro && (
              <>
                <ErroGeral>{compra.erro.mensagem}</ErroGeral>
                <Button variante="secundaria" onClick={onTentarDetalhe}>
                  Tentar de novo
                </Button>
              </>
            )}
            {compra.detalhe && (
              <>
                <SeletorVariacoes
                  variacoes={compra.detalhe.variacoes}
                  valor={compra.par}
                  onMudar={onMudarPar}
                  idBase="compra"
                />
                <Button variante="primaria" largo onClick={onContinuarEscolha}>
                  <IconeWhatsApp />
                  Continuar para o WhatsApp
                </Button>
              </>
            )}
          </div>
        )}

        {etapa === 'email' && (
          <div className="compra__etapa">
            <h2 className="t-headline-md">Para abrir a conversa, seu e-mail</h2>
            <p className="t-body-sm t-muted">
              Sem senha. O e-mail guarda sua seleção e diz ao atendimento quem está chamando.
            </p>
            <FormIdentificacao onIdentificado={onIdentificado} idBase="compra" />
          </div>
        )}

        {etapa === 'outras' && (
          <div className="compra__etapa">
            <h2 className="t-headline-md">Sua seleção já tem outras peças</h2>
            <p className="t-body-sm t-muted">
              A conversa leva a seleção inteira. Escolha se esta peça vai sozinha ou junto com as outras.
            </p>
            <ul className="compra__outras">
              {compra.outras.map((item) => (
                <li key={item.itemId} className="t-body-sm">
                  <span className="t-codigo">{item.codigo}</span> {item.nome}
                  {rotuloVariacao(item) && <span className="t-muted"> · {rotuloVariacao(item)}</span>}
                </li>
              ))}
            </ul>
            <div className="compra__botoes">
              <Button variante="primaria" largo onClick={onEnviarSoEsta}>
                <IconeWhatsApp />
                Enviar só esta peça
              </Button>
              <Button variante="secundaria" largo onClick={onEnviarTodas}>
                Enviar as {compra.outras.length + 1} peças juntas
              </Button>
            </div>
            <p className="t-body-sm t-muted">
              {compra.outras.length === 1
                ? '"Só esta peça" tira a outra peça da sua seleção.'
                : `"Só esta peça" tira as outras ${compra.outras.length} peças da sua seleção.`}
            </p>
          </div>
        )}

        {etapa === 'processando' && (
          <div className="compra__etapa" aria-busy="true">
            <p className="t-body-lg">{compra.texto}</p>
          </div>
        )}

        {etapa === 'falha' && (
          <div className="compra__etapa">
            <ErroGeral>{compra.erro?.mensagem || 'Não foi possível continuar agora.'}</ErroGeral>
            <Button variante="secundaria" onClick={onTentarDeNovo}>
              Tentar de novo
            </Button>
          </div>
        )}

        {etapa === 'pronto' && (
          <div className="compra__etapa">
            <h2 className="t-headline-md">Conversa pronta</h2>
            <p className="t-body-sm t-muted">
              Abrimos o WhatsApp com a mensagem já escrita. Se ele não abriu sozinho, toque abaixo.
            </p>
            <Button variante="primaria" largo
              href={compra.selecao.linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconeWhatsApp />
              Abrir WhatsApp
            </Button>
            <Link to="/selecao" className="link-caps" onClick={onFechar}>
              Ver minha seleção
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function useCompra() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useCompra precisa estar dentro de <ProvedorCompraWhatsApp>.');
  return valor;
}
