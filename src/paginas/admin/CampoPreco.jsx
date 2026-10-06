import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';
import { formatarCentavos, lerPreco } from '../../lib/preco.js';

/*
 * "Preço (R$)" do painel: opcional, só para consulta da equipe (nunca aparece na loja). Aceita
 * "1.234,50"; ao sair do campo reescreve no formato certo. `valor` é o texto da tela; quem usa
 * confere com `lerPreco(valor)` antes de enviar e manda `precoCentavos`. `erro` é o do servidor
 * (`campos.precoCentavos`); o de digitação aparece depois que a pessoa sai do campo.
 */
export default function CampoPreco({ id, valor, onMudar, erro, disabled = false }) {
  const [tocado, setTocado] = useState(false);
  const { erro: erroDigitacao } = lerPreco(valor);

  function aoSair() {
    setTocado(true);
    const { centavos, erro: invalido } = lerPreco(valor);
    if (!invalido && centavos !== null) onMudar(formatarCentavos(centavos));
  }

  return (
    <Field
      id={id}
      rotulo="Preço (R$)"
      ajuda="Opcional. Só para consulta da equipe: não aparece na loja."
      inputMode="decimal"
      autoComplete="off"
      placeholder="0,00"
      value={valor}
      onChange={(e) => onMudar(e.target.value)}
      onBlur={aoSair}
      erro={erro || (tocado ? erroDigitacao : undefined)}
      disabled={disabled}
    />
  );
}
