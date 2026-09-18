---
version: alpha
name: VIP Imports — Vitrine Reservada
description: Loja em catálogo de roupas e acessórios de grife importados. Sem checkout; toda compra termina numa conversa de WhatsApp com o atendimento.

colors:
  primary: "#28361F"
  primary-hover: "#414C31"
  on-primary: "#FCEAB3"
  on-primary-muted: "#C1B88A"
  rule-on-primary: "#4A5337"
  secondary: "#FCEAB3"
  surface: "#FEFAEE"
  vitrine: "#FFFFFF"
  on-surface: "#28361F"
  on-surface-muted: "#606955"
  border: "#D3D3C5"
  border-strong: "#79806E"
  error: "#28361F"

typography:
  display:
    fontFamily: Bodoni Moda
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 44px
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Bodoni Moda
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.2
  body-lg:
    fontFamily: Jost
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Jost
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Jost
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-caps:
    fontFamily: Jost
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.16em
    fontFeature: "'case' 1"
  label-caps-sm:
    fontFamily: Jost
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0.14em
    fontFeature: "'case' 1"
  button:
    fontFamily: Jost
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.12em
    fontFeature: "'case' 1"
  codigo:
    fontFamily: Jost
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0.08em
    fontFeature: "'tnum' 1, 'case' 1"

rounded:
  none: 0px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  3xl: 104px
  gutter: 24px
  margin: 48px
  margin-mobile: 20px
  measure: 64ch
  container: 1320px

components:
  page:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
  vitrine-foto:
    backgroundColor: "{colors.vitrine}"
    textColor: "{colors.on-surface-muted}"
    rounded: "{rounded.none}"
  text-meta:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-caps-sm}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  divider-strong:
    backgroundColor: "{colors.border-strong}"
    height: 1px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: 18px
    height: 52px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: 18px
    height: 52px
  button-on-dark:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: 18px
    height: 52px
  link-caps:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
  etiqueta:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    typography: "{typography.codigo}"
    rounded: "{rounded.none}"
    padding: 6px
  faixa-verde:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.headline-lg}"
  faixa-verde-meta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary-muted}"
    typography: "{typography.label-caps}"
  faixa-verde-filete:
    backgroundColor: "{colors.rule-on-primary}"
    height: 1px
  selo-contagem:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-caps-sm}"
    rounded: "{rounded.full}"
    size: 18px
  seletor-variacao:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.codigo}"
    rounded: "{rounded.none}"
    height: 44px
  seletor-variacao-ativo:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  input:
    backgroundColor: "{colors.vitrine}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 14px
    height: 52px
  input-error:
    backgroundColor: "{colors.vitrine}"
    textColor: "{colors.error}"
    typography: "{typography.body-sm}"
  aviso:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 16px
  esqueleto:
    backgroundColor: "{colors.border}"
    rounded: "{rounded.none}"
---

# VIP Imports — Vitrine Reservada

## Overview

A VIP Imports vende peças de grife importadas sem carrinho de pagamento: o site é uma **vitrine**, e a venda acontece numa conversa individual pelo WhatsApp. Quem entra está olhando bolsa, sapato, óculos e relógio de marca, quase sempre pelo celular, muitas vezes vindo de um story do Instagram. A visita é curta e o objetivo é um só: achar a peça e chamar o atendimento.

