import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import { cn } from '../../lib/cn.js';
import { useSessaoAdmin } from '../../contexto/SessaoAdmin.jsx';
import './EstruturaAdmin.css';

/*
 * Estrutura do painel administrativo, já DENTRO da rota protegida (Acesso.jsx): quando isto
 * renderiza, há sessão de admin. Separada da loja: sem cabeçalho/rodapé da loja e sem SessaoCliente.
 * Sessão do painel = cookie vip_sessao_admin (12h, não renova) — ver src/contexto/SessaoAdmin.jsx.
 */

/*
 * Menu em dois níveis, ordenado por uso: rotina diária em cima, cadastro embaixo. Grupo com um
 * item só (Avulso) vira link direto, sem submenu. `para` é o primeiro segmento depois de /admin/.
 */
const MENU_ADMIN = [
  {
    id: 'operacao',
    rotulo: 'Operação',
    itens: [
      { rotulo: 'Resumo', para: 'resumo' },
      { rotulo: 'Revisão', para: 'revisao' },
      { rotulo: 'Seleções', para: 'selecoes' },
      { rotulo: 'Clientes', para: 'clientes' },
    ],
  },
  {
    id: 'cadastros',
    rotulo: 'Cadastros',
    itens: [
      { rotulo: 'Produtos', para: 'produtos' },
      { rotulo: 'Marcas', para: 'marcas' },
      { rotulo: 'Cores', para: 'cores' },
      { rotulo: 'Categorias', para: 'categorias' },
      { rotulo: 'Banners', para: 'banners' },
      { rotulo: 'Destaques', para: 'destaques' },
    ],
  },
  {
    id: 'avulso',
    rotulo: 'Permissões de Acesso',
    itens: [{ rotulo: 'Permissões de Acesso', para: 'permissoes' }],
  },
];

function grupoDaRota(pathname) {
  const segmento = pathname.split('/')[2];
  return MENU_ADMIN.find((g) => g.itens.some((i) => i.para === segmento))?.id ?? null;
}

function MenuAdmin() {
  const { pathname } = useLocation();
  const grupoAtual = grupoDaRota(pathname);
  const [aberto, setAberto] = useState(grupoAtual);

  // Navegar (inclusive por link de dentro de uma tela) abre o grupo da tela nova.
  useEffect(() => {
    if (grupoAtual) setAberto(grupoAtual);
  }, [grupoAtual]);

  return (
    <nav aria-label="Painel">
      <ul className="admin__menu" style={{ '--admin-menu-colunas': MENU_ADMIN.length }}>
        {MENU_ADMIN.map((grupo) => {
          if (grupo.itens.length === 1) {
            const item = grupo.itens[0];
            return (
              <li key={grupo.id} className="admin__grupo">
                <NavLink to={item.para} className="admin__grupo-botao t-label-caps">
                  {item.rotulo}
                </NavLink>
              </li>
            );
          }
          const expandido = aberto === grupo.id;
          return (
            <li key={grupo.id} className="admin__grupo">
              <button
                type="button"
                className={cn(
                  'admin__grupo-botao t-label-caps',
                  grupoAtual === grupo.id && 'admin__grupo-botao--atual',
                  expandido && 'admin__grupo-botao--aberto',
                )}
                aria-expanded={expandido}
                aria-controls={`admin-submenu-${grupo.id}`}
                onClick={() => setAberto(expandido ? null : grupo.id)}
              >
                {grupo.rotulo}
              </button>
              <ul id={`admin-submenu-${grupo.id}`} className="admin__submenu" hidden={!expandido}>
                {grupo.itens.map((item) => (
                  <li key={item.para}>
                    <NavLink to={item.para} className="admin__link t-label-caps">
                      {item.rotulo}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function EstruturaAdmin() {
  return (
    <div className="admin">
      <aside className="admin__lateral faixa-primaria">
        <Link to="/" className="admin__logo" aria-label="Ir para a loja">
          <Logo tom="creme" />
        </Link>
        <MenuAdmin />
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
export function PaginaAdminVazia({ titulo }) {
  return (
    <section className="admin__pagina">
      <h1 className="t-headline-lg">{titulo}</h1>
      <p className="t-body-sm t-muted">Página ainda não construída.</p>
    </section>
  );
}
