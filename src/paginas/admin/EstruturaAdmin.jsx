import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import { useSessaoAdmin } from '../../contexto/SessaoAdmin.jsx';
import './EstruturaAdmin.css';

/*
 * Estrutura do painel administrativo, já DENTRO da rota protegida (Acesso.jsx): quando isto
 * renderiza, há sessão de admin. Separada da loja: sem cabeçalho/rodapé da loja e sem SessaoCliente.
 * Sessão do painel = cookie vip_sessao_admin (12h, não renova) — ver src/contexto/SessaoAdmin.jsx.
 */

const MENU_ADMIN = [
  { rotulo: 'Resumo', para: 'resumo' },
  { rotulo: 'Produtos', para: 'produtos' },
  { rotulo: 'Marcas', para: 'marcas' },
  { rotulo: 'Cores', para: 'cores' },
  { rotulo: 'Categorias', para: 'categorias' },
  { rotulo: 'Banners', para: 'banners' },
  { rotulo: 'Destaques', para: 'destaques' },
  { rotulo: 'Seleções', para: 'selecoes' },
  { rotulo: 'Clientes', para: 'clientes' },
];

export default function EstruturaAdmin() {
  return (
    <div className="admin">
      <aside className="admin__lateral faixa-primaria">
        <Logo tom="creme" />
        <nav aria-label="Painel">
          <ul className="admin__menu">
            {MENU_ADMIN.map((item) => (
              <li key={item.para}>
                <NavLink to={item.para} className="admin__link t-label-caps">
                  {item.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <SessaoNaLateral />
      </aside>
      <main className="admin__conteudo">
        <Outlet />
      </main>
    </div>
  );
}

const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

function SessaoNaLateral() {
  const { admin, sair } = useSessaoAdmin();
  const navegar = useNavigate();
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState(null);

  async function aoSair() {
    setSaindo(true);
    setErro(null);
    try {
      await sair();
      navegar('/admin/login', { replace: true });
    } catch (falha) {
      // Sem confirmação do backend, a sessão pode continuar valendo: não finge que saiu.
      setErro(falha.mensagem);
      setSaindo(false);
    }
  }

  return (
    <div className="admin__sessao">
      <p className="t-body-sm">{admin?.nome}</p>
      {admin?.ultimoLoginEm && (
        <p className="t-label-caps-sm admin__sessao-detalhe">
          Sessão iniciada às {formatoHora.format(new Date(admin.ultimoLoginEm))}
        </p>
      )}
      <Button variante="contorno-sobre-primaria" onClick={aoSair} disabled={saindo}>
        {saindo ? 'Saindo…' : 'Sair'}
      </Button>
      {erro && (
        <p className="t-body-sm admin__sessao-detalhe" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

/** Conteúdo provisório das páginas do painel enquanto cada uma não é construída. */
export function PaginaAdminVazia({ titulo, rota }) {
  return (
    <section className="admin__pagina">
      <p className="t-label-caps-sm t-muted">{rota}</p>
      <h1 className="t-headline-lg">{titulo}</h1>
      <p className="t-body-sm t-muted">Página ainda não construída.</p>
    </section>
  );
}
