// Páginas sem dado da API: Sobre, Contato e 404.
// TEXTO PROVISÓRIO: descreve só o funcionamento que o sistema já garante (catálogo sem
// checkout, compra pelo WhatsApp). A história e os dados da loja precisam vir da VIP Imports
// — não invente endereço, horário, ano de fundação ou garantia.

import { Link } from 'react-router-dom';
import { IconeWhatsApp } from '../components/Icones.jsx';
import { LINK_INSTAGRAM, LINK_WHATSAPP_CONTATO } from '../config.js';
import Button from '../components/ui/Button.jsx';

export function Sobre() {
  return (
    <div className="container">
      <header className="topo-pagina">
        <p className="t-label-caps t-muted">A loja</p>
        <h1 className="t-headline-lg">Sobre a VIP Imports</h1>
      </header>
      <div className="texto-corrido secao secao--proxima">
        <p className="t-body-lg">
          A VIP Imports trabalha com roupas e acessórios de grife importados. O site é a nossa vitrine: você vê as
          peças, escolhe e fala com a gente.
        </p>
        <h2 className="t-headline-md">Por que não tem preço no site</h2>
        <p>
          Cada peça importada tem valor, disponibilidade e prazo próprios. Em vez de mostrar um número que pode mudar,
          o atendimento confirma tudo com você na conversa.
        </p>
        <h2 className="t-headline-md">Como comprar</h2>
        <p>
          Em qualquer peça, toque em Comprar no WhatsApp. Na primeira vez pedimos só o seu e-mail, sem senha. O
          WhatsApp abre com a mensagem pronta, com o código, a marca e o tamanho e a cor que você escolheu.
        </p>
        <div>
          <Button variante="primaria" para="/novidades">
            Ver novidades
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Contato() {
  return (
    <div className="container">
      <header className="topo-pagina">
        <p className="t-label-caps t-muted">Atendimento</p>
        <h1 className="t-headline-lg">Contato</h1>
      </header>
      <div className="texto-corrido secao secao--proxima">
        <p className="t-body-lg">
          Para comprar, o caminho mais rápido é o botão Comprar no WhatsApp na própria peça: a mensagem já chega com
          o código certo.
        </p>
        {(LINK_WHATSAPP_CONTATO || LINK_INSTAGRAM) && (
          <ul className="lista-contato">
            {LINK_WHATSAPP_CONTATO && (
              <li>
                <p className="t-label-caps t-muted">Dúvidas gerais</p>
                <Button variante="secundaria" href={LINK_WHATSAPP_CONTATO} target="_blank" rel="noopener noreferrer">
                  <IconeWhatsApp />
                  Falar no WhatsApp
                </Button>
              </li>
            )}
            {LINK_INSTAGRAM && (
              <li>
                <p className="t-label-caps t-muted">Novidades e bastidores</p>
                <a href={LINK_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="link-caps">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        )}
        <div>
          <Link to="/novidades" className="link-caps">
            Ver as peças que chegaram
          </Link>
        </div>
      </div>
    </div>
  );
}

export function NaoEncontrada() {
  return (
    <div className="container">
      <div className="estado">
        <p className="t-label-caps t-muted">Página não encontrada</p>
        <h1 className="t-headline-lg">Esta página saiu da vitrine.</h1>
        <p className="estado__texto">O endereço pode ter mudado, ou a peça não está mais no catálogo.</p>
        <div className="lista-botoes">
          <Button variante="primaria" para="/novidades">
            Ver novidades
          </Button>
          <Button variante="secundaria" para="/">
            Ir para o início
          </Button>
        </div>
      </div>
    </div>
  );
}
