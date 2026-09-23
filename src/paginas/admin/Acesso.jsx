import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import { EstadoErro, Esqueleto } from '../../components/Estados.jsx';
import Button from '../../components/ui/Button.jsx';
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
 * Envolve toda rota /admin/* menos /admin/login. Sem sessão (401) → login, guardando de onde
 * veio. Sessão de CLIENTE (403) → mensagem própria, sem mandar para o login: essa conta não
 * tem senha de admin (docs/para-o-frontend.md).
 */
export default function RotaAdminProtegida() {
  const { situacao, erro, verificar } = useSessaoAdmin();
  const local = useLocation();

  if (situacao === 'verificando') return <VerificandoSessao />;
  if (situacao === 'dentro') return <Outlet />;
  if (situacao === 'cliente') return <AreaDaEquipe mensagem={erro?.mensagem} />;
  if (situacao === 'erro') {
    return (
      <EstruturaAcesso>
        <EstadoErro erro={erro} titulo="Não conseguimos abrir o painel." onTentar={verificar} />
      </EstruturaAcesso>
    );
  }
  return <Navigate to="/admin/login" replace state={{ de: local.pathname + local.search }} />;
}

function AreaDaEquipe({ mensagem }) {
  return (
    <EstruturaAcesso>
      <section className="acesso__bloco" role="alert">
        <p className="t-label-caps-sm t-muted">Painel da loja</p>
        <h1 className="t-headline-md">{mensagem || 'Esta área é restrita à equipe da loja.'}</h1>
        <p className="t-body-sm t-muted">
          Este navegador está identificado como cliente da loja. O painel tem um acesso separado,
          com senha própria da equipe.
        </p>
        <div className="acesso__acoes">
          <Button para="/">Voltar para a loja</Button>
          <Button variante="texto" para="/admin/login">
            <span>Sou da equipe: entrar no painel</span>
          </Button>
        </div>
      </section>
    </EstruturaAcesso>
  );
}
