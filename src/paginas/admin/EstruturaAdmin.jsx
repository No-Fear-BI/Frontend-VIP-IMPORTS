import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  IconeAjustes,
  IconeBalao,
  IconeBrilho,
  IconeCadeado,
  IconeCaixa,
  IconeCamadas,
  IconeCartao,
  IconeEtiqueta,
  IconeGota,
  IconeGrade,
  IconeImagem,
  IconePasta,
  IconePessoas,
  IconePrancheta,
  IconePulso,
  IconeRecibo,
  IconeWhatsApp,
} from '../../components/Icones.jsx';
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
 * item só vira link direto com o nome do GRUPO, sem submenu. `para` é o primeiro segmento depois de /admin/.
 * `icone`: o desenho ao lado de cada opção (docs/decisoes-frontend.md, seção 47).
 */
const MENU_ADMIN = [
  {
    id: 'operacao',
    rotulo: 'Operação',
    icone: IconePulso,
    itens: [
      { rotulo: 'Resumo', para: 'resumo', icone: IconeGrade },
      { rotulo: 'Revisão', para: 'revisao', icone: IconePrancheta },
      { rotulo: 'Atendimento', para: 'atendimento', icone: IconeBalao },
      { rotulo: 'Pedidos', para: 'pedidos', icone: IconeRecibo },
      { rotulo: 'Clientes', para: 'clientes', icone: IconePessoas },
    ],
  },
  {
    id: 'cadastros',
    rotulo: 'Cadastros',
    icone: IconePasta,
    itens: [
      { rotulo: 'Produtos', para: 'produtos', icone: IconeCaixa },
      { rotulo: 'Marcas', para: 'marcas', icone: IconeEtiqueta },
      { rotulo: 'Cores', para: 'cores', icone: IconeGota },
      { rotulo: 'Categorias', para: 'categorias', icone: IconeCamadas },
      { rotulo: 'Banners', para: 'banners', icone: IconeImagem },
      { rotulo: 'Destaques', para: 'destaques', icone: IconeBrilho },
    ],
  },
  {
    id: 'avulso',
    rotulo: 'Permissões de Acesso',
    icone: IconeCadeado,
    itens: [{ rotulo: 'Permissões de Acesso', para: 'permissoes' }],
  },
  {
    // Configurações da loja ligadas a serviços de fora: WhatsApp e Mercado Pago do atendimento (Burnwood).
    id: 'configuracoes',
    rotulo: 'Configurações',
    icone: IconeAjustes,
    itens: [
      // A marca do WhatsApp só aparece ao lado do texto "WhatsApp" (DESIGN.md), como aqui.
      { rotulo: 'WhatsApp', para: 'whatsapp', icone: IconeWhatsApp },
      { rotulo: 'Mercado Pago', para: 'mercadopago', icone: IconeCartao },
    ],
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
                  <grupo.icone className="admin__icone" />
                  {grupo.rotulo}
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
                <grupo.icone className="admin__icone" />
                {grupo.rotulo}
              </button>
              <ul id={`admin-submenu-${grupo.id}`} className="admin__submenu" hidden={!expandido}>
                {grupo.itens.map((item) => (
                  <li key={item.para}>
                    <NavLink to={item.para} className="admin__link t-label-caps">
                      <item.icone className="admin__icone" />
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
