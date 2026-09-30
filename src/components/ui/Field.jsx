import { cn } from '../../lib/cn.js';
import { IconeAlerta } from '../Icones.jsx';
import './Field.css';

/**
 * Input com rótulo acima (nunca placeholder como rótulo) e erro embaixo.
 * `erro` normalmente é `erroApi.campos[nome]` — o texto já vem pronto do backend.
 * `obrigatorio` põe o asterisco no rótulo e `aria-required` no input, sem o
 * `required` nativo: quem valida é a tela, com a mensagem dela.
 */
export default function Field({ id, rotulo, erro, ajuda, obrigatorio, className, ...props }) {
  const idErro = `${id}-erro`;
  const idAjuda = `${id}-ajuda`;
  return (
    <div className={cn('campo', erro && 'campo--erro', className)}>
      <label htmlFor={id} className="t-label-caps">
        {rotulo}
        {obrigatorio && <MarcaObrigatorio />}
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
        aria-required={obrigatorio || undefined}
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

/** Asterisco de campo obrigatório. O leitor de tela ouve "obrigatório", não "asterisco". */
export function MarcaObrigatorio() {
  return (
    <>
      <span className="campo__obrigatorio" aria-hidden="true"> *</span>
      <span className="visualmente-oculto"> (obrigatório)</span>
    </>
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
