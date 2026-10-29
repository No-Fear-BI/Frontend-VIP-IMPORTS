# AGENTS.md — VIP Imports Frontend

Instruções para agentes de código (Codex e outros). O Claude Code lê `CLAUDE.md`; este arquivo existe porque o Codex procura `AGENTS.md`. **As regras são as mesmas e a fonte é `CLAUDE.md`.** Se os dois divergirem, vale o `CLAUDE.md`; nesse caso, corrija este arquivo.

## Leia antes de qualquer mudança

1. `CLAUDE.md`: identidade da marca, decisões já tomadas, organização do código, regras da API.
2. `src/styles/tokens.css`: o contrato de tokens. Nomes definitivos, valores provisórios até o cliente escolher a direção visual (ainda não existe `DESIGN.md`).
3. `docs/decisoes-frontend.md` e `docs/pendencias-frontend.md`.
4. Para qualquer chamada de API: `../Backend-VIP-IMPORTS/docs/para-o-frontend.md` e `docs/contrato-api-v1.json`.

## Regras que não se quebram

- Só as três cores oficiais (`#28361F`, `#FCEAB3`, `#FFFFFF`) e neutros derivados delas. **Nenhum componente escreve hex, rgb(), px de espaçamento, tamanho/família de fonte ou duração solta**: tudo é `var(--...)` de `src/styles/tokens.css`. Falta um valor? Crie o token lá, nomeado pela função, nunca pela aparência. Única exceção: pontos de quebra em `@media` (480/767/1023/1240px).
- Sem dourado, sem vermelho.
- A loja não vende direto. Não existe preço nem checkout. O botão de compra é sempre "Consultar valores no WhatsApp" (ou "Consultar disponibilidade" para esgotado), só na página do produto — o cartão só tem "Ver detalhes →" e usa `useCompra().comprar({ produto, par })`. **Nunca monte link `wa.me` de compra nem guarde o número da loja no frontend**: o link vem de `POST /selecoes`.
- Toda chamada de API passa por `src/services/*` (que usam `src/lib/apiClient.js`). Botão, campo, cartão e modal: `src/components/ui/` (`Button`, `Field`, `Card`, `Modal`). Trate erro lendo `ErroApi` (`codigo`, `mensagem`, `campos`, `detalhes`).
- Painel (`/admin/*`): service novo usa `requisitarAdmin` (`src/lib/apiAdmin.js`), não `requisitar`. Página nova entra DENTRO do grupo `<RotaAdminProtegida>` em `App.jsx` — fora dele abre sem login. 401 em rota de painel é sessão vencida (volta ao login), 403 é sessão de cliente (mensagem própria, nunca manda ao login). Sessão do painel e do cliente são independentes: `useSessaoAdmin()` × `useSessaoCliente()`.
- `PATCH /carrinho/:itemId` recebe sempre `variacaoTamanhoId` **e** `variacaoCorId`. Listas de variações, imagens, destaques e ordens do painel substituem o conjunto inteiro (a de imagens manda a lista COMPLETA de ids; a de ordem 1 vira a capa).
- Grade de variações do painel (`src/paginas/admin/Produto.jsx`): carregue a grade atual, edite e mande TUDO de volta, cada cor com o `corId` que veio da leitura. Sem `corId`, uma cor renomeada na paleta vira cor nova, sem erro. Cor nova entra escolhida de `GET /admin/cores`, nunca digitada.
- Criar/editar produto no painel: **não existe `colecaoId` no corpo** — só `categoriaId` (a categoria já diz a coleção). A "Coleção" do formulário é filtro de tela para o seletor de categoria, não um campo que viaja para o backend. `PATCH /admin/produtos/:id` é parcial: só manda o que mudou; `descricao: null` apaga.
- Toda tela que busca dado tem os três estados: carregando (na loja, `<Carregando>` de `components/Carregando.jsx`; no painel, esqueleto), vazio (com saída) e erro ("Tentar de novo"). Use `useRequisicao`, `components/Estados.jsx` e as classes de estado de `styles/global.css`.
- Código, nomes e rotas em português.
- `docs/comparacao/` e `docs/propostas/` não são código do site. Não importe de lá e não "conserte" lá.

