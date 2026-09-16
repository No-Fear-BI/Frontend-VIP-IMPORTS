import './SeletorVariacoes.css';

/**
 * Dois grupos independentes, "Tamanho" e "Cor". Nenhum é obrigatório para comprar:
 * sem escolha, o atendimento confirma na conversa.
 * Valor controlado: { variacaoTamanhoId, variacaoCorId }, cada um id ou null.
 */
export default function SeletorVariacoes({ variacoes, valor, onMudar, idBase = 'var' }) {
  const tamanhos = variacoes.filter((v) => v.tipo === 'tamanho');
  const cores = variacoes.filter((v) => v.tipo === 'cor');
  if (tamanhos.length === 0 && cores.length === 0) return null;

  return (
    <div className="seletor-variacoes">
      {tamanhos.length > 0 && (
        <Grupo
          id={`${idBase}-tamanho`}
          titulo="Tamanho"
          opcoes={tamanhos}
          selecionado={valor.variacaoTamanhoId}
          onEscolher={(id) => onMudar({ ...valor, variacaoTamanhoId: id })}
        />
      )}
      {cores.length > 0 && (
        <Grupo
          id={`${idBase}-cor`}
          titulo="Cor"
          opcoes={cores}
          selecionado={valor.variacaoCorId}
          onEscolher={(id) => onMudar({ ...valor, variacaoCorId: id })}
          largo
        />
      )}
      <p className="t-body-sm t-muted">Não sabe o tamanho ou a cor? Pode seguir sem escolher: o atendimento confirma com você.</p>
    </div>
  );
}

function Grupo({ id, titulo, opcoes, selecionado, onEscolher, largo }) {
  const escolhida = opcoes.find((o) => o.id === selecionado);
  return (
    <fieldset className="seletor-variacoes__grupo">
      <legend id={id} className="t-label-caps">
        {titulo}
        {escolhida && <span className="t-muted seletor-variacoes__escolhida"> · {escolhida.valor}</span>}
      </legend>
      <div className="seletor-variacoes__opcoes" role="radiogroup" aria-labelledby={id}>
        {opcoes.map((opcao) => {
          const ativa = opcao.id === selecionado;
          return (
            <button
              key={opcao.id}
              type="button"
              role="radio"
              aria-checked={ativa}
              aria-disabled={!opcao.disponivel}
              title={opcao.disponivel ? undefined : 'Indisponível no momento'}
              className={`seletor-variacao t-codigo ${largo ? 'seletor-variacao--largo' : ''} ${ativa ? 'seletor-variacao--ativo' : ''}`}
              onClick={() => {
                if (!opcao.disponivel) return;
                onEscolher(ativa ? null : opcao.id);
              }}
            >
              {opcao.valor}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
