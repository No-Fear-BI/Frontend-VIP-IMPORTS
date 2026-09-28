import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import { EstadoErro, Esqueleto } from '../../components/Estados.jsx';
import { useSessaoAdmin } from '../../contexto/SessaoAdmin.jsx';
import './Acesso.css';

/*
 * Porta do painel: tudo o que aparece ANTES de haver sessão de admin — login, "esta área é
 * da equipe" (403) e a verificação da sessão. Fica fora da EstruturaAdmin: sem menu lateral
 * enquanto ninguém entrou.
 */

export function EstruturaAcesso({ children }) {
  return (
    <main className="acesso">
      <div className="acesso__caixa">
        <Logo tom="verde" />
        {children}
      </div>
    </main>
  );
}

export function VerificandoSessao() {
  return (
    <EstruturaAcesso>
      <div className="estado-carregando" aria-busy="true" aria-label="Verificando o acesso ao painel">
        <Esqueleto className="esqueleto--titulo" />
        <Esqueleto className="esqueleto--controle" />
        <Esqueleto className="esqueleto--controle" />
      </div>
    </EstruturaAcesso>
  );
}

/**
 * Envolve toda rota /admin/* menos /admin/login. Sem sessão (401) e sessão de CLIENTE (403)
 * caem no mesmo lugar: o login, guardando de onde veio. A tela "área restrita à equipe"
 * existia para o caso do cliente, mas a equipe da loja navega identificada como cliente o
 * tempo todo e batia nela para entrar no painel — o formulário se explica sozinho.
 */
export default function RotaAdminProtegida() {
  const { situacao, erro, verificar } = useSessaoAdmin();
  const local = useLocation();

  if (situacao === 'verificando') return <VerificandoSessao />;
  if (situacao === 'dentro') return <Outlet />;
  if (situacao === 'erro') {
    return (
      <EstruturaAcesso>
        <EstadoErro erro={erro} titulo="Não conseguimos abrir o painel." onTentar={verificar} />
      </EstruturaAcesso>
    );
  }
  return <Navigate to="/admin/login" replace state={{ de: local.pathname + local.search }} />;
}
