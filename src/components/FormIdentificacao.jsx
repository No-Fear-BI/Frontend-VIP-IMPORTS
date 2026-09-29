import { useState } from 'react';
import { ErroApi } from '../lib/apiClient.js';
import { useSessaoCliente } from '../contexto/SessaoCliente.jsx';
import Field, { ErroGeral } from './ui/Field.jsx';
import Button from './ui/Button.jsx';

/**
 * Identificação por e-mail, sem senha. POST /clientes/identificar responde 200 para conta
 * nova E existente: esta tela nunca diz "bem-vindo de volta" nem "conta criada".
 */
export default function FormIdentificacao({
  onIdentificado,
  rotuloBotao = 'Continuar',
  idBase = 'identificacao',
  placeholder,
  largo = true,
}) {
  const { identificar } = useSessaoCliente();
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const cliente = await identificar(email);
      onIdentificado?.(cliente);
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha : new ErroApi({ mensagem: 'Não foi possível continuar agora.' }));
    } finally {
      setEnviando(false);
    }
  }

  const erroDoCampo = erro?.campos?.email;

  return (
    <form className="form-identificacao" onSubmit={enviar} noValidate>
      <Field
        id={`${idBase}-email`}
        rotulo="Seu e-mail"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder={placeholder}
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        erro={erroDoCampo}
      />
      {erro && !erroDoCampo && <ErroGeral>{erro.mensagem}</ErroGeral>}
      <Button variante="primaria" largo={largo} type="submit" disabled={enviando || !email.trim()}>
        {enviando ? 'Um instante…' : rotuloBotao}
      </Button>
    </form>
  );
}