## Rodar e verificar

```
npm install
npm run dev            # contra a API real (backend: docker compose up -d em ../Backend-VIP-IMPORTS)
npm run dev:exemplo    # API simulada; ?exemplo=lento|vazio|erro na URL força os estados; ?exemplo=vibrante = 3 banners vibrantes p/ testar o carrossel
npm run build
npm run lint:design    # só depois que DESIGN.md existir
```

Ao terminar uma tela: suba o dev server, tire screenshot em desktop e em ~390px de largura, confirme os três estados e confirme que nenhum valor solto (fora de `var(--token)`) entrou no CSS ou no JSX.
- Portão de acesso (modo aprovação): mora em `<Estrutura>` (`components/Estrutura.jsx`) e cobre SÓ a loja — `/admin/*` nunca pode passar por ele, senão a equipe não consegue desligá-lo. Estado em `src/contexto/AcessoLoja.jsx`; detalhes em `CLAUDE.md` e `docs/decisoes-frontend.md` (seção 20).

## Painel: menu, novidades e ajustes recentes (30/09/2026)

Resumo do que entrou nesta rodada; o registro completo está em `CLAUDE.md` e `docs/decisoes-frontend.md` (seção 21).

- **Menu do painel em dois níveis** (`src/paginas/admin/EstruturaAdmin.jsx`, constante `MENU_ADMIN`): Operação (Resumo, Revisão, Seleções, Clientes), Cadastros (Produtos, Marcas, Cores, Categorias, Banners, Destaques) e Permissões de Acesso como link direto. O grupo da rota atual abre sozinho; só um grupo fica aberto. No desktop é acordeão na lateral; até 1023px os grupos viram uma linha de abas e o submenu do grupo aberto aparece numa segunda linha (grade + `display: contents`, com `--admin-menu-colunas` inline). O agrupamento ainda precisa ser confirmado com a equipe.
- **Novidades por produto.** Além da janela de 14 dias, cada produto tem `emNovidades` (padrão `true`; coluna `em_novidades`, migração `0017_produto_em_novidades` no backend). `GET /produtos?novidades=true` = flag ligada E dentro dos 14 dias. A migração precisa rodar no banco local: `docker exec vip-imports-api alembic upgrade head` (sem ela, `GET /admin/produtos` dá 500 com "column produtos.em_novidades does not exist").
- **`CampoNovidades.jsx`** (`src/paginas/admin/`): caixa + botão "?" que explica a regra. Usado na Revisão ("Colocar em novidades ao permitir?", manda `emNovidades` em `POST /admin/revisao`), na criação e na edição do produto (PATCH parcial, só se mudou). Sempre vem marcado por padrão.
- **Produtos (lista):** "Remover das novidades" (`PATCH {emNovidades:false}`) nos que ainda estão na janela; "Realocar nas novidades" (`PATCH {emNovidades:true}`) nos removidos. A coluna de status mostra "em novidades" / "fora das novidades". Realocar só devolve à página se o produto tem menos de 14 dias.
- **Modo exemplo:** `servidorExemplo.js` entende `emNovidades` (criar, editar, listar e o filtro `novidades=true`).
- **Revisão, cards:** grade de 3 colunas (2 até 1240px, 1 até 480px), mais espaço interno e entre cards, e filete acima dos botões. Continua sem raio de canto (`--raio: 0px` é regra da marca).
- **"Adicionar outra categoria"** (`DestinosProduto.jsx`): sem sublinhado, só negrito na cor do texto.
- **Arquivos com CRLF:** no Windows, edite com ferramentas que preservam o fim de linha; não reescreva arquivo inteiro com LF.

## Painel: preço interno (06/10/2026)

- `precoCentavos` (inteiro, opcional, 0 a 10.000.000) é dado SÓ do painel: `CampoPreco.jsx` na Revisão (manda em `POST /admin/revisao` ao aprovar) e em `paginas/admin/Produto.jsx` (criar; no PATCH vazio vira `null`), e "Preço interno" na lista de Produtos. Nenhum componente da loja lê preço; `grep -rniE 'preco|preço|price|centavo' src` só pode achar `paginas/admin/`, `lib/preco.js`, o modo exemplo e dois textos institucionais.
- `src/lib/preco.js`: `lerPreco` (vírgula, milhar, `R$`; só inteiros), `formatarCentavos`, `formatarReais`. Teste: `npm test`.

