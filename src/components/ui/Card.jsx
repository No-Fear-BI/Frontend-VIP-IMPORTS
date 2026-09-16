import { cn } from '../../lib/cn.js';
import './Card.css';

/**
 * Cartão base: só a caixa (coluna com espaçamento). O conteúdo é de quem usa.
 * `borda` desenha o contorno fino (ex.: cartão de marca); sem borda, é um bloco solto
 * sobre a superfície (ex.: cartão de produto). `como` troca a tag ('article', 'li', Link…).
 */
export default function Card({ como: Tag = 'div', borda = false, className, ...props }) {
  return <Tag className={cn('cartao', borda && 'cartao--borda', className)} {...props} />;
}
