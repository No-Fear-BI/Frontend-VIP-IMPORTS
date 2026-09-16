import './Logo.css';

/*
 * PROVISÓRIO: wordmark montado em texto até o arquivo oficial do logo (SVG do manual de
 * @mpandradecom) entrar em src/assets/logo/. Quando entrar, troque o conteúdo deste
 * componente pelo <img>/<svg> oficial e mantenha a API (`tom`).
 * Combinações permitidas pelo manual: verde sobre creme/papel (tom="verde") e
 * creme sobre verde (tom="creme"). Não invente uma terceira.
 */
export default function Logo({ tom = 'verde', className = '' }) {
  return (
    <span className={`logo logo--${tom} ${className}`} aria-label="VIP Imports" role="img">
      <span className="logo__vip" aria-hidden>
        VIP
      </span>
      <span className="logo__filete" aria-hidden />
      <span className="logo__imports" aria-hidden>
        Imports
      </span>
    </span>
  );
}
