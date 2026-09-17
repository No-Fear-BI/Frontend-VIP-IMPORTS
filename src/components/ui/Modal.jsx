import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn.js';
import { IconeFechar } from '../Icones.jsx';
import './Modal.css';

// Lê --duracao-saida do próprio tokens.css em vez de duplicar "160ms" aqui: se o valor mudar
// num redesign, este componente acompanha sem precisar de outro deploy.
function duracaoSaidaEmMs() {
  const valor = getComputedStyle(document.documentElement).getPropertyValue('--duracao-saida');
  const ms = parseFloat(valor);
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * A única camada flutuante do site (compra, favoritos, menu e filtros no celular).
 * Usa <dialog> nativo: foco preso e Esc de graça. `lateral` vira gaveta à esquerda.
 */
export default function Modal({ aberto, onFechar, titulo, children, lateral = false }) {
  const ref = useRef(null);
  const [fechando, setFechando] = useState(false);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;

    if (aberto) {
      setFechando(false);
      if (!dialogo.open) dialogo.showModal();
      return;
    }

    if (!dialogo.open) return;

    // Toca a animação de saída (.modal--fechando, ver Modal.css) antes de fechar o <dialog> de
    // verdade, senão ele some no mesmo frame em que `aberto` vira false.
    setFechando(true);
    const tempo = setTimeout(() => {
      dialogo.close();
      setFechando(false);
    }, duracaoSaidaEmMs());
    return () => clearTimeout(tempo);
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className={cn('modal', lateral && 'modal--lateral', fechando && 'modal--fechando')}
      aria-label={typeof titulo === 'string' ? titulo : undefined}
      onCancel={(evento) => {
        evento.preventDefault();
        onFechar();
      }}
      onClick={(evento) => {
        if (evento.target === ref.current) onFechar();
      }}
    >
      {(aberto || fechando) && (
        <div className="modal__corpo">
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            <IconeFechar />
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
