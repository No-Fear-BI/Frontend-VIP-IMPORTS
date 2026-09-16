import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn.js';
import { IconeFechar } from '../Icones.jsx';
import './Modal.css';

/**
 * A única camada flutuante do site (compra, favoritos, menu e filtros no celular).
 * Usa <dialog> nativo: foco preso e Esc de graça. `lateral` vira gaveta à esquerda.
 */
export default function Modal({ aberto, onFechar, titulo, children, lateral = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className={cn('modal', lateral && 'modal--lateral')}
      aria-label={typeof titulo === 'string' ? titulo : undefined}
      onCancel={(evento) => {
        evento.preventDefault();
        onFechar();
      }}
      onClick={(evento) => {
        if (evento.target === ref.current) onFechar();
      }}
    >
      {aberto && (
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