A direção é **Editorial de moda cruzado com etiqueta de alfaiataria**. De um lado, a revista (The Gentlewoman, Apartamento, a Harper's Bazaar de Brodovitch): título serifado grande, rótulo versalete espaçado, filete fino no lugar de caixa, cor usada em faixa cheia e não em pontinhos. Do outro, a etiqueta de papel pendurada na peça: o creme do manual da marca é literalmente o "papel de etiqueta", e o código do produto (`X030`) é tratado como o número escrito nessa etiqueta, não como um dado de sistema.

A pegada de **exclusividade** vem de retenção, não de enfeite. Não há preço, não há contador de desconto nem selo de "mais vendido". Não há sombra, gradiente colorido ou canto arredondado. Cada peça tem uma moldura branca, como um objeto em vitrine, e o texto fala como atendimento de loja, não como e-commerce ("Valor confirmado pelo atendimento.", "Comprar no WhatsApp"). A sensação no primeiro segundo deve ser: *loja pequena, que atende por hora marcada*.

**O que esta direção abandona, de propósito: densidade.** A grade mostra quatro peças por linha no desktop e duas no celular, com espaço generoso entre elas. Um atacadista mostraria o dobro. A troca compra a leitura de boutique, que é o que justifica atendimento individual. Para quem já sabe o que quer, busca e filtros resolvem, sem apertar a grade.

Existe **um só modo, claro**, com faixas verdes cheias fazendo o papel de "escuro". Não há dark mode: o manual da marca define as combinações de cor prontas, e um tema escuro inteiro não é uma delas.

## Colors

**Restrição fixa: a paleta oficial tem três cores e só três** — verde `#28361F`, creme `#FCEAB3` e branco `#FFFFFF`, do manual de identidade de @mpandradecom. Não existe dourado, vermelho, cinza neutro ou qualquer quarta cor. Todo token abaixo que não é uma das três é uma **mistura aritmética** das oficiais (média ponderada em sRGB), com a proporção anotada. Nada foi escolhido no seletor de cores. É por isso que a página nunca termina com sete verdes diferentes: só existem os verdes desta lista.

- **Primary (#28361F) — Verde VIP.** A cor dominante da marca: a sacola, a fachada, o fundo do logo. É a tinta de todo texto e a cor de toda ação principal. Contraste: 12,3:1 sobre o papel, 10,7:1 sobre o creme.
- **Primary-hover (#414C31) — Verde 88% + creme 12%.** Estado de hover e pressionado da ação principal. O hover **clareia em direção ao creme** em vez de escurecer, porque não existe preto na marca para escurecer com ele. Creme sobre ele: 7,6:1.
- **Secondary / On-primary (#FCEAB3) — Creme de etiqueta.** O papel da etiqueta. Aparece em dois papéis, e só nesses dois: (1) texto e logo sobre faixa verde (a combinação "creme sobre verde" do manual); (2) fundo da **etiqueta** do código do produto e dos botões sobre fundo verde. Não é fundo de página: em área grande, o creme cheio fica amarelado e compete com as fotos.
- **Surface (#FEFAEE) — Papel.** Creme 22% + branco 78%. O fundo de toda página. É "branco com a memória do creme": quente o bastante para a página não parecer um formulário, claro o bastante para a foto do produto se destacar.
- **Vitrine (#FFFFFF) — Branco.** A moldura da foto do produto e o fundo dos campos de formulário. Branco puro vai de propósito, e só aqui: as fotos de produto importado vêm quase sempre em fundo branco, e colocá-las sobre branco faz a peça "flutuar" sem caixa (a "seção de produtos isolados sobre fundo neutro" da referência). A diferença sutil entre a vitrine branca e o papel ao redor é o único recorte da peça, sem borda nem sombra.
- **On-surface (#28361F).** O mesmo verde da primary, nomeado pelo papel de texto.
- **On-surface-muted (#606955) — Verde 74% sobre papel.** Metadado: marca em versalete sobre o título, categoria, "Valor confirmado pelo atendimento.", legendas. 5,5:1 sobre o papel, 5,75:1 sobre a vitrine e 4,8:1 sobre o creme, então pode ir em qualquer fundo claro do sistema.
- **On-primary-muted (#C1B88A) — Creme 72% sobre verde.** O metadado equivalente dentro de uma faixa verde (legenda versalete acima do título do hero, colunas do rodapé). 6,4:1 sobre o verde.
- **Rule-on-primary (#4A5337) — Creme 16% sobre verde.** Filete dentro de faixa verde.
- **Border (#D3D3C5) — Verde 20% sobre papel.** O filete de 1px que separa seções, linhas de lista e colunas do rodapé. É decorativo e estrutural, nunca a única indicação de um controle.
- **Border-strong (#79806E) — Verde 62% sobre papel.** Contorno de input, de seletor de tamanho/cor e do botão secundário. 3,9:1 sobre o papel, acima do 3:1 exigido para componente de interface.
- **Error (#28361F) — O próprio verde.** **Não existe vermelho na marca, e erro não ganha cor.** O erro é *dito*, não pintado: ícone de alerta + mensagem escrita + filete de 2px em verde no lado esquerdo do bloco ou abaixo do campo. Em vez de ser uma falha, isso é a regra de acessibilidade levada ao fim: estado nunca depende só de cor. O token existe para que nenhum agente, precisando de uma cor de erro, invente `#EF4444`.

Como a paleta não tem cor de destaque além do próprio verde, **o destaque é a inversão**: o verde cheio (faixa, botão principal) sobre um site que é quase todo papel. Por isso o verde cheio em área grande aparece em no máximo **duas faixas por página** (ex: hero e CTA final), e o botão verde cheio aparece **uma vez por bloco de conteúdo**.

## Typography

Duas famílias, divididas por função: uma dá a **voz**, a outra cuida do **aparato**.

**Bodoni Moda** — a voz: título do hero, títulos de seção, nome da categoria, o "Código X030" do cartão. É uma Didone (contraste extremo entre traço grosso e fino), a mesma família tipográfica da Didot das capas da Vogue e da Harper's Bazaar. Foi escolhida porque o wordmark "VIP" do manual já é uma serifada de alto contraste, com o traço do V afinando até virar bico, e uma serifada de UI mais calma (Garamond, Source Serif) ficaria morna ao lado do logo. A Bodoni Moda tem eixo de tamanho óptico (`opsz` 6–96): com `font-optical-sizing: auto` o traço fino engrossa sozinho nos 22px e afina nos 72px, o que resolve a fragilidade clássica da Didone em tela. Usada **só em peso 400**, com itálico 400 para ênfase dentro de título. Nunca em texto corrido, nunca abaixo de 20px. Fallback: `"Bodoni Moda", "Didot", "Bodoni 72", Georgia, serif`. Licença SIL OFL, servida pelo próprio site via `@fontsource-variable/bodoni-moda`.

**Jost** — o aparato: texto corrido, rótulos versalete, botões, campos, o código na etiqueta. É uma releitura aberta da Futura, a geométrica que a moda usa há um século (é a letra da Louis Vuitton e das campanhas da Vogue). A dupla Didone + geométrica é o par clássico de revista de moda. Esse par é escolha e não acaso porque as duas diferem por classificação (serifada de contraste × sans construída) e porque o "IMPORTS" do logo já é uma sans versalete espaçada. Pesos **400 e 600**, nada entre eles: 600 só em rótulo versalete e botão, onde o 400 fica fraco em 11–13px caixa-alta; o 700 da Jost empasta nesse tamanho. Fallback: `Jost, "Futura", "Century Gothic", "Avenir Next", sans-serif`. Licença SIL OFL, via `@fontsource-variable/jost`.

A escala usa razão **≈1,333** (quarta justa, registro editorial) a partir de 16px (16 → 22 → 30 → 44) e é quebrada à mão no topo: o display pula para 72px no desktop. No celular, display e headline-lg descem por `clamp()` (display: `clamp(40px, 8vw, 72px)`; headline-lg: `clamp(30px, 5vw, 44px)`), e esses dois limites são normativos.

Ajustes ópticos, todos normativos:
- **Espaçamento entre letras acompanha o tamanho:** −0,02em no display, −0,015em no headline-lg, 0 no corpo, **+0,16em** no `label-caps` e +0,14em no `label-caps-sm`. Versalete sem espaçamento parece erro, não ênfase.
- **Altura de linha inversa ao tamanho:** 1,02 no display, 1,6 no corpo.
- **Rótulo versalete** é sempre `text-transform: uppercase` + `font-feature-settings: 'case' 1`, para a pontuação subir para a altura das maiúsculas.
- **Código do produto** (`codigo`): Jost com algarismos tabulares (`'tnum' 1`), para `X030` e `P112` terem a mesma largura lado a lado na grade.
- **Largura de texto corrido limitada a 64ch** (`spacing.measure`): descrição do produto, página Sobre, avisos.

## Layout

Grade de **12 colunas**, gutter de 24px, margem externa de 48px no desktop e 20px no celular, container máximo de **1320px**. Tudo no **grid de 8px**, com meio passo de 4px só dentro de componentes pequenos (etiqueta, selo de contagem).

**Alinhamento à esquerda, sempre.** Título de seção, legenda, texto do hero, estado vazio: nada centralizado. O cabeçalho de seção é **assimétrico**: à esquerda, o rótulo versalete com o título serifado embaixo; à direita, alinhado à linha de base do título, o link versalete "Ver tudo →". As únicas exceções centralizadas são o nome da marca dentro do cartão de marca (é um logotipo, não um texto) e o wordmark no cabeçalho do celular.

**Ritmo de seção variado, não uniforme.** Seções que se completam ficam próximas (`spacing.xl` 40px entre destaques e os banners de coleção). Mudança de assunto ganha respiro (`spacing.3xl` 104px antes do CTA final). Faixa verde encosta nas bordas da tela (sangria total), e seção de papel respeita o container.

**Estrutura da home**, na ordem da referência (vip-imports.base44.app), que já corresponde ao que `GET /home` devolve:
1. Barra fina verde no topo (aviso de atendimento) + cabeçalho em papel com os 8 itens de menu (Início, Feminino, Masculino, Categorias, Marcas, Novidades, Sobre, Contato) e os ícones de busca, conta e seleção à direita.
2. **Hero em carrossel** (`banners`, até 4): foto cheia, texto sobre um degradê **só de verde** (verde 0% → 85% de baixo para cima, nunca preto), legenda versalete em `on-primary-muted` acima de título Bodoni em creme.
3. **Destaques** (`destaques`, até 12): grade de 4 colunas de produto isolado na vitrine branca.
4. **Duas coleções lado a lado** (Feminina / Masculina): foto cheia, degradê verde, link versalete sublinhado.
5. **Categorias em destaque** (`categoriasDestaque`, até 8): foto quadrada + nome em Bodoni + coleção em versalete `on-surface-muted`.
6. **Marcas** (`marcas`): cartões de filete fino com o nome centralizado.
7. **CTA final** em faixa verde: dois botões (ação principal em creme + "Falar no WhatsApp" em contorno creme).
8. Rodapé em verde: colunas de coleções / navegação / contato.

**Grade de produto:** 4 colunas ≥1024px, 3 entre 768 e 1023px, 2 abaixo de 768px, gutter de 24px (16px no celular). Foto em proporção **4:5**, sempre, com `object-fit: contain` sobre a vitrine branca, porque recortar uma bolsa para caber no quadro corta a peça que está sendo vendida.

## Elevation & Depth

**Não existe sombra no sistema.** Nem no cartão, nem no botão, nem no cabeçalho fixo.

A profundidade vem de três recursos:
1. **Plano tonal:** a vitrine branca sobre o papel, e o papel sobre o verde. São três planos e só três.
2. **Filete de 1px** em `border`: separa seções, linhas de lista e colunas. Divide, não cerca. O filete é o motivo gráfico tirado do próprio logo, que separa "VIP" de "IMPORTS" com uma linha fina, e por isso aparece com esse papel no cabeçalho, entre título e conteúdo de seção e no topo do rodapé.
3. **Espaço:** o principal agrupador. Itens relacionados a 8–16px, grupos diferentes a 40px ou mais.

**A única camada que flutua** é a sobreposição de diálogo (identificação por e-mail, confirmação de envio, gaveta de filtros no celular). Ela ganha um véu de verde 40% (`rgba(40, 54, 31, 0.4)`, sem blur) atrás e um filete de 1px em `border-strong` em volta. É uma borda onde nada mais tem borda, e ela marca a camada no lugar da sombra. O cabeçalho fixo, ao rolar a página, ganha só um filete inferior em `border`.

**Movimento.** O movimento imita o ritmo de uma vitrine sendo arrumada: lento, com desaceleração longa e sem quicar. As durações e as duas curvas abaixo são as únicas permitidas.

Curvas:
- **`cubic-bezier(0.22, 1, 0.36, 1)` ("vitrine")**: saída rápida e pouso longo. É a curva de tudo que entra ou se desenha, tirada da referência base44.
- **`ease-out`**: mudança de estado curta.

Durações e onde cada uma é usada:
- **120ms `ease-out`**: mudança de estado (cor de botão, seletor de variação, sublinhado de link).
- **220ms `vitrine`**: diálogo e gaveta entrando; saem em 160ms `ease-in`. Também a seta do link versalete deslizando 4px para a direita no hover e o "pulo" do selo de contagem quando uma peça entra na seleção (escala 1 → 1,25 → 1).
- **700ms `vitrine`**: o **brilho do botão**, uma faixa diagonal translúcida que atravessa o botão cheio no hover (creme 22% sobre o botão verde, branco 55% sobre o botão creme; **nunca dourado**). Também a transição entre slides do hero (crossfade, sem deslizar) e o texto do slide entrando: legenda, título e link sobem 16px e aparecem, com 90ms de atraso entre um e outro.
- **900ms `vitrine`**: o **filete do cabeçalho de seção se desenha** da esquerda para a direita (escala X de 0 a 1) na primeira vez que a seção aparece na tela. É o motivo do logo (a linha entre "VIP" e "IMPORTS") sendo traçado. Uma vez só por visita à página; não se desenha de novo ao rolar de volta.
- **1000ms `vitrine`**: **zoom da foto no hover**, escala 1,04, dentro da vitrine (`overflow: hidden`). Vale para foto de produto, de categoria e de coleção. Ao sair, volta no mesmo tempo.
- **7000ms linear**: o **zoom lento do hero** (escala 1,06 → 1 enquanto o slide está ativo) e a **linha de progresso** sob o contador "01 / 03", que se enche durante o tempo do slide e para quando o carrossel pausa.
- **Entrada da página**: o cabeçalho desce 8px e aparece em 700ms `vitrine`, uma vez, ao carregar o site.

O que **não** anima: texto corrido e cartões de produto aparecendo no scroll (nenhum fade-up na grade, porque a pessoa está lendo e comparando), esqueleto de carregamento, grade carregando mais itens, preço (não existe), foco de teclado. **Não existe parallax nem onda decorativa.** Com `prefers-reduced-motion: reduce`, tudo isso zera: sem zoom, sem brilho, sem filete se desenhando (ele já aparece pronto) e sem autoplay no carrossel.

## Shapes

**Quadrado e círculo, nada no meio.** Raio `0` em tudo que é estrutura: foto, botão, input, cartão de marca, diálogo, etiqueta, seletor de tamanho. Raio `full` só em objeto que é um **ponto**: o selo de contagem da seleção no ícone do cabeçalho, a amostra de cor no seletor de cor e o **ilhós** da etiqueta (o furinho redondo por onde passaria o cordão).

Não existe raio de 4, 8 ou 16px. Canto arredondado é o sotaque de app de consumo, e o registro aqui é de papel cortado e vitrine.

**Etiqueta do código:** retângulo em creme (`etiqueta`), `codigo` em verde, 6px de respiro vertical e 10px horizontal, com um círculo de 5px em `surface` à esquerda como ilhós. É o único elemento "ilustrativo" do sistema e marca o código na página de produto e na lista da seleção. No cartão da grade, o código vai como título Bodoni ("Código X030"), sem etiqueta, para a grade não virar uma parede de retângulos creme.

**Bordas** (sem sub-token no schema, normativas mesmo assim): 1px `border` para filete; 1px `border-strong` para input, seletor e botão secundário; **2px `primary`** para foco (`outline` com 2px de afastamento) e para o traço de erro. O foco em verde tem 12:1 sobre o papel e aparece em todo elemento interativo com `:focus-visible`.

**Ícones:** traço de 1,25px, 20px no cabeçalho e 16px dentro de botão, sempre em `currentColor`, desenhados à mão como SVG inline (lupa, sacola, pessoa, coração, alerta). O ícone do WhatsApp é a marca oficial em monocromático `currentColor` e só aparece ao lado do texto "WhatsApp", nunca sozinho.

## Components

**Botão principal (`button-primary`).** Verde cheio, texto creme em `button` (versalete 13px, +0,12em), 52px de altura, raio 0. É a ação que termina em conversa: **"Comprar no WhatsApp"** no produto, "Enviar seleção pelo WhatsApp" na seleção, "Continuar" na identificação. Hover em `primary-hover` com o brilho diagonal atravessando (ver Movimento), sem mudar tamanho nem ganhar sombra; ao pressionar, escala 0,985. Carregando: o texto dá lugar a "Abrindo o WhatsApp…" e o botão fica desabilitado, sem spinner girando.

**Botão secundário (`button-secondary`).** Papel com contorno de 1px `border-strong` e texto verde. Ações de apoio: "Ver seleção", "Tentar de novo", "Limpar filtros". Hover: o contorno vai para `primary`.

**Botão sobre verde (`button-on-dark`).** Creme cheio, texto verde. É a ação principal dentro de faixa verde (CTA final, diálogo sobre hero). A versão secundária dentro de faixa verde é contorno creme com texto creme.

**Link versalete (`link-caps`).** "Ver detalhes →", "Ver tudo →", "Coleção Feminina →". Texto em `label-caps` com sublinhado de 1px afastado 4px da linha de base. No hover o sublinhado engrossa para 2px e a seta desliza 4px para a direita; a cor não muda.

**Cartão de produto.** Não é cartão: não tem fundo, borda nem sombra. De cima para baixo: foto 4:5 na `vitrine-foto`; marca em `text-meta` (versalete 11px, `on-surface-muted`); "Código X030" em `headline-sm`; categoria em `body-sm` `on-surface-muted`; "Valor confirmado pelo atendimento." em `body-sm` `on-surface-muted`; e uma linha com o link "Ver detalhes →" à esquerda e o botão de texto **"Comprar no WhatsApp"** (ícone + versalete, sem fundo) à direita. Produto `esgotado`: sobre a foto, no canto superior esquerdo, uma etiqueta papel com "Esgotado" em versalete; a foto não perde saturação. No hover do cartão, a foto dá o zoom de 1,04 em 1s dentro da vitrine. O botão de compra vira "Consultar disponibilidade", e o fluxo segue igual, porque esgotado continua sendo vitrine e o atendimento decide. **Não existe preço em lugar nenhum**, nem campo "a partir de".

**Etiqueta (`etiqueta`).** Código do produto sobre creme com ilhós. Ver Shapes.

**Faixa verde (`faixa-verde`, `faixa-verde-meta`, `faixa-verde-filete`).** Hero, CTA final e rodapé. Título Bodoni em creme, legenda versalete em `on-primary-muted`, filetes em `rule-on-primary`.

**Seletor de variação (`seletor-variacao`, `seletor-variacao-ativo`).** Tamanho: quadrados de 44px com contorno `border-strong` e `codigo` centralizado; o ativo fica verde cheio com texto creme. Cor: a mesma caixa com o nome da cor escrito (a API manda "Preto", não um hex, e o sistema não inventa amostra de cor que não conhece). Variação `disponivel: false`: texto com risco no meio, `aria-disabled`, e não é selecionável. São dois grupos separados, "Tamanho" e "Cor", e **nenhum é obrigatório para comprar**: sem escolha, a conversa do WhatsApp resolve.

**Campo (`input`, `input-error`).** Fundo vitrine, contorno 1px `border-strong`, raio 0, 52px, `body-md` em 16px (abaixo disso o iOS dá zoom no campo). O rótulo fica acima do campo em `label-caps`, nunca como placeholder. Erro: o contorno vira 2px `primary`, e abaixo aparece ícone de alerta + mensagem de `erro.campos[campo]` em `body-sm`. **Sem vermelho.**

**Aviso (`aviso`).** Mensagem temporária no pé da tela ("Peça adicionada à seleção", "2 itens não estão mais disponíveis"). Verde cheio, texto papel, raio 0, some em 5s, com `role="status"`.

**Selo de contagem (`selo-contagem`).** Círculo verde de 18px no ícone da seleção, número em creme. Some quando a seleção está vazia; não mostra "0". Quando o número sobe, o selo dá um pulo curto (escala 1,25 em 220ms), que confirma que a peça entrou.

**Esqueleto (`esqueleto`).** Bloco em `border` com as proporções exatas do conteúdo final (foto 4:5, duas linhas de texto). Estático, sem brilho correndo: carregar não é evento.

**Estado vazio e estado de erro.** Mesmo layout, alinhado à esquerda: título `headline-md`, uma frase em `body-md` e uma saída em `button-secondary` ("Limpar filtros", "Ver novidades", "Tentar de novo"). No erro, o ícone de alerta vem antes do título. Nunca ilustração, nunca emoji.

**Diálogo de identificação.** Camada flutuante (ver Elevation). Título `headline-md` "Para abrir a conversa, seu e-mail", um parágrafo curto dizendo que não tem senha, um campo de e-mail e o botão principal. O mesmo diálogo serve para conta nova e existente, sem distinguir os dois casos.

## Do's and Don'ts

- **Não use nenhuma cor fora das 13 desta lista.** Precisa de um tom novo? Ele é uma mistura das três oficiais e entra aqui primeiro, com a proporção anotada, antes de ir para `tokens.css`. Hex solto em componente é proibido.
- **Não use dourado, mostarda, vermelho ou cinza neutro**, nem "só num detalhe". A referência base44 usa dourado nos botões e divisores; aqui esse papel é do verde cheio (botão) e do filete `border` (divisor).
- **Use no máximo duas faixas verdes de sangria total por página** (o rodapé não conta). Com três, o verde deixa de ser destaque e vira fundo.
- **Não mostre preço, desconto, parcela ou "a partir de".** O texto fixo é "Valor confirmado pelo atendimento."
- **Todo botão de compra diz "Comprar no WhatsApp"** (ou "Consultar disponibilidade" para esgotado). Nunca "Comprar", "Adicionar ao carrinho" ou "Finalizar pedido": não existe checkout.
- **Não use Bodoni Moda abaixo de 20px nem em texto corrido.** Descrição, legenda e aviso vão em Jost.
- **Não use Jost em peso diferente de 400 e 600.** Se um título não está chamando atenção, ele precisa de mais espaço acima, não de negrito.
- **Não centralize texto.** Nem título de seção, nem estado vazio, nem diálogo. Exceções: nome no cartão de marca e wordmark no cabeçalho do celular.
- **Não arredonde canto.** Raio é 0 ou círculo. Se algo parece pedir 8px, a resposta é 0.
- **Não use sombra**, nem para "destacar" cartão no hover. A única camada com separação visual é o diálogo, e ela usa véu verde + filete.
- **Não pinte erro.** Erro é ícone + frase + traço de 2px em verde, sempre com a mensagem que a API mandou em `erro.mensagem`/`erro.campos`.
- **Não recorte foto de produto.** 4:5 com `object-fit: contain` sobre a vitrine branca. Produto sem capa (`capa: null`) mostra a vitrine vazia com "Foto em breve" em `text-meta`, sem imagem genérica.
- **Anime só o que está na lista de Movimento**: entrada do cabeçalho, hero (crossfade, zoom lento, texto subindo, linha de progresso), filete de seção se desenhando, zoom de 1,04 na foto, brilho do botão cheio, seta do link e pulo do selo. Não aplique fade-up em cartão, texto corrido ou grade, não use parallax e não crie onda ou gradiente animado.
- **O brilho do botão é creme ou branco translúcido, nunca dourado.** A referência base44 usa dourado; aqui a mesma faixa diagonal usa a paleta oficial.
- **Todo degradê sobre foto é de verde para transparente.** Nunca de preto, nunca com dois tons.
- **Use versalete sempre com espaçamento positivo** (`label-caps` +0,16em, `label-caps-sm` +0,14em). Caixa-alta sem tracking é proibida.
- **Use só as três combinações de logo do manual:** branco sobre verde, verde sobre creme e creme sobre verde. No cabeçalho em papel, o logo vai em verde. O selo circular "use vip imports" é para rede social e não entra no cabeçalho.
