import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Field, { ErroGeral } from '../../components/ui/Field.jsx';
import { entrarAdmin } from '../../services/adminService.js';

export default function AdminLogin() {
  const navegar = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);
  async function enviar(evento) {
    evento.preventDefault(); setErro(''); setEntrando(true);
    try { await entrarAdmin(email, senha); navegar('/admin/revisao', { replace: true }); }
    catch (falha) { setErro(falha.mensagem || 'Não foi possível entrar no painel.'); }
    finally { setEntrando(false); }
  }
  return <section className="admin__pagina"><p className="t-label-caps-sm t-muted">/admin/login</p><h1 className="t-headline-lg">Entrar no painel</h1><form className="admin__formulario" onSubmit={enviar}><Field id="admin-email" rotulo="E-mail" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /><Field id="admin-senha" rotulo="Senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />{erro && <ErroGeral>{erro}</ErroGeral>}<Button type="submit" disabled={entrando}>{entrando ? 'Entrando…' : 'Entrar'}</Button></form></section>;
}
