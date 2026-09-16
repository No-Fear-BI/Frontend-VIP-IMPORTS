import { Link } from 'react-router-dom';
import { LINK_INSTAGRAM, LINK_WHATSAPP_CONTATO } from '../config.js';
import { IconeWhatsApp } from './Icones.jsx';
import Logo from './Logo.jsx';
import './Rodape.css';

export default function Rodape() {
  return (
    <footer className="rodape faixa-primaria">
      <div className="container rodape__grade">
        <div className="rodape__marca">
          <Logo tom="creme" />
          <p className="t-body-sm t-muted rodape__texto">
            Roupas e acessórios de grife importados. Você escolhe a peça no site e fecha a compra com o atendimento
            pelo WhatsApp.
          </p>
        </div>

        <nav className="rodape__coluna" aria-label="Coleções">
          <h2 className="t-label-caps t-muted">Coleções</h2>
          <ul>
            <li><Link to="/feminino">Coleção Feminina</Link></li>
            <li><Link to="/masculino">Coleção Masculina</Link></li>
            <li><Link to="/novidades">Novidades</Link></li>
          </ul>
        </nav>

        <nav className="rodape__coluna" aria-label="Navegação">
          <h2 className="t-label-caps t-muted">Navegação</h2>
          <ul>
            <li><Link to="/categorias">Categorias</Link></li>
            <li><Link to="/marcas">Marcas</Link></li>
            <li><Link to="/sobre">Sobre</Link></li>
            <li><Link to="/contato">Contato</Link></li>
            <li><Link to="/conta">Minha conta</Link></li>
          </ul>
        </nav>

        <div className="rodape__coluna">
          <h2 className="t-label-caps t-muted">Contato</h2>
          <ul>
            {LINK_WHATSAPP_CONTATO && (
              <li>
                <a href={LINK_WHATSAPP_CONTATO} target="_blank" rel="noopener noreferrer" className="rodape__whats">
                  <IconeWhatsApp /> WhatsApp
                </a>
              </li>
            )}
            {LINK_INSTAGRAM && (
              <li>
                <a href={LINK_INSTAGRAM} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            )}
            <li><Link to="/contato">Todas as formas de contato</Link></li>
          </ul>
        </div>
      </div>
      <div className="container">
        <hr className="filete" />
        <p className="t-label-caps-sm t-muted rodape__legal">© {new Date().getFullYear()} VIP Imports</p>
      </div>
    </footer>
  );
}