## Painel: Revisão, link de origem (02/10/2026)

- **Reprovar** (cartão da Revisão) sempre abre a janela "Reprovar este produto?" com "Cancelar" e "Sim, reprovar"; manda `POST /admin/revisao` com `status: 'rejected'`.
- **Atualizar produtos** (`paginas/admin/AtualizarProdutos.jsx`): `POST /admin/revisao/atualizar` e andamento em `GET /admin/revisao/atualizacao` (a cada 5 s). Não repete álbum (o backend junta pelo id); uma coleta por vez; ao concluir, recarrega a fila.
- **`origemUrl`** do produto: campo opcional "Link de origem" na criação e na edição; "Ver origem ↗" só na listagem do painel (ao lado de "Remover das novidades"), nunca na loja. `linkDaOrigem` está em `src/lib/linkOrigem.js` (acrescenta `uid=1`).
- **Modo exemplo:** simula a coleta (8 s, traz 2 álbuns na primeira vez e nada na seguinte) e entende `origemUrl`.
- Registro completo em `docs/decisoes-frontend.md`, seção 26.


## Pedidos sem histórico — 05/10/2026

Decisão do cliente: o rótulo "Fazer pedido" passa a "Encomendar" em toda a loja
e no painel. O histórico de pedidos sai da conta, do painel, das rotas e do
banco. `POST /selecoes` apenas gera `itens`, `mensagemWhatsapp` e `linkWhatsapp`
em memória (HTTP 200), sem id ou data e sem salvar o envio. A seleção em
andamento continua disponível. No resumo, o quarto contador passa a Clientes.
Não existem mais selecoesService.historico, selecoesAdminService, as páginas
admin/selecoes nem os campos selecoesNoMes e totalSelecoes. Esta decisão
substitui as referências anteriores ao histórico de seleções.


## Pedidos voltam, com status — 20/10/2026

Pedido do dono: o painel ganha `/admin/pedidos` (menu Operação). Isto **reverte em parte** a seção
acima: o backend e o painel voltam a guardar pedidos; a conta do cliente continua sem histórico
(`GET /selecoes` segue removida). `POST /selecoes` agora grava o pedido (peças e dados do cliente
congelados em texto, status `em_andamento`) e responde o mesmo de antes; enviar a mesma seleção de
novo não duplica o pedido em andamento. Em `/admin/pedidos` a equipe vê os pedidos em andamento,
finalizados e não finalizados (filtro e página na URL: `?status=&pagina=`; contagens por status
vindas do backend), com a quantidade de produtos, as peças (código, nome, marca, categoria,
tamanho, cor, foto) e os dados do cliente (nome, e-mail, telefone), e marca cada um como
finalizado, não finalizado ou reabre (qualquer status vale para qualquer outro).
`paginas/admin/Pedidos.jsx`, `services/pedidosAdminService.js` (listar, atualizarStatus) e, no modo
exemplo, `lib/exemplo/pedidosExemplo.js` (inclui os pedidos que a loja gera ao consultar valores).
Nenhum componente da loja lê pedido. Backend: migração 0021 e `docs/para-o-frontend.md`
("Atualização de 20/10/2026"). O pedido guarda e-mail e telefone do cliente sem prazo.

## Painel: imagem só por arquivo (22/10/2026)

- Nenhum formulário do painel tem campo de endereço (URL) de imagem. Banners (desktop e celular), a imagem da categoria, a do card da categoria e as imagens do produto (edição e criação) usam o botão "Envie um arquivo".
- Componentes em `src/paginas/admin/CampoImagem.jsx`: `BotaoArquivo` (um `<button>` que abre o `<input type="file">` escondido), `CampoImagem` (rótulo, proporção recomendada, botão, prévia na mesma proporção e "Remover imagem" no campo opcional; sobe por `POST /admin/banners/upload`), `ProporcaoRecomendada` e `PreviaImagem`. Imagem nova no painel usa esses componentes, nunca um campo de URL.
- Proporções: banner desktop 21:9, banner celular 2:3, imagem e card da categoria 1:1, produto 4:5.
- `/categorias`: as fotos dos cartões levam o degradê verde dos cards de coleção da home (`degrade` em `CartaoCategoria`/`FotoProduto`).
- Registro completo em `docs/decisoes-frontend.md`, seções 29 e 30.

