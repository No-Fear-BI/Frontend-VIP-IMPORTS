import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

/**
 * Botão base. Estilos em src/styles/global.css (.botao, .botao--*), só com tokens.
 *
 * variante:
 *   'primaria'                    ação principal da tela (ex.: "Comprar no WhatsApp")
 *   'secundaria'                  ação de apoio, "Tentar de novo"
 *   'texto'                       ícone + versalete, sem fundo (ações dentro de cartão)
 *   'sobre-primaria'              botão cheio dentro de .faixa-primaria
 *   'contorno-sobre-primaria'     botão de contorno dentro de .faixa-primaria
 *
 * Vira <Link> com `para`, <a> com `href`, e <button type="button"> no resto.
 * Na variante 'texto', passe o rótulo dentro de <span> para o sublinhado do hover.
 */
export default function Button({ variante = 'primaria', largo = false, para, href, className, type = 'button', ...props }) {
  const classes = cn('botao', `botao--${variante}`, largo && 'botao--largo', className);
  if (para) return <Link to={para} className={classes} {...props} />;
  if (href) return <a href={href} className={classes} {...props} />;
  return <button type={type} className={classes} {...props} />;
}
