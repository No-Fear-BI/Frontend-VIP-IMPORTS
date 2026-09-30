import { Link } from 'react-router-dom';
import { MarcaObrigatorio } from '../../components/ui/Field.jsx';
import './DestinosProduto.css';

export const destinosCompletos = (valor) =>
  Object.keys(valor).length > 0 && Object.values(valor).every((id) => Number(id) > 0);

export function destinosDosIds(ids, categorias) {
  return Object.fromEntries(ids.flatMap((id) => {
    const categoria = categorias.find((c) => c.id === id);
    return categoria ? [[String(categoria.colecaoId), String(id)]] : [];
  }));
}

export default function DestinosProduto({ id, colecoes, categorias, valor, onMudar, disabled, erro, obrigatorio }) {
  function marcar(colecaoId, marcada) {
    const novo = { ...valor };
    if (marcada) novo[colecaoId] = '';
    else delete novo[colecaoId];
    onMudar(novo);
  }
  return (
    <fieldset className="destinos-produto" disabled={disabled} aria-describedby={`${id}-ajuda`}>
      <legend className="t-label-caps">Coleções e categorias{obrigatorio && <MarcaObrigatorio />}</legend>
      <p id={`${id}-ajuda`} className="t-body-sm t-muted">Marque Feminino, Masculino ou ambos e escolha uma categoria para cada coleção.</p>
      {colecoes.length === 0 && <p className="t-body-sm">Nenhuma coleção disponível.</p>}
      {colecoes.map((colecao) => {
        const marcada = Object.hasOwn(valor, String(colecao.id));
        const opcoes = categorias.filter((c) => c.colecaoId === colecao.id && (c.ativa || String(c.id) === valor[colecao.id]));
        const rotulo = colecao.slug === 'feminino' ? 'Feminino' : colecao.slug === 'masculino' ? 'Masculino' : colecao.nome;
        return (
          <div key={colecao.id} className="destinos-produto__colecao">
            <label className="destinos-produto__opcao">
              <input type="checkbox" checked={marcada} onChange={(e) => marcar(colecao.id, e.target.checked)} />
              <span>{rotulo}</span>
            </label>
            {marcada && <label className="campo" htmlFor={`${id}-${colecao.id}`}>
              <span className="t-label-caps">Categoria — {rotulo}{obrigatorio && <MarcaObrigatorio />}</span>
              <select id={`${id}-${colecao.id}`} className="campo__input" value={valor[colecao.id]} required
                onChange={(e) => onMudar({ ...valor, [colecao.id]: e.target.value })}>
                <option value="">Escolha a categoria</option>
                {opcoes.map((c) => <option key={c.id} value={String(c.id)} disabled={!c.ativa}>{c.nome}{!c.ativa ? ' (inativa)' : ''}</option>)}
              </select>
              {opcoes.length === 0 && <span className="t-body-sm">Nenhuma categoria ativa. <Link to="/admin/categorias">Cadastrar categoria</Link></span>}
            </label>}
          </div>
        );
      })}
      {erro && <p className="campo__erro t-body-sm" role="alert">{erro}</p>}
    </fieldset>
  );
}