## Painel: ações de lista em desenho (22/10/2026)

- Editar = lápis, Excluir = lixeira, Mover para cima/baixo = setas, sempre com `BotaoIcone` (`src/paginas/admin/BotaoIcone.jsx`; `acao` = `editar` | `excluir` | `subir` | `descer`; `para` vira `<Link>`). Desenhos em `components/Icones.jsx` (`IconeLapis`, `IconeLixeira`, `IconeSetaCima`, `IconeSetaBaixo`).
- `rotulo` é obrigatório e leva o nome do item ("Editar a categoria Bolsas"): vira `aria-label` e `title`. Seta na ponta da lista fica desativada, não some.
- Continuam em texto: botões de confirmação das janelas, "Remover" dos Destaques (não exclui nada) e "Excluir produto" no topo do produto (ganhou a lixeira ao lado do texto).
- Registro completo em `docs/decisoes-frontend.md`, seção 31.

## Onda entre seções: home, produto e categorias (26/10/2026)

- `src/components/DivisorOnda.jsx` na home, entre Destaques/Coleções e Categorias/Marcas — acima de Categorias não tem, a pedido —, e na página do produto, acima de "Você Também Pode Gostar" (renderizada dentro de `Relacionados`, some com a seção), e em `/categorias` entre Feminina e Masculina (cada bloco da página tem o próprio `.container`, para a onda ir de ponta a ponta) (`espelhada` e `fase` variam o desenho). Três faixas de SVG em degradê creme → verde, desfocadas, em loop lento.
- Só `transform` anima: cada SVG tem 200% da largura e o desenho se repete na metade, então `translateX` até −50% fecha o ciclo sem repintar. Nunca anime o `d` do caminho. Pausa fora da tela; com `prefers-reduced-motion` fica parada.
- A onda aparece sempre inteira, sem depender da rolagem: o efeito de se completar ao rolar saiu em 28/10/2026, a pedido (seção 49). Não ligue movimento da onda à rolagem.
- Só nesses lugares: o `DESIGN.md` continua proibindo qualquer outra onda ou gradiente animado.
- Registro completo em `docs/decisoes-frontend.md`, seção 32.

## Cartão de produto e de categoria aparecem com a rolagem (26/10/2026)

- Todo `CartaoProduto` e todo `CartaoCategoria` usam `useAparecerNaRolagem` (`src/hooks/useAparecerNaRolagem.js`): abaixo da dobra ele espera escondido (`data-aparece="espera"`) e aparece uma vez quando a rolagem chega nele (`visivel`, CSS genérico em `src/styles/global.css`). O que já está na tela ao abrir a página não se mexe; com `prefers-reduced-motion` nada se esconde.
- Um `IntersectionObserver` só para a página toda e estado direto no DOM, sem re-render. Não crie observador por cartão nem guarde isso em estado do React.
- Só os cartões de produto e de categoria têm esse efeito: texto corrido e os outros cartões (marca, coleção) continuam sem fade-up.
- Registro completo em `docs/decisoes-frontend.md`, seção 33.

## Loja: carregador no lugar dos esqueletos (26/10/2026)

