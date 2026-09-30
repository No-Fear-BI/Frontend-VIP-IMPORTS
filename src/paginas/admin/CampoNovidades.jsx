import { useId, useState } from 'react';
import './CampoNovidades.css';

/*
 * Checkbox "Colocar em novidades" + botão "?" que explica a regra. Usado na Revisão (ao
 * aprovar), na criação e na edição do produto. A regra é do backend: Novidades mostra quem está
 * com a caixa marcada E foi criado nos últimos 14 dias (docs/decisoes-frontend.md, seção 21).
 */
export default function CampoNovidades({ id, rotulo, marcado, onMudar, disabled = false }) {
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const idAjuda = useId();

  return (
    <div className="campo-novidades">
      <div className="campo-novidades__linha">
        <label className="campo-novidades__caixa">
          <input
            id={id}
            type="checkbox"
            checked={marcado}
            disabled={disabled}
            onChange={(e) => onMudar(e.target.checked)}
          />
          <span className="t-body-sm">{rotulo}</span>
        </label>
        <button
          type="button"
          className="campo-novidades__ajuda-botao"
          aria-expanded={ajudaAberta}
          aria-controls={idAjuda}
          aria-label="O que significa colocar em novidades?"
          onClick={() => setAjudaAberta((aberta) => !aberta)}
        >
          ?
        </button>
      </div>
      <p id={idAjuda} className="t-body-sm t-muted campo-novidades__ajuda" hidden={!ajudaAberta}>
        O produto aparece na página Novidades da loja por até 14 dias, contados da data em que foi
        criado. Depois disso ele sai de lá sozinho e continua nas categorias, em Todos, na busca,
        na marca e na coleção. Desmarcado, ele não entra nas novidades.
      </p>
    </div>
  );
}
