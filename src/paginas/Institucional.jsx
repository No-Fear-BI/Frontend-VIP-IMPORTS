// Páginas sem dado da API: Sobre e 404. Contato tem arquivo próprio (Contato.jsx).
// O texto da Sobre é o enviado pela VIP Imports (16/10/2026), dividido em blocos. Mudança de
// palavra no texto vem do cliente — não reescreva nem acrescente endereço, horário, ano de
// fundação ou garantia que ele não tenha mandado.

import Button from '../components/ui/Button.jsx';

export function Sobre() {
  return (
    <div className="container">
      <header className="topo-pagina">
        <p className="t-label-caps t-muted">A loja</p>
        <h1 className="t-headline-lg">Sobre a VIP Imports</h1>
        <p className="t-body-lg">Mais de 12 mil itens. Novas coleções. Qualidade premium.</p>
      </header>
      <div className="texto-corrido secao secao--proxima">
        <h2 className="t-headline-md">Nossa história</h2>
        <p>
          A VIP Imports nasceu de uma ideia simples: trazer para nossos clientes moda diferenciada, qualidade premium e
          novidades que realmente se destacam.
        </p>
        <p>
          Criamos uma loja pensada para quem gosta de encontrar peças e produtos especiais para todas as épocas do ano.
          Do inverno ao verão, buscamos constantemente novas tendências e opções para renovar nossas coleções.
        </p>

        <h2 className="t-headline-md">Nosso catálogo</h2>
        <p>
          Hoje, são mais de 12 mil itens disponíveis em nosso site, com coleções sempre renovadas e uma grande variedade
          de produtos para diferentes estilos e ocasiões.
        </p>
        <p>
          Cada item é cuidadosamente selecionado, organizado e catalogado, tornando a experiência de compra mais prática
          e ajudando nossos clientes a encontrarem exatamente o que procuram.
        </p>

        <h2 className="t-headline-md">Nosso compromisso com a qualidade</h2>
        <p>
          A qualidade é um dos nossos maiores compromissos. Trabalhamos com uma seleção criteriosa para oferecer produtos
          com acabamento, estilo e qualidade impressionantes, mantendo o padrão premium que queremos entregar em cada
          pedido.
        </p>

        <h2 className="t-headline-md">Nossa experiência de compra</h2>
        <p>
          Mais do que vender produtos, queremos proporcionar uma experiência de compra completa: novidades, variedade,
          qualidade e atendimento ágil, desde a escolha até a entrega.
        </p>

        <p className="t-headline-sm secao--proxima">Confiança e agilidade em cada pedido.</p>
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