- Toda espera por dado na loja usa `<Carregando>` (`src/components/Carregando.jsx`): `variante` = `tela` (abertura) | `pagina` (home, produto — um por página) | `bloco` (seção, o padrão) | `compacto` (filtro, botão, janela); `rotulo` é o texto para leitor de tela; `decorativo` quando o texto ao lado já diz "Carregando…". Não use `Esqueleto` na loja; o painel continua com eles.
- Animação em CSS refeita de um Lottie (sem `lottie-web`): só `translate` e `rotate`, cores e tamanhos em tokens (`--cor-carregador-*`, `--tamanho-carregador*`, `--duracao-carregador`). Os cantos arredondados (`--raio-carregador`) são exceção pedida pelo cliente à regra de raio 0.
- `index.html` tem a mesma marcação (`#carregador-inicial`); ela fica por cima até a resposta do acesso e sai por `src/lib/carregadorInicial.js` (`Estrutura` e `ProvedorSessaoAdmin`). Mudou a marcação de um, mude a do outro.
- Registro completo em `docs/decisoes-frontend.md`, seção 34.

## Loja: sacola triste no estado de erro (26/10/2026)

- Na loja, todo `EstadoErro` recebe `sacola` (`<EstadoErro sacola erro={…} onTentar={…} />`): a sacola animada (`src/components/SacolaErro.jsx`) entra no lugar do ícone de alerta. A 404 (`NaoEncontrada`) também mostra a sacola. O painel continua sem `sacola`, e erro de campo/`ErroGeral` continua com o ícone.
- SVG + CSS refeitos de um Lottie (sem `lottie-web`), cores em `--cor-sacola-*`, sem vermelho. Com `prefers-reduced-motion`, fica parada de cabeça para baixo, com a cara triste.
- Registro completo em `docs/decisoes-frontend.md`, seção 35.

## Sobre: ilustração animada (26/10/2026)

- `src/components/IlustracaoSobre.jsx` toca `src/assets/animacoes/sobre-equipe.json` (Lottie, sem mudança) com `lottie-web/build/player/lottie_light` (fixado em 5.12.2), os dois por `import()` dentro do componente: só o Sobre baixa. Não importe o `lottie-web` em outro lugar sem necessidade: o carregador e a sacola de erro são CSS puro de propósito.
- Cores: na carga, cada cor sólida do JSON vira um tom da rampa `--cor-ilustracao-escura` → `-clara` → `-luz` pela claridade (L*). Não edite cores no JSON. Para ler a cor de um token em JS, use um elemento de sonda com `color: var(--token)` e o `rgb()` de `getComputedStyle` (`corDoToken`); nunca interprete o texto do token: o build minifica `#ffffff` para `#fff`, e ler isso como hex de 6 dígitos deu azul em produção.
- Recorte `RECORTE` no componente casado com o token `--proporcao-ilustracao-sobre`; ao mudar, meça o desenho em todos os quadros (a mão que acena passa da borda no quadro 71). Pausa fora da tela, `destroy()` ao desmontar, parada no primeiro quadro com `prefers-reduced-motion`.
- Registro completo em `docs/decisoes-frontend.md`, seção 36.

## Cabeçalho da loja em verde (27/10/2026)

- `src/components/Cabecalho.jsx`: o `<header>` tem `faixa-primaria` (fundo `--cor-primaria`, texto `--cor-sobre-primaria`, foco em creme) e o logo é `<Logo tom="creme" />`. Não volte a pôr `background` em `.cabecalho`: o CSS do componente carrega depois do global e ganharia da `faixa-primaria`.
- Filete inferior fixo em `--cor-borda-sobre-primaria` (não há mais estado `rolou`). Selo de contagem em creme com número verde; barra de busca sem fundo próprio, no verde do cabeçalho. A gaveta do menu do celular continua em papel, com logo verde.
- Registro completo em `docs/decisoes-frontend.md`, seção 37.

## Cabeçalho: janela de Categorias e Marcas (27/10/2026)

- `src/components/MenuSuspenso.jsx` (conteúdo) + `ItemComSuspenso` em `Cabecalho.jsx` (abrir/fechar). Item com janela = `suspenso: 'marcas' | 'categorias'` no `MENU`. Fecha 200ms depois de o mouse sair (`ATRASO_FECHAR_SUSPENSO_MS`), na troca de rota e com Esc; seta para baixo abre pelo teclado.
- Mesmos dados e destinos das páginas: marcas de `GET /marcas` → `/marcas/:slug`; categorias de `GET /colecoes/:slug/categorias` (Feminina, Masculina) → `/produtos?colecao=…&categoria=…`. "Ver todas" → `/marcas` ou `/categorias`. A busca só acontece na primeira abertura.
- `.cabecalho__nav > ul` (com `>`): sem ele, a regra do menu pega também a lista da janela. O `<li>` com janela ocupa a altura toda do cabeçalho; é isso que encosta a janela na base dele.
- Registro completo em `docs/decisoes-frontend.md`, seção 38.

