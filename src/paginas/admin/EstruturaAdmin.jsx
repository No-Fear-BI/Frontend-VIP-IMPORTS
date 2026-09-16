import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import './EstruturaAdmin.css';

/*
 * Estrutura do painel administrativo — ESQUELETO do Dia 0 (a Trilha B preenche).
 * Separada da loja: sem cabeçalho/rodapé da loja e sem SessaoCliente.
 * Sessão do painel = cookie vip_sessao_admin (12h, não renova). Em rota /admin/*:
 * 401 = a sessão acabou → login; 403 = a sessão aberta é de CLIENTE, não de admin (mensagem própria).
 * Falta: contexto de sessão do admin (GET /admin/eu), rota protegida e o service do painel.
 */

const MENU_ADMIN = [
  { rotulo: 'Resumo', para: 'resumo' },
  { rotulo: 'Produtos', para: 'produtos' },
  { rotulo: 'Marcas', para: 'marcas' },
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
      </aside>
      <main className="admin__conteudo">
        <Outlet />
      </main>
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
