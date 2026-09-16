import { cn } from '../../lib/cn.js';
import { IconeAlerta } from '../Icones.jsx';
import './Field.css';

/**
 * Input com rótulo acima (nunca placeholder como rótulo) e erro embaixo.
 * `erro` normalmente é `erroApi.campos[nome]` — o texto já vem pronto do backend.
 */
export default function Field({ id, rotulo, erro, ajuda, className, ...props }) {
  const idErro = `${id}-erro`;
  const idAjuda = `${id}-ajuda`;
  return (
    <div className={cn('campo', erro && 'campo--erro', className)}>
      <label htmlFor={id} className="t-label-caps">
        {rotulo}
      </label>
      {ajuda && (
        <p id={idAjuda} className="t-body-sm t-muted">
          {ajuda}
        </p>
      )}
      <input
        id={id}
        className="campo__input"
        aria-invalid={Boolean(erro)}
        aria-describedby={[erro && idErro, ajuda && idAjuda].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {erro && (
        <p id={idErro} className="campo__erro t-body-sm">
          <IconeAlerta />
          {erro}
        </p>
      )}
    </div>
  );
}

/** Erro geral, não ligado a um campo (ex.: `erroApi.mensagem`): ícone + frase + traço. */
export function ErroGeral({ children }) {
  return (
    <p className="erro-geral t-body-sm" role="alert">
      <IconeAlerta />
      <span>{children}</span>
    </p>
  );
}