## Cartão de produto em destaque no hover (27/10/2026)

- `CartaoProduto` passa `degrade` à `FotoProduto`; em `Produto.css`, o degradê do cartão é `--degrade-destaque-produto` (mais leve que `--degrade-sobre-foto`, que segue no hero/coleções/categorias) e fica invisível até `.cartao-produto:hover`, e os filhos do cartão sobem `--deslocamento-destaque-cartao` (6px), só em `@media (hover: hover)`. Tudo no hover do cartão leva `--duracao-muito-lenta` (1000ms), sem atraso (seção 50). Zoom da foto e sublinhado do código também respondem ao cartão todo.
- Use `translate` (não `transform`) e mova os filhos (não o `<article>`): `transform` brigaria com o aparecer na rolagem, e mover o próprio cartão faz o hover tremer na borda de baixo.
- Registro completo em `docs/decisoes-frontend.md`, seção 39.

## Página do produto: botões redondos de passar fotos (27/10/2026)

- `paginas/Produto.jsx`: com mais de uma foto, `.produto__passar--anterior`/`--proxima` sobre a foto principal (círculo de 44px, `--cor-fundo-passar-foto` + `--cor-borda-passar-foto`, `IconeChevronEsquerda/Direita` em creme; hover em `--cor-primaria`). `passarFoto(±1)` dá a volta.
- Os botões ficam em `.produto__palco`, FORA da `.produto__foto-principal`: dentro dela, o hover no botão dispararia a lupa da foto.
- O círculo é exceção registrada no DESIGN.md (Shapes); não use raio `full` em outros botões.
- Registro completo em `docs/decisoes-frontend.md`, seção 40.

## Botões em formato de pílula (27/10/2026)

- Todo botão com caixa visível usa `border-radius: var(--raio-botao)` (9999px: pílula no botão largo, círculo no quadrado de 44px). Já aplicado em `.botao`, `.hero__seta`, `.seletor-variacao`, `.admin-pedidos__filtro-opcao`, `.botao-icone` e `.produto__passar`. Botão novo com fundo ou contorno usa o mesmo token.
- Continua com `var(--raio)` (reto): foto, miniatura, campo, cartão, modal, gaveta, menu suspenso, etiqueta, aviso.
- Registro completo em `docs/decisoes-frontend.md`, seção 41.

## Setas do hero iguais ao botão de passar fotos (27/10/2026)

- `.hero__seta` (`paginas/Home.css`) usa os mesmos tokens e ícones do `.produto__passar`: `--cor-fundo-passar-foto`, `--cor-borda-passar-foto`, `IconeChevronEsquerda/Direita`, hover em `--cor-primaria`. Mudou um, mude o outro.
- Registro completo em `docs/decisoes-frontend.md`, seção 42.

## Hero: texto e setas no meio da altura, barra de tempo no pé (27/10/2026)

- `.hero__controles` (`paginas/Home.css`) ocupa a largura toda do banner, sem `.container`, e tem só contador e barra de tempo, centralizados no pé. As setas (`.hero__seta--anterior` / `--proxima`) são filhas diretas do `.hero`, uma em cada lateral, no meio da altura. O texto do hero continua à esquerda (título com `--medida-titulo`), mas no carrossel `.hero__slide .hero__texto` fica no meio da altura (`top: 50%` + `translate`), alinhado com as setas.
- Registro completo em `docs/decisoes-frontend.md`, seção 43.

## Linhas de separação sem cor (27/10/2026)

- Toda linha de separação da loja (filete `<hr>`, traço sob título de seção, `border-top`/`-bottom`/`-block` entre blocos e itens, filetes da faixa verde) usa `--cor-separador` ou `--cor-separador-sobre-primaria`, os dois `transparent`: o espaço fica, a linha não aparece. Separação nova não desenha linha; use o mesmo espaço (ou esses tokens). Contorno de caixa, barrinha de destaque à esquerda e o painel continuam como estão.
- Registro completo em `docs/decisoes-frontend.md`, seção 44.

