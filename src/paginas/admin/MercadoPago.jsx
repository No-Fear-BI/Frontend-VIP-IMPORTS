import { useCallback, useEffect, useState } from 'react';
import { Esqueleto, EstadoErro, EstadoVazio } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
import { cn } from '../../lib/cn.js';
import { formatarReais, lerPreco } from '../../lib/preco.js';
import { atendimentoAdminService } from '../../services/atendimentoAdminService.js';
import './MercadoPago.css';

/*
 * Configurações → Mercado Pago (/admin/mercadopago), por enquanto SÓ EM TESTE: na Burnwood DEV o
 * Mercado Pago está em modo teste e conta real é recusada. Cobrar de verdade é decisão do cliente
 * (a loja não vende pelo site).
 *
 * - Conectar a conta do Mercado Pago é no PORTAL da Burnwood (o retorno do login volta para lá);
 *   nenhum segredo de pagamento passa por nós.
 * - O manager aprova um PEDIDO (valor + finalidade); o agente nunca escolhe valor.
 * - Do pedido aprovado sai o CHECKOUT (o link). `paid`/`pending`/`failed` vêm do webhook do Mercado
 *   Pago na Burnwood: link aberto não é pagamento confirmado.
 * - Esta tela só aprova e cria checkout com `mode: "test"`.
 */

const CONSULTA_A_CADA_MS = 4000;

const ROTULO_PEDIDO = { approved: 'Aprovado', used: 'Usado', expired: 'Expirado', cancelled: 'Cancelado' };
const ROTULO_CHECKOUT = { created: 'Criado', pending: 'Aguardando pagamento', paid: 'Pago', failed: 'Falhou' };

const lista = (valor) => (Array.isArray(valor) ? valor : []);
const reaisDoTexto = (texto) => formatarReais(Math.round(Number(texto) * 100));

