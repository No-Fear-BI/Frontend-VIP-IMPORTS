import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSessaoCliente } from '../contexto/SessaoCliente.jsx';
import Modal from './ui/Modal.jsx';
import { IconeBusca, IconeFechar, IconeMenu, IconePessoa, IconeSacola } from './Icones.jsx';
import Logo from './Logo.jsx';
import './Cabecalho.css';

// Os 8 itens de menu da referência (CLAUDE.md), nesta ordem.
export const MENU = [
  { rotulo: 'Início', para: '/' },
  { rotulo: 'Feminino', para: '/feminino' },
  { rotulo: 'Masculino', para: '/masculino' },
  { rotulo: 'Categorias', para: '/categorias' },
  { rotulo: 'Marcas', para: '/marcas' },
  { rotulo: 'Novidades', para: '/novidades' },
  { rotulo: 'Sobre', para: '/sobre' },
  { rotulo: 'Contato', para: '/contato' },
];

export default function Cabecalho() {
  const { itens, verificando } = useSessaoCliente();
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const local = useLocation();

  useEffect(() => {
    setMenuAberto(false);
    setBuscaAberta(false);
  }, [local.pathname, local.search]);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 8);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  const total = itens.length;

  // Pulo do selo só quando o número SOBE (uma peça entrou), não ao carregar nem ao tirar peça.
  const totalAnterior = useRef(total);
  const [pulando, setPulando] = useState(false);
  useEffect(() => {
    // Enquanto a sessão está sendo verificada, a seleção só está chegando do servidor.
    if (!verificando && total > totalAnterior.current) setPulando(true);
    totalAnterior.current = total;
  }, [total, verificando]);

  return (
    <>
      <div className="barra-aviso faixa-primaria">
        <p className="container t-label-caps-sm">Roupas e acessórios de grife importados · valor e disponibilidade pelo atendimento</p>
      </div>
      <header className={`cabecalho ${rolou ? 'cabecalho--rolou' : ''}`}>
        <div className="container cabecalho__topo">
          <button
            type="button"
            className="cabecalho__icone cabecalho__menu"
            aria-label="Abrir menu"
            onClick={() => setMenuAberto(true)}
          >
            <IconeMenu />
          </button>

          <Link to="/" className="cabecalho__logo" aria-label="VIP Imports, página inicial">
            <Logo />
          </Link>

          <nav className="cabecalho__nav" aria-label="Principal">
            <ul>
              {MENU.map((item) => (
                <li key={item.para}>
                  <NavLink to={item.para} end={item.para === '/'} className="cabecalho__link t-label-caps">
                    {item.rotulo}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="cabecalho__acoes">
            <button
              type="button"
              className="cabecalho__icone"
              aria-label="Buscar"
              aria-expanded={buscaAberta}
              onClick={() => setBuscaAberta((v) => !v)}
            >
              {buscaAberta ? <IconeFechar /> : <IconeBusca />}
            </button>
            <Link to="/conta" className="cabecalho__icone" aria-label="Minha conta">
              <IconePessoa />
            </Link>
            <Link
              to="/selecao"
              className="cabecalho__icone cabecalho__selecao"
              aria-label={total ? `Minha seleção, ${total} ${total === 1 ? 'peça' : 'peças'}` : 'Minha seleção'}
            >
              <IconeSacola />
              {total > 0 && (
                <span
                  className={`selo-contagem ${pulando ? 'selo-contagem--pulando' : ''}`}
                  onAnimationEnd={() => setPulando(false)}
                >
                  {total}
                </span>
              )}
            </Link>
          </div>
        </div>
        {buscaAberta && <BarraBusca onFechar={() => setBuscaAberta(false)} />}
      </header>

      <Modal aberto={menuAberto} onFechar={() => setMenuAberto(false)} titulo="Menu" lateral>
        <nav aria-label="Principal (celular)" className="menu-celular">
          <Logo className="menu-celular__logo" />
          <ul>
            {MENU.map((item) => (
              <li key={item.para}>
                <NavLink to={item.para} end={item.para === '/'} className="menu-celular__link t-headline-sm">
                  {item.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
          <hr className="filete" />
          <Link to="/conta" className="link-caps">
            Minha conta
          </Link>
          <Link to="/selecao" className="link-caps">
            Minha seleção{total > 0 ? ` (${total})` : ''}
          </Link>
        </nav>
      </Modal>
    </>
  );
}

function BarraBusca({ onFechar }) {
  const navegar = useNavigate();
  const [termo, setTermo] = useState('');
  const campo = useRef(null);

  useEffect(() => {
    campo.current?.focus();
  }, []);

  return (
    <div className="barra-busca">
      <form
        className="container barra-busca__form"
        role="search"
        onSubmit={(evento) => {
          evento.preventDefault();
          if (!termo.trim()) return;
          navegar(`/produtos?busca=${encodeURIComponent(termo.trim())}`);
          onFechar();
        }}
      >
        <label htmlFor="busca-cabecalho" className="visualmente-oculto">
          Buscar por peça, marca ou código
        </label>
        <IconeBusca className="barra-busca__icone" />
        <input
          id="busca-cabecalho"
          ref={campo}
          type="search"
          className="barra-busca__campo t-headline-sm"
          placeholder="Peça, marca ou código"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onFechar()}
        />
        <button type="submit" className="link-caps">
          Buscar
        </button>
      </form>
    </div>
  );
}
