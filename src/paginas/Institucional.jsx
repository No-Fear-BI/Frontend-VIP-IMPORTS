// Páginas sem dado da API: Sobre e 404. Contato tem arquivo próprio (Contato.jsx).
// Sobre: a história e a assinatura no fim são o texto da VIP Imports (26/10/2026), sem edição —
// mudança nelas vem do cliente. "Por que não tem preço" e "Como comprar" descrevem o funcionamento
// que o sistema garante (catálogo sem checkout, compra pelo WhatsApp). Não invente endereço,
// horário, ano de fundação ou garantia.

import IlustracaoSobre from '../components/IlustracaoSobre.jsx';
import SacolaErro from '../components/SacolaErro.jsx';
import Button from '../components/ui/Button.jsx';

export function Sobre() {
  return (
    <div className="container">
      <header className="topo-pagina">
        <p className="t-label-caps t-muted">A loja</p>
        <h1 className="t-headline-lg">Sobre a VIP Imports</h1>
      </header>
      <div className="sobre">
        <div className="texto-corrido secao secao--proxima">
          <p className="t-body-lg">
            A VIP Imports nasceu de uma ideia simples: trazer para nossos clientes moda diferenciada, qualidade premium e
            novidades que realmente se destacam.
          </p>
          <p>
            Criamos uma loja pensada para quem gosta de encontrar peças e produtos especiais para todas as épocas do ano.
            Do inverno ao verão, buscamos constantemente novas tendências e opções para renovar nossas coleções.
          </p>
          <p>
            Hoje, são mais de 12 mil itens disponíveis em nosso site, com coleções sempre renovadas e uma grande
            variedade de produtos para diferentes estilos e ocasiões.
          </p>
          <p>
            Cada item é cuidadosamente selecionado, organizado e catalogado, tornando a experiência de compra mais
            prática e ajudando nossos clientes a encontrarem exatamente o que procuram.
          </p>
          <p>
            A qualidade é um dos nossos maiores compromissos. Trabalhamos com uma seleção criteriosa para oferecer
            produtos com acabamento, estilo e qualidade impressionantes, mantendo o padrão premium que queremos entregar
            em cada pedido.
          </p>
          <p>
            Mais do que vender produtos, queremos proporcionar uma experiência de compra completa: novidades, variedade,
            qualidade e atendimento ágil, desde a escolha até a entrega.
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
          <div className="sobre__assinatura">
            <hr className="filete" />
            <p className="t-label-caps t-muted">VIP Imports</p>
            <p className="t-headline-md">Mais de 12 mil itens. Novas coleções. Qualidade premium.</p>
            <p className="t-body-lg">Confiança e agilidade em cada pedido.</p>
          </div>
          <div>
            <Button variante="primaria" para="/novidades">
              Ver novidades
            </Button>
          </div>
        </div>
        <IlustracaoSobre />
      </div>
    </div>
  );
}

export function NaoEncontrada() {
  return (
    <div className="container">
      <div className="estado">
        <SacolaErro className="entra" />
        <p className="t-label-caps t-muted entra" style={{ '--ordem': 1 }}>
          Página não encontrada
        </p>
        <h1 className="t-headline-lg entra" style={{ '--ordem': 2 }}>
          Esta página saiu da vitrine.
        </h1>
        <p className="estado__texto entra" style={{ '--ordem': 3 }}>
          O endereço pode ter mudado, ou a peça não está mais no catálogo.
        </p>
        <div className="lista-botoes entra" style={{ '--ordem': 4 }}>
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