export default function AdminMercadoPago() {
  const [situacao, setSituacao] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [portal, setPortal] = useState('');
  const [erroCarga, setErroCarga] = useState(null);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [finalidade, setFinalidade] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const [erroValor, setErroValor] = useState(null);

  const atualizar = useCallback(async () => {
    const [estado, abertos, links] = await Promise.all([
      atendimentoAdminService.mercadoPago(),
      atendimentoAdminService.pedidosMercadoPago(),
      atendimentoAdminService.checkoutsMercadoPago(),
    ]);
    setSituacao(estado);
    setPedidos(lista(abertos));
    setCheckouts(lista(links));
  }, []);

  const carregar = useCallback(async () => {
    setErroCarga(null);
    try {
      const [config] = await Promise.all([atendimentoAdminService.configuracao(), atualizar()]);
      setPortal(config.portalPagamentosUrl);
    } catch (falha) {
      setErroCarga(falha);
    }
  }, [atualizar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Checkout esperando o pagamento: a situação muda quando o webhook do Mercado Pago chega na Burnwood.
  const esperandoPagamento = checkouts.some((c) => c.status === 'created' || c.status === 'pending');
  useEffect(() => {
    if (!esperandoPagamento) return undefined;
    const relogio = window.setInterval(() => {
      if (document.visibilityState === 'visible') atualizar().catch(() => {});
    }, CONSULTA_A_CADA_MS);
    return () => window.clearInterval(relogio);
  }, [esperandoPagamento, atualizar]);

  const emTeste = situacao?.mode === 'test';
  const prontoParaCobrar = emTeste && situacao?.connected && situacao?.payments_enabled;

  async function agir(acao, avisoDeSucesso) {
    setErro(null);
    setAviso(null);
    setOcupado(true);
    try {
      await acao();
      setAviso(avisoDeSucesso);
      await atualizar();
      return true;
    } catch (falha) {
      setErro(falha.mensagem || 'A Burnwood recusou a ação. Tente de novo.');
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function aprovar(evento) {
    evento.preventDefault();
    if (!emTeste) return;
    const { centavos, erro: problema } = lerPreco(valorTexto);
    if (problema || !centavos) {
      setErroValor(problema || 'Informe o valor.');
      return;
    }
    setErroValor(null);
    const ok = await agir(
      () => atendimentoAdminService.aprovarPedidoMercadoPago((centavos / 100).toFixed(2), finalidade.trim()),
      'Pedido aprovado. Agora dá para criar o link de pagamento deste valor.',
    );
    if (ok) {
      setFinalidade('');
      setValorTexto('');
    }
  }

  function criarCheckout(pedido) {
    if (!emTeste) return;
    agir(
      () => atendimentoAdminService.criarCheckoutMercadoPago(pedido.purpose, pedido.amount),
      'Link de pagamento de teste criado. Abra e pague com o comprador de teste.',
    );
  }

  return (
    <section className="admin__pagina admin-mercadopago">
      <header className="admin-mercadopago__topo">
        <h1 className="t-headline-lg">Mercado Pago</h1>
        <p className="t-body-sm t-muted admin-mercadopago__ajuda">
          Links de pagamento pelo atendimento, por enquanto só em <strong>modo teste</strong>: nenhum dinheiro de
          verdade passa por aqui. Quem aprova o valor é a equipe; o agente nunca escolhe valor.
        </p>
      </header>

      {situacao === null && !erroCarga ? (
        <div className="admin-mercadopago__cartao" aria-busy="true">
          <Esqueleto className="admin-mercadopago__esqueleto" />
          <Esqueleto className="admin-mercadopago__esqueleto" />
        </div>
      ) : situacao === null && erroCarga?.codigo === 'ATENDIMENTO_INDISPONIVEL' ? (
        <EstadoVazio
          titulo="O atendimento está desligado."
          texto="A integração com a Burnwood ainda não foi ligada neste ambiente, ou está fora do ar."
          acao={{ rotulo: 'Tentar de novo', onClick: carregar }}
        />
      ) : situacao === null ? (
        <EstadoErro erro={erroCarga} onTentar={carregar} titulo="Não conseguimos carregar o Mercado Pago." />
      ) : (
        <div className="admin-mercadopago__colunas">
          <div className="admin-mercadopago__cartao">
            <h2 className="t-label-caps t-muted">Situação</h2>
            <ul className="admin-mercadopago__situacao">
              <Item ok={situacao.enabled} sim="Liberado pela Burnwood" nao="Ainda não liberado pela Burnwood" />
              <Item ok={situacao.connected} sim="Conta do Mercado Pago conectada" nao="Nenhuma conta conectada" />
              <Item ok={situacao.payments_enabled} sim="Pagamentos ligados" nao="Pagamentos desligados neste ambiente" />
              <Item ok={emTeste} sim="Modo teste: sem dinheiro de verdade" nao={`Modo ${situacao.mode}: esta tela não cobra`} />
            </ul>
            {!situacao.connected && (
              <p className="t-body-sm">
                Para conectar, entre no portal da Burnwood com o <strong>vendedor de teste</strong> do Mercado Pago
                (a Burnwood fornece o login). Conta real é recusada neste ambiente.
              </p>
            )}
            {portal && (
              <Button variante="secundaria" href={portal} target="_blank" rel="noreferrer">
                Abrir o portal da Burnwood ↗
              </Button>
            )}
          </div>

          <div className="admin-mercadopago__cartao">
            <h2 className="t-label-caps t-muted">Aprovar um pedido de pagamento</h2>
            {prontoParaCobrar ? (
              <form className="admin-mercadopago__formulario" onSubmit={aprovar}>
                <label className="campo">
                  <span className="t-label-caps">Finalidade *</span>
                  <input
                    className="campo__input"
                    required
                    maxLength={256}
                    value={finalidade}
                    onChange={(e) => setFinalidade(e.target.value)}
                    placeholder="Ex.: Jaqueta DRD-0001 — teste"
                  />
                </label>
                <label className={cn('campo', erroValor && 'campo--erro')}>
                  <span className="t-label-caps">Valor (R$) *</span>
                  <input
                    className="campo__input"
                    required
                    inputMode="decimal"
                    value={valorTexto}
                    onChange={(e) => setValorTexto(e.target.value)}
                    placeholder="10,00"
                  />
                  {erroValor && <span className="campo__erro t-body-sm">{erroValor}</span>}
                </label>
                <Button type="submit" disabled={ocupado}>
                  Aprovar pedido de teste
                </Button>
              </form>
            ) : (
              <p className="t-body-sm t-muted">
                Disponível quando houver conta conectada, pagamentos ligados e modo teste.
              </p>
            )}
          </div>

          <div className="admin-mercadopago__cartao admin-mercadopago__cartao--largo">
            <h2 className="t-label-caps t-muted">Pedidos aprovados</h2>
            {pedidos.length === 0 ? (
              <p className="t-body-sm t-muted">Nenhum pedido ainda.</p>
            ) : (
              <ul className="admin-mercadopago__linhas">
                {pedidos.map((p) => (
                  <li key={p.id} className="admin-mercadopago__linha">
                    <span>
                      <strong>{p.purpose}</strong> · {reaisDoTexto(p.amount)}
                    </span>
                    <span className="t-label-caps-sm t-muted">{ROTULO_PEDIDO[p.status] || p.status}</span>
                    {p.status === 'approved' && emTeste && (
                      <Button variante="secundaria" disabled={ocupado} onClick={() => criarCheckout(p)}>
                        Criar link de pagamento
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin-mercadopago__cartao admin-mercadopago__cartao--largo">
            <h2 className="t-label-caps t-muted">Links de pagamento</h2>
            {checkouts.length === 0 ? (
              <p className="t-body-sm t-muted">Nenhum link ainda.</p>
            ) : (
              <ul className="admin-mercadopago__linhas">
                {checkouts.map((c) => (
                  <li key={c.id} className="admin-mercadopago__linha">
                    <span>
                      <strong>{c.description}</strong> · {reaisDoTexto(c.amount)}
                      {c.live ? ' · AO VIVO' : ' · teste'}
                    </span>
                    <span className="t-label-caps-sm">
                      {ROTULO_CHECKOUT[c.status] || c.status}
                      <span className="t-muted"> · provedor: {c.provider_status}</span>
                    </span>
                    <a className="link-caps" href={c.checkout_url} target="_blank" rel="noreferrer">
                      Abrir link ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="t-body-sm t-muted">
              A situação muda quando o Mercado Pago avisa a Burnwood. Link aberto não é pagamento confirmado.
            </p>
          </div>

          {aviso && (
            <p className="t-body-sm admin-mercadopago__cartao--largo" role="status">
              {aviso}
            </p>
          )}
          {erro && (
            <p className="t-body-sm admin-mercadopago__erro admin-mercadopago__cartao--largo" role="alert">
              {erro}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Item({ ok, sim, nao }) {
  return (
    <li className={cn('admin-mercadopago__item', ok && 'admin-mercadopago__item--ok')}>
      <span aria-hidden="true">{ok ? '✓' : '—'}</span> {ok ? sim : nao}
    </li>
  );
}