## Cards de coleção da home em 4:5 (27/10/2026)

- `.painel-colecao` (`paginas/Home.css`) usa `aspect-ratio: var(--proporcao-painel-colecao)` (4 / 5), com `--altura-painel-colecao` como piso. A imagem do card no painel (Categorias → "Imagem do card") recomenda 4:5 e mostra a prévia em 4:5; mudou a proporção do card, mude a recomendação e a prévia junto.
- Registro completo em `docs/decisoes-frontend.md`, seção 45.

## Cartão de marca troca de cor no hover (27/10/2026)

- `.cartao.cartao-marca` (`paginas/Home.css`): no hover e no `:focus-visible`, fundo e borda `--cor-primaria`, nome `--cor-sobre-primaria`, contagem `--cor-sobre-primaria-suave`, em 220ms. Vale na home e em `/marcas` (mesmo `GradeMarcas`).
- Registro completo em `docs/decisoes-frontend.md`, seção 46.

## Painel: símbolos no menu (27/10/2026)

- Cada grupo e cada tela do `MENU_ADMIN` (`paginas/admin/EstruturaAdmin.jsx`) tem `icone`, um componente de `components/Icones.jsx` (traço 1,25px, `currentColor`), desenhado a 16px por `.admin__icone`. Tela nova no painel ganha um `icone` também.
- Registro completo em `docs/decisoes-frontend.md`, seção 47.

## Painel: Duplicar com símbolo de cópia (27/10/2026)

- `BotaoIcone` aceita `acao="duplicar"` (`IconeCopiar`); a lista de Produtos usa isso no lugar do texto. O botão "Duplicar" da tela do produto tem o desenho antes do texto.
- `.modal` tem `white-space: normal`: o `<dialog>` herda do pai no HTML, e as ações da lista ficam numa célula com `nowrap`.
- Registro completo em `docs/decisoes-frontend.md`, seção 48.

## Cartão de produto: sublinhado que se desenha (28/10/2026)

- `components/Produto.jsx`: o código fica em `<span className="cartao-produto__codigo">`. Em `Produto.css`, no `.cartao-produto:hover` (só `@media (hover: hover)`), o traço do código (fundo, `background-size` 0% → 100%, segue a quebra de linha) e o `::after` do `.link-caps` do cartão (`scaleX` 0 → 1) se desenham juntos, da esquerda para a direita; a seta do link anda no hover do cartão todo. Subida, zoom, degradê, linhas e seta: todos em `--duracao-muito-lenta` na `--curva-suave`, sem `transition-delay`. Peça nova no hover do cartão segue o mesmo tempo, senão sai de sincronia. `transform-origin` fixo à esquerda: a linha recolhe pelo mesmo caminho, sem pular.
- No cartão, `.link-caps` tem `text-decoration: none`; sem mouse, o `::after` fica inteiro (linha parada). Não mexa no `.link-caps` global por causa disso.
- Registro completo em `docs/decisoes-frontend.md`, seção 50.

## Pequenas animações nos filtros e no rodapé (28/10/2026)

- `paginas/Listagem.css`: `.opcao-filtro__texto` (com `justify-self: start`) tem o traço em fundo (`background-size` 0% → 100%, `--duracao-sublinhado`) no `.opcao-filtro:hover`; o marcador ganha contorno `--cor-primaria` no hover, `scale(var(--escala-marcador-pressionado))` no `:active` e um `::after` verde que cresce do centro na `.opcao-filtro--ativa`. Hover só em `@media (hover: hover)`.
- `components/Rodape.css`: `.rodape__coluna a` com o mesmo traço (creme) no hover e no `:focus-visible`; no `:active`, `--cor-pressionado-sobre-primaria` e traço `--borda-grossa` em `--duracao-rapida`. `.rodape__whats` tem margem negativa que devolve o padding do traço (é `inline-flex`).
- Registro completo em `docs/decisoes-frontend.md`, seção 51.
