// Páginas sem dado da API: Sobre e 404. Contato tem arquivo próprio (Contato.jsx).
// TEXTO PROVISÓRIO: descreve só o funcionamento que o sistema já garante (catálogo sem
// checkout, compra pelo WhatsApp). A história e os dados da loja precisam vir da VIP Imports
// — não invente endereço, horário, ano de fundação ou garantia.

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
          Em qualquer peça, toque em Consultar valores no WhatsApp. Na primeira vez pedimos só o seu e-mail, sem
          senha. O
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

export function NaoEncontrada() {
  return (
    <div className="container">
      <div className="estado">
        <p className="t-label-caps t-muted entra">Página não encontrada</p>
        <h1 className="t-headline-lg entra" style={{ '--ordem': 1 }}>
          Esta página saiu da vitrine.
        </h1>
        <p className="estado__texto entra" style={{ '--ordem': 2 }}>
          O endereço pode ter mudado, ou a peça não está mais no catálogo.
        </p>
        <div className="lista-botoes entra" style={{ '--ordem': 3 }}>
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
