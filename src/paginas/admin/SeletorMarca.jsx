import { useId } from 'react';
import { MarcaObrigatorio } from '../../components/ui/Field.jsx';

/**
 * Marca da Revisão (ajuste 02): lista das marcas ATIVAS e, no fim, "+ Nova marca…",
 * que abre um campo de texto. Não existe rota de criar marca aqui de propósito: o
 * POST /admin/revisao recebe a marca pelo NOME e o backend reaproveita a que tiver o
 * mesmo slug ou cria uma nova (importar_produto). Por isso o valor que sai é sempre
 * um nome — o da marca escolhida ou o digitado.
 *
 * `valor` é `{ escolha, nova }`: `escolha` é o id da marca (string), NOVA ou ''.
 */
export const NOVA = '__nova__';

export function nomeDaMarca(valor = {}, marcas = []) {
  if (valor.escolha === NOVA) return (valor.nova || '').trim();
  return marcas.find((m) => String(m.id) === valor.escolha)?.nome || '';
}

export default function SeletorMarca({ id, marcas, valor = {}, onMudar, erro, disabled, carregando }) {
  const idNova = `${id}-nova`;
  const idErro = useId();
  const ativas = (marcas || [])
    .filter((m) => m.ativa)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const escolha = valor.escolha || '';
  return (
    <div className={`campo${erro ? ' campo--erro' : ''}`}>
      <label htmlFor={id} className="t-label-caps">
        Marca<MarcaObrigatorio />
      </label>
      <select
        id={id}
        className="campo__input"
        value={escolha}
        disabled={disabled || carregando}
        aria-required="true"
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? idErro : undefined}
        onChange={(e) => onMudar({ escolha: e.target.value, nova: valor.nova || '' })}
      >
        <option value="">{carregando ? 'Carregando marcas…' : 'Escolha a marca'}</option>
        {ativas.map((m) => <option key={m.id} value={String(m.id)}>{m.nome}</option>)}
        <option disabled>──────────</option>
        <option value={NOVA}>+ Nova marca…</option>
      </select>
      {escolha === NOVA && (
        <>
          <label htmlFor={idNova} className="t-label-caps">
            Nome da nova marca<MarcaObrigatorio />
          </label>
          <input
            id={idNova}
            className="campo__input"
            value={valor.nova || ''}
            maxLength={80}
            disabled={disabled}
            aria-required="true"
            autoFocus
            onChange={(e) => onMudar({ escolha: NOVA, nova: e.target.value })}
          />
          <p className="t-body-sm t-muted">A marca é cadastrada ao aprovar. Confira a grafia: ela aparece assim na loja.</p>
        </>
      )}
      {erro && <p id={idErro} className="campo__erro t-body-sm">{erro}</p>}
    </div>
  );
}
