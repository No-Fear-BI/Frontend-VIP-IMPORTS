import completoVerde from '../assets/logo/logo-completo-verde.png';
import completoCreme from '../assets/logo/logo-completo-creme.png';
import monogramaVerde from '../assets/logo/logo-monograma-verde.png';
import monogramaCreme from '../assets/logo/logo-monograma-creme.png';
import './Logo.css';

/*
 * Logo oficial. Duas combinações, as únicas do manual: verde sobre creme/papel
 * (tom="verde") e creme sobre verde (tom="creme"). Não invente uma terceira.
 *
 * `variante="monograma"` é só o V, para espaço estreito (rodapé, favicon, selo).
 * Os arquivos têm fundo transparente: o PNG original vinha com o fundo verde
 * chapado, que virava um retângulo dentro de qualquer superfície creme.
 */
const ARQUIVOS = {
  completo: { verde: completoVerde, creme: completoCreme },
  monograma: { verde: monogramaVerde, creme: monogramaCreme },
};

export default function Logo({ tom = 'verde', variante = 'completo', className = '' }) {
  return (
    <img
      className={`logo logo--${variante} ${className}`}
      src={ARQUIVOS[variante][tom]}
      alt="VIP Imports"
      width={variante === 'monograma' ? 318 : 440}
      height={variante === 'monograma' ? 331 : 267}
    />
  );
}
