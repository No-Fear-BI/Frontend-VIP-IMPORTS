import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import { useSessaoAdmin } from '../../contexto/SessaoAdmin.jsx';
import { EstruturaAcesso, VerificandoSessao } from './Acesso.jsx';

/*
 * Login do painel — POST /admin/sessao.
 * 401 CREDENCIAIS_INVALIDAS é a MESMA resposta para e-mail inexistente, senha errada e conta
 * desativada, de propósito: a tela mostra uma frase só e não tenta distinguir os três.
 * 429 EXCESSO_TENTATIVAS (5 por minuto por IP) usa a mensagem do backend.
 */

const DESTINO_PADRAO = '/admin/resumo';
const MENSAGEM_CREDENCIAIS = 'E-mail ou senha inválidos.';

export default function AdminLogin() {
  const { situacao, entrar, avisoLogin } = useSessaoAdmin();
  const navegar = useNavigate();
  const local = useLocation();
  const destino = local.state?.de || DESTINO_PADRAO;

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (situacao === 'verificando') return <VerificandoSessao />;
  if (situacao === 'dentro' && !enviando) return <Navigate to={destino} replace />;

  async function enviar(evento) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      navegar(destino, { replace: true });
    } catch (falha) {
      setErro(falha);
      setEnviando(false);
    }
  }

  const campos = erro?.campos || {};
  const mensagemGeral =
    erro && (erro.codigo === 'CREDENCIAIS_INVALIDAS' ? MENSAGEM_CREDENCIAIS : !campos.email && !campos.senha && erro.mensagem);

  return (
    <EstruturaAcesso>
      <form className="acesso__formulario" onSubmit={enviar} noValidate>
        <header className="acesso__cabecalho">
          <p className="t-label-caps-sm t-muted">Área administrativa</p>
          <h1 className="t-headline-md">Entrar</h1>
        </header>

        {avisoLogin && !erro && <ErroGeral>{avisoLogin}</ErroGeral>}

        <Field
          id="admin-email"
          rotulo="E-mail"
          type="email"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          erro={campos.email}
          required
        />
        <Field
          id="admin-senha"
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={campos.senha}
          required
        />

        {mensagemGeral && <ErroGeral>{mensagemGeral}</ErroGeral>}

        <Button type="submit" largo disabled={enviando || !email.trim() || !senha}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </EstruturaAcesso>
  );
}
