import { cn } from '../lib/cn.js';
import './Carregando.css';

/*
 * O carregador da loja (docs/decisoes-frontend.md, seção 34): aparece sempre que a loja espera
 * dado — abertura do site, página, seção, filtro, "Carregar mais peças", janela de compra. O painel
 * (/admin) continua com os esqueletos de Estados.jsx.
 *
 * Refeito em CSS a partir do Lottie de referência (lottie.host/5392a6eb-…/zCkF8mMWg7.json), com as
 * cores da marca no lugar das originais e sem carregar a biblioteca do Lottie. O desenho e o
 * movimento estão em Carregando.css.
 *
 * O mesmo HTML existe no index.html (#carregador-inicial), para a tela não ficar em branco
 * enquanto o JavaScript baixa: mudou a marcação aqui, mude lá também.
 *
 * Variantes: `tela` (tela cheia, abertura), `pagina` (no lugar de uma página inteira), `bloco`
 * (no lugar de uma seção) e `compacto` (em linha: filtro, botão, janela). `decorativo` tira o
 * anúncio para leitor de tela, para quando o texto ao lado já diz que está carregando.
 */
export default function Carregando({ variante = 'bloco', rotulo = 'Carregando…', decorativo = false }) {
  const Tag = variante === 'compacto' ? 'span' : 'div';
  return (
    <Tag className={cn('carregador', `carregador--${variante}`)} {...(decorativo ? { 'aria-hidden': true } : { role: 'status' })}>
      <span className="carregador__palco" aria-hidden>
        <span className="carregador__quadrado carregador__quadrado--rastro-fim" />
        <span className="carregador__quadrado carregador__quadrado--rastro" />
        <span className="carregador__quadrado carregador__quadrado--frente" />
      </span>
      {!decorativo && <span className="carregador__rotulo t-label-caps t-muted">{rotulo}</span>}
    </Tag>
  );
}
