import { Link } from 'react-router-dom';
import { MarcaObrigatorio } from '../../components/ui/Field.jsx';
import './DestinosProduto.css';

/*
 * Público e categorias do produto (migração 0015). O público (Feminino, Masculino ou os dois =
 * unissex) é um campo do produto, separado das categorias; a categoria não pertence a coleção.
 * `valor` = { publicos: ['feminino', 'masculino'], categoriasIds: ['12', '31'] } — a primeira
 * categoria é a principal, as outras (até MAXIMO_CATEGORIAS no total) são temas adicionais.
 */

export const PUBLICOS = [
  { slug: 'feminino', rotulo: 'Feminino' },
  { slug: 'masculino', rotulo: 'Masculino' },
];
export const MAXIMO_CATEGORIAS = 5;

export const destinosVazios = () => ({ publicos: [], categoriasIds: [''] });

export const destinosCompletos = (valor) =>
  Boolean(valor?.publicos?.length) &&
  Boolean(valor?.categoriasIds?.length) &&
  valor.categoriasIds.every((id) => Number(id) > 0);

export function destinosDosIds(ids, publicos) {
  return { publicos: [...(publicos || [])], categoriasIds: (ids?.length ? ids : ['']).map(String) };
}

export default function DestinosProduto({
  id,
  categorias,
  valor,
  onMudar,
  disabled,
  erro,
  erroPublicos,
  obrigatorio,
  somentePrincipal = false,
}) {
  const publicos = valor.publicos || [];
  const ids = valor.categoriasIds?.length ? valor.categoriasIds : [''];

  function alternarPublico(slug, marcado) {
    const proximos = marcado ? [...publicos, slug] : publicos.filter((p) => p !== slug);
    // Mantém a ordem Feminino, Masculino: o backend devolve nessa ordem e o PATCH compara.
    onMudar({ ...valor, publicos: PUBLICOS.map((p) => p.slug).filter((p) => proximos.includes(p)) });
  }

  function trocarCategoria(indice, novo) {
    onMudar({ ...valor, categoriasIds: ids.map((atual, i) => (i === indice ? novo : atual)) });
  }

  return (
    <fieldset className="destinos-produto" disabled={disabled} aria-describedby={`${id}-ajuda`}>
      <legend className="t-label-caps">Público e categorias{obrigatorio && <MarcaObrigatorio />}</legend>
      <p id={`${id}-ajuda`} className="t-body-sm t-muted">
        Marque Feminino, Masculino ou os dois (unissex) e escolha a categoria do produto.
      </p>

      <div className="destinos-produto__colecao">
        <span className="t-label-caps">Público{obrigatorio && <MarcaObrigatorio />}</span>
        <div className="destinos-produto__linha">
          {PUBLICOS.map((publico) => (
            <label key={publico.slug} className="destinos-produto__opcao">
              <input
                type="checkbox"
                checked={publicos.includes(publico.slug)}
                onChange={(e) => alternarPublico(publico.slug, e.target.checked)}
              />
              <span>{publico.rotulo}</span>
            </label>
          ))}
        </div>
        {erroPublicos && (
          <p className="campo__erro t-body-sm" role="alert">
            {erroPublicos}
          </p>
        )}
      </div>

      {ids.map((escolhida, indice) => {
        const principal = indice === 0;
        const opcoes = categorias.filter((c) => c.ativa || String(c.id) === escolhida);
        return (
          <div key={indice} className="destinos-produto__colecao">
            <label className="campo" htmlFor={`${id}-categoria-${indice}`}>
              <span className="t-label-caps">
                {principal ? 'Categoria principal' : 'Outra categoria (opcional)'}
                {principal && obrigatorio && <MarcaObrigatorio />}
              </span>
              <select
                id={`${id}-categoria-${indice}`}
                className="campo__input"
                value={escolhida}
                required
                onChange={(e) => trocarCategoria(indice, e.target.value)}
              >
                <option value="">Escolha a categoria</option>
                {opcoes.map((c) => (
                  <option
                    key={c.id}
                    value={String(c.id)}
                    disabled={!c.ativa || (ids.includes(String(c.id)) && String(c.id) !== escolhida)}
                  >
                    {c.nome}
                    {!c.ativa ? ' (escondida)' : ''}
                  </option>
                ))}
              </select>
            </label>
            {!principal && (
              <button
                type="button"
                className="link-caps destinos-produto__remover"
                onClick={() => onMudar({ ...valor, categoriasIds: ids.filter((_, i) => i !== indice) })}
              >
                Remover esta categoria
              </button>
            )}
            {principal && opcoes.length === 0 && (
              <span className="t-body-sm">
                Nenhuma categoria ativa. <Link to="/admin/categorias">Cadastrar categoria</Link>
              </span>
            )}
          </div>
        );
      })}

      {!somentePrincipal && ids.length < MAXIMO_CATEGORIAS && (
        <button
          type="button"
          className="link-caps destinos-produto__adicionar"
          onClick={() => onMudar({ ...valor, categoriasIds: [...ids, ''] })}
        >
          Adicionar outra categoria
        </button>
      )}
      {erro && (
        <p className="campo__erro t-body-sm" role="alert">
          {erro}
        </p>
      )}
    </fieldset>
  );
}
