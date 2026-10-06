import Field from '../../components/ui/Field.jsx';

export const quantidadeValida = (valor) => valor === '' || (/^\d+$/.test(String(valor)) && Number(valor) <= 2147483647);
export const quantidadeParaApi = (valor) => valor === '' ? null : Number(valor);

export default function CampoQuantidade({ id, valor, onMudar, erro, disabled }) {
  return <Field id={id} rotulo="Quantidade disponível" type="number" inputMode="numeric"
    min={0} max={2147483647} step={1} value={valor} disabled={disabled}
    ajuda="Total de unidades deste produto. Deixe vazio se ainda não souber a quantidade."
    onChange={(evento) => onMudar(evento.target.value)}
    erro={erro || (!quantidadeValida(valor) ? 'Informe um número inteiro maior ou igual a zero.' : undefined)} />;
}
