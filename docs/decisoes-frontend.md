# Decisões do frontend

Registro das decisões de produto e de design tomadas na construção da loja. Uma seção por decisão: o que ficou decidido, por quê, o que foi descartado e o que muda se alguém quiser reabrir. As datas são absolutas.

Quem mexe no código (pessoa, Claude Code ou Codex) lê este arquivo junto com `CLAUDE.md` e `src/styles/tokens.css` antes de mudar tela.

---

## 1. Direção visual: "Vitrine Reservada" (15/09/2026) — SUSPENSA em 16/09, RETOMADA e definitiva em 17/09, ver seção 9

**Decidido:** editorial de moda cruzado com etiqueta de alfaiataria, com pegada de exclusividade. O pedido do time foi "opção 1, com uma pegada de algo exclusivo". A especificação completa está em `DESIGN.md`, gerado pela skill `design-md-planner` e auditado com `@google/design.md lint`: 0 erros e 0 avisos já na primeira passada.

**O que isso significa na prática:**
- Paleta só com as três cores oficiais. Todo tom extra é uma mistura aritmética delas, com a proporção anotada no `DESIGN.md`.
- Bodoni Moda (Didone, linhagem Vogue/Bazaar) nos títulos e Jost (releitura da Futura) no resto. As duas são servidas pelo próprio site via fontsource.
- Sem sombra, sem canto arredondado (raio 0, ou círculo para "pontos") e sem vermelho: o erro é ícone + frase + traço verde.
- Foto de produto numa "vitrine" branca 4:5 com `object-fit: contain`, sobre o papel creme-claro.
- O código do produto aparece como etiqueta creme com ilhós na página do produto e na seleção.

**Abrimos mão de:** densidade (4 peças por linha no desktop, 2 no celular).

**Alternativas apresentadas e descartadas:** Luxo minimalista (opção 2), Analógico quente e Etiqueta de catálogo densa. A opção 2 foi montada como home estática em `docs/comparacao/` para o cliente comparar (ver seção 6).

**Para reabrir:** rode a skill `design-md-planner` de novo e gere um novo `DESIGN.md`. Depois atualize `src/styles/tokens.css` e rode `npm run lint:design`. Não mude cor ou fonte direto no CSS.

## 2. Sem venda direta: "Comprar no WhatsApp" (15/09/2026)

**Decidido:** nenhum botão "Comprar", "Adicionar ao carrinho" ou "Finalizar pedido". O botão de compra de cada peça é **"Comprar no WhatsApp"**, e vira **"Consultar disponibilidade"** quando a peça está esgotada (esgotado continua na vitrine; o atendimento decide). Não existe preço em nenhum lugar: o texto fixo é "Valor confirmado pelo atendimento."

## 3. O botão passa pelo backend (15/09/2026)

**Decidido:** "Comprar no WhatsApp" usa o fluxo do contrato, e não um link `wa.me` montado no frontend.

Fluxo (`src/contexto/CompraWhatsApp.jsx`):
1. **A partir do cartão da grade**, o diálogo busca `GET /produtos/:codigo` e mostra os seletores de tamanho e cor. Os dois são opcionais: sem escolha, o atendimento confirma. Na página do produto, os seletores já estão na tela.
2. Sem sessão de cliente, pede o e-mail (`POST /clientes/identificar`, sempre 200, sem distinguir conta nova de existente).
3. `POST /carrinho` com a peça e as variações escolhidas.
4. Se a seleção já tinha **outras** peças (o backend não esvazia a seleção depois do envio), pergunta: **"Enviar só esta peça"**, que remove as outras com `DELETE /carrinho/:itemId`, ou **"Enviar as N peças juntas"**.
5. `POST /selecoes` → `window.open(linkWhatsapp)`. O diálogo ainda mostra "Abrir WhatsApp" como link, para o caso de o navegador bloquear a janela.

**Por quê:** o backend determina que o número da loja fica só no servidor e que o link vem pronto. Passar pelo backend também registra a seleção no painel (histórico, cliente, telefone e o resumo "seleções no mês").

**Custo aceito:** um passo de e-mail na primeira compra.

**Descartado:** link `wa.me` direto, que tem um clique só mas quebra a regra do backend e deixa o painel sem saber das conversas. Também foi descartado ter dois botões por peça ("Comprar no WhatsApp" + "Adicionar à seleção").

## 4. Sem carrinho anônimo (15/09/2026)

**Decidido:** peça só entra na seleção pelo fluxo da seção 3, que identifica o cliente antes. Consequência: `POST /carrinho/migrar` não é usado na loja. A página "Minha seleção" pede o e-mail quando não há sessão.

**Para reabrir:** se um dia existir "Adicionar à seleção" sem identificação, a seleção anônima vai para `localStorage` e migra com `POST /carrinho/migrar` logo depois do `identificar`. Nesse caso, mostre os `ignorados` da resposta; não os descarte em silêncio.

## 5. Conteúdo que a API não fornece (15/09/2026)

- **Imagem dos painéis "Coleção Feminina/Masculina":** `GET /colecoes` não tem imagem. Sem `VITE_IMAGEM_COLECAO_*`, o painel é tipográfico, em verde sobre creme (combinação oficial).
- **Link de contato geral** (rodapé, página Contato, "Falar no WhatsApp" do CTA): não existe rota pública com o número da loja. Por enquanto vem de `VITE_LINK_WHATSAPP_CONTATO` / `VITE_LINK_INSTAGRAM`, com os dados oficiais da VIP Imports como padrão em `src/config.js` (o botão não some por variável vazia); e-mail, telefone e @ de exibição também moram em `config.js`. Isso **não** é o link da compra. Pendência em `pendencias-frontend.md`.
- **Textos de Sobre e Contato:** provisórios. Descrevem só o funcionamento que o sistema garante. Não inventar endereço, horário, ano de fundação ou garantia de originalidade.
- **Logo:** `src/components/Logo.jsx` monta o wordmark em texto até o SVG oficial chegar.

## 6. Pasta `docs/comparacao/` (15/09/2026; movida de `comparação/` para `docs/comparacao/` em 16/09/2026 — nome de pasta acentuado normaliza de forma diferente entre Windows, macOS e Linux no Git)

**O que é:** duas homes estáticas com o mesmo conteúdo, para o cliente comparar direções. Abre com duplo clique em `docs/comparacao/index.html` (lado a lado, com botão computador/celular).
- `opcao-1-editorial/`: retrato fiel da home real (`npm run dev:exemplo`) de 15/09/2026, com o HTML renderizado e o CSS compilado.
- `opcao-2-luxo-minimalista/`: home escrita à mão na direção Luxo minimalista (linha The Row/Celine), com a mesma paleta e as mesmas fontes.

**Regras:** não é código do site. O build não lê essa pasta e nada em `src/` importa dela. Se o site mudar, o retrato da opção 1 fica desatualizado, e tudo bem: ele registra o que foi mostrado ao cliente.

## 7. Modo "exemplo" (15/09/2026)

`npm run dev:exemplo` troca a API real por `src/lib/exemplo/servidorExemplo.js`, que reproduz as regras do backend (cursor, PAR de variações, seleção que não esvazia) com um catálogo fictício e as ilustrações de `public/exemplo/` (geradas por `scripts/gerar-ilustracoes-exemplo.mjs`, só com as cores oficiais). Serve para avaliar layout e para ver os três estados com `?exemplo=lento|vazio|erro`. O import é dinâmico, então o catálogo fictício não entra no build de produção.

## 8. Tokens como contrato de nomes; direção visual volta a ficar em aberto (16/09/2026)

**Decidido:** o cliente ainda não escolheu a direção visual, então não existe `DESIGN.md` na raiz e a skill `design-md-planner` não roda agora. `src/styles/tokens.css` virou um **contrato de nomes**: os nomes são definitivos, os valores são provisórios.
- Cores nomeadas pela função: `--cor-primaria`, `--cor-sobre-primaria`, `--cor-secundaria`, `--cor-superficie`, `--cor-fundo-foto`, `--cor-fundo-campo`, `--cor-texto`, `--cor-texto-suave`, `--cor-borda`, `--cor-borda-forte`, `--cor-erro` (valores só das três cores oficiais e misturas delas).
- Tipografia: `--fonte-titulo` (serifada) e `--fonte-texto` (sem serifa), com fonte de sistema por enquanto; escala `--texto-xs` a `--texto-3xl`.
- Espaço em base 4px (`--espaco-1` a `--espaco-12`, mais `--espaco-secao`), `--raio`, `--sombra`, e tokens de layout, controles, camadas e movimento.
- Regra: nenhum componente tem hex, px de espaçamento, tamanho/família de fonte ou duração soltos. Exceção: pontos de quebra em `@media` (480/767/1023/1240px), porque CSS não aceita `var()` ali.

**Por quê:** quando o cliente decidir, trocar o estilo inteiro é gerar o `DESIGN.md` e mudar só os valores de `tokens.css`, sem reescrever componente.

**O que mudou no código existente:** o site da opção 1 foi mantido e migrado para o contrato. O `DESIGN.md` da opção 1 foi para `docs/propostas/DESIGN-opcao-1-vitrine-reservada.md`. As fontes Bodoni Moda e Jost (fontsource) saíram das dependências. A estrutura seguiu o Dia 0 do plano: `src/lib/apiClient.js`, `src/services/` (cinco services), `src/components/ui/` (`Button`, `Field`, `Card`, `Modal`), `src/lib/cn.js`, `src/styles/global.css` com as classes dos três estados, rotas `/colecoes/:slug`, `/categorias/:categoria`, `/carrinho`, `/favoritos` e o grupo `/admin/*` com placeholders.

**Escolhas de rota:** `/carrinho` redireciona para `/selecao` (na tela o nome é "seleção"); `/favoritos` redireciona para `/conta`, onde os favoritos já estão; `/categorias/:categoria` exige `?colecao=` porque o slug de categoria só é único dentro da coleção, e sem ela volta para `/categorias`.

**Para reabrir:** quando o cliente escolher, rode a skill `design-md-planner`, gere `DESIGN.md` na raiz, audite com `npm run lint:design` e substitua os valores de `tokens.css`. Se a direção pedir algo que nenhum token cobre, crie token novo; não renomeie os existentes.

## 9. Direção visual definitiva: "Vitrine Reservada" (17/09/2026)

**Decidido:** o cliente escolheu a opção 1 ("Vitrine Reservada", editorial de moda cruzado com etiqueta de alfaiataria — a mesma da seção 1, retomada da suspensão da seção 8). Não houve nova entrevista de gosto: a especificação já existia em `docs/propostas/DESIGN-opcao-1-vitrine-reservada.md` (auditada com 0 erros/0 avisos em 15/09) e foi copiada para `DESIGN.md` na raiz sem alterações de conteúdo. `npm run lint:design` continua fechando com 0 erros e 0 avisos.

**Fontes viraram dependência de verdade.** `@fontsource-variable/bodoni-moda` e `@fontsource-variable/jost` (licença SIL OFL, permite redistribuir) voltaram para `package.json` e são importadas em `src/main.jsx` (`opsz.css` + `opsz-italic.css` da Bodoni Moda; `wght.css` do Jost — os arquivos hospedados antes em `docs/comparacao/fontes/` vieram exatamente desse pacote, mesmo hash). `--fonte-titulo` e `--fonte-texto` em `tokens.css` apontam para elas.

**`tokens.css` recebeu os valores do `DESIGN.md`, sem mudar nome nenhum.** A maior parte já batia (a paleta de cor, curvas, durações e medidas de layout já vinham dessa mesma especificação desde a seção 8). O que mudou de fato: `--fonte-titulo`/`--fonte-texto` (fontes reais), `--texto-2xl` e `--texto-3xl` (escala grande do editorial), `--raio` (2px → 0px: a direção não tem canto arredondado) e `--sombra` (removida: "não existe sombra no sistema" — a profundidade do modal já vem do filete + véu que `Modal.css` já usava).

**Onde a escala de `tokens.css` é mais grossa que o `DESIGN.md` e por quê ficou assim:** o contrato tem 7 tamanhos de texto e uma altura/tracking de título só, mas o DESIGN.md nomeia 11 papéis de tipografia com valores próprios. Isso obriga a dividir um token entre papéis (`--texto-2xl` serve `headline-lg` e `headline-md`; `--altura-linha-titulo`/`--tracking-titulo` servem os quatro tamanhos de título). Escolhi o valor mais carregado/mais usado em cada caso e documentei o desvio exato como comentário em cada token de `tokens.css`. Abrir tokens novos por papel resolveria isso, mas essa decisão fica para o time (ver `docs/pendencias-frontend.md`) porque o pedido desta rodada foi só trocar valores, não nomes.

**Removido:** `docs/comparacao/` inteira (as duas homes estáticas de comparação e as imagens/fontes que só existiam para elas). Já cumpriu o papel de mostrar as opções ao cliente; a especificação da opção escolhida sobrevive em `docs/propostas/` e agora em `DESIGN.md`.

## 10. Tokens de tipografia por papel, sem renomear os existentes (17/09/2026)

**Decidido:** fechar a maior parte dos desvios registrados na seção 9 (`--texto-2xl` dividido entre `headline-lg`/`headline-md`, `--tracking-titulo` como média de quatro tamanhos, `--texto-xs`/`--texto-sm` divididos entre `label-caps`/`label-caps-sm`/`button`/`codigo`) **acrescentando token novo por papel, sem renomear nem remover nenhum token existente** — Rauhan estava escrevendo telas do painel sobre este arquivo ao mesmo tempo, e um rename quebraria o trabalho dele sem avisar.

**Tokens novos em `tokens.css`:**
- Tamanho: `--texto-headline-lg` (`clamp(30px,5vw,44px)`), `--texto-headline-md` (`30px`), `--texto-label-caps` (`12px`), `--texto-label-caps-sm` (`11px`), `--texto-botao` (`13px`), `--texto-codigo` (`13px`).
- Tracking: `--tracking-display` (`-0.02em`), `--tracking-headline-lg` (`-0.015em`), `--tracking-headline-md` (`-0.01em`), `--tracking-headline-sm` (`0`), `--tracking-label-caps` (`0.16em`), `--tracking-label-caps-sm` (`0.14em`), `--tracking-botao` (`0.12em`).
- Movimento: `--duracao-saida` (`160ms`) e `--curva-saida` (`ease-in`), para a saída do modal/gaveta.

`--texto-2xl`, `--texto-xs`, `--texto-sm`, `--tracking-titulo` e `--tracking-versalete` continuam existindo com o mesmo valor de antes — só pararam de ser usados pelos papéis que ganharam token próprio. `body-sm` não ganhou token novo porque `--texto-sm` (14px) já era o valor exato do DESIGN.md para esse papel.

**`global.css` religado aos papéis certos:** `.t-headline-lg`/`.t-headline-md` (antes um único bloco em `--texto-2xl`), `.t-label-caps`/`.t-label-caps-sm` (tamanho e tracking, mantendo o peso que já estava certo), `.t-codigo`, `.botao` e `.link-caps` (que no DESIGN.md usa a mesma tipografia de `label-caps`).

**Modal ganhou saída de verdade.** `Modal.jsx` não fechava mais o `<dialog>` na hora: agora aplica a classe `.modal--fechando`, espera `--duracao-saida` (lido do próprio `tokens.css` via `getComputedStyle`, não duplicado como número mágico em JS) e só então chama `.close()`. `Modal.css` ganhou `@keyframes modal-sai`/`gaveta-sai`. Isolado a dois arquivos que o painel ainda não usa (`grep` confirmou: nada em `src/paginas/admin` importa `Modal`).

**Ficou de fora, de propósito (ver `docs/pendencias-frontend.md`):** `--altura-linha-titulo` continua uma média única para os quatro tamanhos de título — só o tracking entrou no pedido desta rodada — e `--medida-titulo` continua um só valor para hero (14ch) e CTA final (18ch).

**Conferência:** `scripts/checar-tokens.mjs` (novo, `npm run check:tokens`) varre todo `var(--token)` em `src/**/*.css` contra as definições de `tokens.css`; rodado antes e depois desta mudança, 0 referências penduradas nas duas vezes. `--sombra` não foi removida na rodada anterior (só teve o valor trocado para `none`), então nunca existiu risco de referência pendurada por causa dela.

## 11. Acesso ao painel: sessão própria, rota protegida, login e sair (21/09/2026)

**Decidido:** antes de qualquer tela do painel, a base de acesso. `/admin/*` abria sem login porque nada checava sessão.

- **`GET /admin/eu` foi conferido no código do backend** (`rotas/admin_painel.py`, esquema `AdminEu`), porque não está no contrato v1.0 — só em `para-o-frontend.md`. Devolve `{ id, nome, email, ultimoLoginEm, criadoEm }`, igual ao `POST /admin/sessao`.
- **Contexto separado** (`src/contexto/SessaoAdmin.jsx`), montado só em `/admin/*`. Não reaproveita nada de `SessaoCliente`: no backend são cookies e prazos diferentes (12h sem renovar × sessão do cliente que se estende).
- **401 e 403 levam a lugares diferentes.** 401 `NAO_IDENTIFICADO` → `/admin/login`, guardando a página de origem para voltar depois de entrar. 403 `SEM_PERMISSAO` → tela "Esta área é restrita à equipe da loja." SEM redirecionar: o backend só devolve 403 quando o navegador tem sessão de CLIENTE e nenhuma de admin, e mandar essa pessoa ao login a faria tentar uma senha que não tem. Há um link discreto "Sou da equipe: entrar no painel" para quem é da equipe e também está identificado como cliente — com as duas sessões, o backend faz valer a de admin.
- **Sessão vencida no meio do uso é tratada num lugar só.** `requisitarAdmin` (`src/lib/apiAdmin.js`) avisa o contexto em qualquer 401/403 de rota do painel; a rota protegida reage, e o login mostra "Sua sessão expirou. Faça login de novo." (mensagem do backend). Nenhuma tela do painel trata sessão vencida na mão.
- **Login** mostra uma frase só para `CREDENCIAIS_INVALIDAS` — "E-mail ou senha inválidos." — como o backend pede (e-mail inexistente, senha errada e conta desativada são a mesma resposta de propósito). 429 usa a mensagem do backend.
- **Sair** só tira a pessoa do painel depois que o `DELETE /admin/sessao` confirma. Se a chamada falhar, o cookie pode continuar valendo; a tela mostra o erro em vez de fingir que saiu.
- **Modo exemplo** simula a sessão do admin (qualquer e-mail, senha `exemplo`), com a mesma regra de 401/403, para o painel continuar navegável sem backend.

**Descartado:** checar sessão só no `EstruturaAdmin` (o login ficaria com menu lateral e a proteção dependeria de cada página nova ficar dentro dele sem estar explícito em `App.jsx`); tratar 401 em cada tela (cada página nova do painel teria de lembrar).

**Conflito conhecido:** o branch remoto `feature/aprovacao-produtos` (não mergeado) cria outro `src/services/adminService.js` (funções soltas `entrarAdmin`/`obterAdminAtual`/`sairAdmin`) e outro `Login.jsx`. No merge, fica a versão desta seção (objeto `adminService`, padrão dos outros services) e a página `Revisao` passa a usar `requisitarAdmin` e a entrar no grupo protegido.

## 12. Branch `feature/aprovacao-produtos` não entra como está (21/09/2026)

**Decidido:** a base do painel que fica é a da seção 11. Nada do branch remoto `feature/aprovacao-produtos` (commit `2f98f09`, do Rauhan) é mergeado como está: nem a tela `Revisao` / `revisaoService`, nem a mudança na `Home.jsx` que chama `catalogoService.produtosAprovados`. Três motivos:

1. **Rotas que não existem no backend.** `/admin/revisao/*` e `/produtos-aprovados` respondem 404: não estão em nenhum branch do backend, nem no contrato v1.0, nem em `para-o-frontend.md`. A tela não funciona contra a API real.
2. **404 na home da loja.** A `Home.jsx` dele chama `/produtos-aprovados` em toda visita e mistura o resultado com os destaques, engolindo o erro sem aviso. A loja passa a fazer uma chamada quebrada por visita.
3. **Valores soltos fora da paleta.** `Revisao.css` não usa nenhum `var(--token)`: hex fora das três cores oficiais (incluindo o vermelho `#9a4c43`), fontes que não existem no projeto (Cormorant Garamond, Manrope), `px` de espaçamento e tamanho, quebras de 900px e 520px. O `check:tokens` só passa ali porque não há `var()` para conferir.

Além disso, a base de acesso dele não tem rota protegida, não separa 401 de 403 e não trata a sessão de 12h (comparação completa na conversa de 21/09; conflito de merge sobre a base atual: `adminService.js`, `Login.jsx`, `App.jsx` e `DESIGN.md`, este só por fim de linha).

**Para a `Revisao` voltar:** o backend precisa ter as rotas (ou elas precisam estar acordadas com o time do backend), a tela precisa ser reescrita com tokens, os três estados e `requisitarAdmin`, entrar no grupo `<RotaAdminProtegida>` e sair da `Home` da loja. Aí o conflito se reduz à linha da rota e ao item de menu.

## 13. Cores: paleta no painel e filtro na vitrine (21/09/2026)

**Decidido:** cor virou vocabulário no backend (revisão 0007, branch `feat/cores` do backend; rotas no `docs/contrato-api-v1-adendo.json`, não no contrato v1.0). No frontend:

- **`/admin/cores`** (`src/paginas/admin/Cores.jsx`, `coresService` com `requisitarAdmin`): lista com contagem de peças (contando as ocultas), criar, renomear, esconder do filtro, excluir e uma gaveta "peças nesta cor". Dentro do grupo protegido.
- **Excluir cor em uso** é barrado duas vezes: a tela já mostra quantas peças usam a cor e desabilita o botão, e se a lista estiver velha o backend responde 409 `COR_EM_USO`, que a tela mostra. A saída sugerida é esconder a cor, que não mexe em peça nenhuma.
- **Renomear** reescreve o texto em todas as variações; o slug (a URL do filtro) só muda se for mandado, e a tela avisa que link antigo quebra.
- **Filtro de cor na vitrine** (`Listagem.jsx`): checkbox múltiplo com contagem, `?cor=slug1,slug2` na URL (OU entre as cores, como marca), entra no "Limpar filtros". A paleta vem de `GET /cores`, que só traz as ativas.

**Testado contra a API real (21/09):** criar ("Lilás Teste" → slug `lilas-teste`), editar (renomear mantendo o slug, esconder → some de `GET /cores`), excluir cor sem peça, excluir cor em uso (botão desabilitado; DELETE forçado → 409 com `totalProdutos: 774`, cor intacta), gaveta de peças e `/feminino?cor=preta,bege` (873 peças, igual à API).

**Limitação conhecida:** a gaveta "peças nesta cor" mostra só as 50 primeiras, sem paginação.

## 14. `/todos`: o catálogo inteiro no menu (21/09/2026)

**Decidido:** pedido do cliente. `/todos` é a `Listagem` em `modo="todos"`: `GET /produtos` sem filtro fixo, com todos os filtros da lateral (coleção, categoria, marca, cor) e os três estados da listagem. Entra no menu entre Marcas e Novidades — não vem da referência base44, que tem 8 itens.

**Conferido:** com 9 itens, o menu cabe numa linha na menor largura em que ele aparece inteiro (1241px; abaixo de 1240px vira gaveta). Três estados checados no modo exemplo (`?exemplo=lento|vazio|erro`).

## 15. Produtos no painel: listagem, dados, imagens, duplicar e a grade (22/09/2026)

**Decidido:** `/admin/produtos` (branch `feat/produtos-painel` do frontend, saindo de `feat/cores`), em duas rodadas no mesmo dia.

**Listagem (`Produtos.jsx`):** traz os ocultos, pagina por página (não por cursor), busca e filtros (marca, coleção, categoria, status) na URL, junto com a página. Trocar a coleção limpa a categoria. Três estados de sempre.

**Produto (`Produto.jsx`):**
- **Dados** (nome, descrição, marca, coleção/categoria, status, código): `PATCH` **parcial** — o formulário compara com o que veio da leitura e só manda o que mudou; `descricao` vazia vira `null` (apaga). **A "Coleção" do formulário é só filtro de tela**: o backend não tem `colecaoId` em criar/editar, só `categoriaId` (a categoria já diz a coleção); trocar a coleção troca as opções de categoria e limpa a escolhida, mas o que viaja é só `categoriaId`.
- **Criar** (`/admin/produtos/novo`, mesmo formulário): código opcional, o backend gera no padrão da marca. Ao criar, navega para a edição — é lá que imagens e variações entram.
- **Imagens:** acrescentar por URL (só https, máx. 10), excluir e reordenar (mover para cima/para baixo, sem arrastar — sem biblioteca de drag-and-drop no projeto). Reordenar manda a lista COMPLETA de ids; a de ordem 1 é a capa, marcada como tal na tela.
- **Duplicar:** botão na listagem (coluna de ações) e na tela do produto, os dois com o mesmo componente (`BotaoDuplicar`) e o mesmo modal de aviso — a cópia nasce **oculta e sem destaque**, e o modal diz isso antes de confirmar. Ao duplicar, navega para a cópia com um aviso na tela.
- **Grade de variações:** sem mudança nesta rodada (regra já registrada: `PATCH .../variacoes` substitui o conjunto inteiro, cor sempre com `corId` da leitura).
- **`ROTULO_STATUS`** (`Na loja`/`Esgotado`/`Oculto`) vive em `rotulosProduto.js`, não em `Produtos.jsx`: `Produto.jsx` e `Produtos.jsx` passaram a importar um do outro (`BotaoDuplicar`), e os rótulos num arquivo à parte evitam um import circular entre os dois.

**Modo exemplo (`npm run dev:exemplo`) ganhou as rotas do painel de produtos** (`servidorExemplo.js`): listar com todos os filtros, obter, criar, editar, duplicar, imagens (acrescentar/reordenar/excluir) e variações, mais `GET /admin/marcas`/`GET /admin/categorias`. Os produtos fixos de `catalogoExemplo.js` nunca são mutados — uma camada (`produtosPainel`, por id) guarda as edições, e os criados/duplicados vivem em `produtosCriados`, os dois no `localStorage`, no mesmo padrão de `coresExtras`. **A loja pública (`GET /produtos`, `GET /produtos/:codigo`) continua lendo só o catálogo fixo** — editar ou criar pelo painel no modo exemplo não aparece na vitrine simulada; é limitação conhecida, registrada em `docs/pendencias-frontend.md`.

**Testado contra o backend local (22/09):** criar um produto (marca, coleção, categoria — trocar a coleção limpou a categoria), três imagens, trocar a capa (mover para cima), excluir uma imagem (a que sobrou renumerou), duplicar (a cópia nasceu `oculto`, `destaque: false`, com as imagens copiadas com ids novos), editar só o status (`PATCH` mandou `{"status":"normal"}`, nada mais), limpar a descrição (`PATCH` mandou `{"descricao":null}`), código duplicado (409 `CODIGO_EM_USO` sob o campo) e URL de imagem sem https (400 do validador do Pydantic). Banco revertido ao fim (produtos de teste excluídos).

## 16. O botão passa a se chamar "Consultar valores no WhatsApp" e sai do cartão (21/09/2026)

**Decidido pelo cliente:** o botão de compra se chama **"Consultar valores no WhatsApp"** (esgotado continua "Consultar disponibilidade"), e **só aparece na página do produto**. O cartão da listagem fica com "Ver detalhes →", que agora aparece também no celular (antes ele sumia no celular para dar lugar ao botão). Substitui o nome da decisão 2; o fluxo pelo backend (decisão 3) não muda. O texto vem de `rotuloCompra()` em `components/Produto.jsx`, e o título do diálogo de compra acompanha.

**Não entrou, porque não foi pedido:** as contagens de peças em categorias e marcas e o texto do rodapé, que tinham sido tirados junto, voltaram.

## 17. Cartão de produto da grade sem "Valor confirmado" (22/09/2026)

**Decidido:** o `CartaoProduto` (grade de catálogo — usado em Home, Listagem, relacionados da página de produto e favoritos em Conta) não mostra mais a linha "Valor confirmado pelo atendimento.". O botão de compra já tinha saído do cartão na seção 16; esta rodada tira também o texto de valor, então o cartão passa a ter só marca, código, categoria e "Ver detalhes →" — a compra (texto e botão) fica reservada à página do produto.

**Por quê:** pedido direto do time, a partir de um print do cartão.

**Não mudou:** `src/contexto/CompraWhatsApp.jsx` e o fluxo pelo backend (seção 3) continuam do jeito que estavam.

## 18. Marcas e Categorias no painel (22/09/2026)

**Decidido:** `/admin/marcas` e `/admin/categorias` (branch `feat/painel-catalogo`, rebaseada sobre a main depois dos merges de produtos-painel/todos/botao-whatsapp), no mesmo padrão de `Cores.jsx`.

- **Marcas:** listagem com `totalProdutos` (contando ocultos), criar, editar (nome e slug — slug só muda se vier explícito no corpo, mesma regra de Cores) e excluir. Excluir com produtos é barrado na tela (botão desabilitado) e reforçado pelo 409 `MARCA_COM_PRODUTOS` do backend, com a contagem na mensagem.
- **Categorias:** mesmo CRUD, mas a coleção é escolhida na CRIAÇÃO e não muda depois (editar manda só nome/slug — trocar a coleção de uma categoria com produtos é 409 no backend, e a tela não expõe esse caminho). Listagem separada por coleção (`porColecao`, um bloco por `GET /colecoes`). O slug é único POR COLEÇÃO: "bolsas" existe em Feminino e Masculino como categorias diferentes, e o 409 `SLUG_EM_USO`/`CATEGORIA_COM_PRODUTOS` só dispara dentro da mesma coleção.
- **`catalogoAdminService` (que só tinha a leitura de marcas/categorias, provisório desde o Dia de produtos no painel) foi substituído por `marcasService` e `categoriasService`** — um service por domínio, no padrão do resto do projeto, com o CRUD completo. `Produto.jsx` e `Produtos.jsx` do painel foram atualizados para os services novos.
- Modo exemplo (`servidorExemplo.js`) ganhou o CRUD completo de marcas/categorias, incluindo `?exemplo=vazio` (antes só existia a leitura, sem respeitar os três estados).

**Testado contra o backend local (22/09):** criar marca, renomear mantendo o slug, excluir marca com produtos (barrado, 409 com a contagem), excluir marca vazia (funcionou); criar categoria "bolsas" na Feminina com slug explícito igual ao já existente (409 `SLUG_EM_USO` sob o campo) e criar "Vestidos" na Masculina com o mesmo slug que já existe na Feminina (funcionou — confirma que o slug é único por coleção, não global). Banco revertido ao fim (marca e categoria de teste excluídas).

## 19. Banners e Destaques no painel (22/09/2026)

**Decidido:** `/admin/banners` e `/admin/destaques` (branch `feat/painel-home`, saindo da main já com Marcas/Categorias), lidos de `docs/para-o-frontend.md` — "Painel administrativo — marcas, categorias e banners" (tarefa 57) e "— destaques e consultas" (tarefa 58).

- **Banners:** CRUD com `bannersService`, igual ao padrão de Marcas/Cores. `imagemUrl` obrigatória e só https (`imagemUrlMobile` também, quando vier); prévia ao vivo no formulário — um `<img>` ligado direto ao valor do campo, com o mesmo padrão de "sem foto" do resto do site. Teto de **4 banners ativos**: a quinta ativação (criar já ativo ou editar para ativo) volta 400 com `erro.campos.ativo`, mostrado como texto sob o checkbox — o formulário continua aberto, só o toggle falha. Reordenar (mover para cima/baixo, sem drag-and-drop) manda a lista COMPLETA de ids pra `PATCH /admin/banners/ordem`; a ordem vale para TODOS os banners, ativos e inativos juntos — só os ativos entram no carrossel da home, nessa ordem.
- **Destaques:** duas grades independentes na mesma tela — produtos (teto 12) e categorias (teto 8) — no mesmo padrão da grade de variações de `Produto.jsx`: carrega o estado atual, edita uma cópia local (adicionar, remover, reordenar) e manda tudo de volta com um botão "Salvar destaques" (mais "Descartar alterações", que aparece só quando há mudança pendente). **A leitura do estado atual vem de `GET /home`** (`catalogoService.home`, rota pública) em vez de inventar uma leitura administrativa que o contrato não tem — é exatamente o que a home mostra, já na ordem gravada. Adicionar produto é por busca (nome ou código, reaproveitando `produtosAdminService.listar`); adicionar categoria é por um `<select>` (a lista inteira cabe, não precisa de busca). `PATCH /admin/destaques/produtos|categorias` devolve só os ids gravados — a tela não precisa reler, já tem os dados completos no buffer local.
- **Produto oculto ou categoria inativa**: o backend recusa com 400 e os ids problemáticos vêm em `erro.detalhes.ocultos`/`erro.detalhes.inativas`. A tela cruza esses ids com o buffer local e marca a LINHA do item (borda e texto de erro), sem travar o formulário — dá pra remover só o item com problema e salvar de novo, sem perder o resto da edição.
- **`GET /home` no modo exemplo estava com dois bugs**, corrigidos nesta rodada: banners sempre vinham da lista fixa (ignorando ativo/inativo e a ordem gravada), e a grade de categorias em destaque sempre mostrava as 8 primeiras do catálogo fixo, sem checar o campo `destaque` — nenhum dos dois refletia o que o painel gravava. Agora os três (banners, destaques de produto, categorias em destaque) vêm de `bannersDoPainel`/`produtosDoPainel`/`categoriasDoPainel`, com os mesmos filtros e limites do backend real.

**Testado contra o backend local (22/09):** com o banco preparado (3 produtos e 6 categorias em destaque; banners existentes desativados) — criar 5 banners tentando ativar todos: os 4 primeiros ativaram, o 5º voltou "Já há 4 banners ativos." sob o checkbox, sem fechar o formulário; reordenar dois banners de teste (confirmado na tela); adicionar um 4º produto ao destaque (confirmado no banco: 4 ids gravados); remover o do meio (confirmado: os outros 3 continuaram, renumerados 1-3); buscar e tentar destacar um produto oculto — 400 com `erro.detalhes.ocultos`, item marcado na tela, buffer local preservado; mesmo teste com uma categoria trocada em Categorias em destaque. Home da loja conferida durante o teste: carrossel e "Escolhidas pela casa" refletiam exatamente o estado gravado, na ordem nova. Banco revertido ao fim (banners de teste excluídos, os 3 originais reativados; produtos e categorias em destaque devolvidos aos ids e à ordem originais) — conferido linha a linha contra o estado inicial.

## 20. Portão de acesso da loja e aba "Permissões de Acesso" (29/09/2026)

**Decisão do cliente:** o visitante é barrado por uma tela de e-mail, pede permissão, a equipe aprova ou recusa no painel; recusado pode pedir de novo, mas 3 recusas seguidas travam o pedido por 3 dias (uma aprovação zera a contagem).

- **Onde fica o portão:** dentro de `components/Estrutura.jsx`, o layout da loja. `/admin/*` é outra árvore em `App.jsx` e nunca passa por ele — a equipe entra no painel sem sessão de cliente, e é ali que se desliga o portão. Alternativa descartada: portão acima do `<Routes>`, que trancaria o painel junto.
- **Estado:** `contexto/AcessoLoja.jsx`, dentro do `ProvedorSessaoCliente` (reconsulta quando o cliente muda). O `apiClient` avisa o provedor de qualquer 403 `ACESSO_*` (`aoBarrarPeloPortao`); no `ACESSO_EM_ESPERA` o provedor grava `detalhes.bloqueadoAte` em vez de só mostrar a mensagem. Trancado, ele também reconsulta ao voltar para a aba e no instante em que a espera vence.
- **Fila trancada, sem F5:** o estado "pedido na fila" tem botão "Conferir de novo"; não há polling.
- **Painel:** `/admin/permissoes`. Modo e mensagem atuais vêm de `GET /acesso/estado` (não há GET administrativo). Recusar abre diálogo com motivo opcional e avisa da regra das 3 recusas.
- **Pendência de produto:** revogar o acesso de um aprovado grava uma recusa e conta nas 3. Separar exigiria campo novo no backend.
- **Abrir e fechar a loja pelo painel (20/10/2026).** Em 29/09 o backend passou a recusar `modo: "aberto"` (loja sempre fechada); a pedido do dono a equipe volta a abrir e fechar. O backend aceita `aberto` e `aprovacao` em `PATCH /admin/configuracao/acesso` (sem migração; a loja continua nascendo fechada). Em `/admin/permissoes` o bloco "Abertura da loja" mostra se está aberta ou fechada e um botão que troca, sempre com diálogo de confirmação (abrir expõe catálogo e preços a qualquer pessoa; fechar avisa quem continua entrando). O estado vem de `GET /acesso/estado` (não há GET administrativo), e depois de trocar o `ProvedorAcesso` é reconsultado. Abrir e fechar não muda a situação de ninguém: quem se identifica com a loja aberta nasce `aprovado` e continua entrando depois de fechar; só pendentes e recusados voltam a ser barrados. Alternativa descartada: cadastrar `pendente` mesmo com a loja aberta, para o fechamento trancar todo mundo — muda a regra de quem entra e fica para o cliente decidir.

## 21. Novidades: só os últimos 14 dias (29/09/2026)

**Decisão do cliente:** todo produto fica **no máximo 2 semanas (14 dias)** na página Novidades. Depois sai de lá e continua aparecendo nas categorias dele, em `/todos`, na busca e nas páginas de marca e coleção. Nada é apagado nem alterado no produto: é só um recorte por data.

- **Antes:** `/novidades` era `Listagem` em `modo="novidades"` chamando `GET /produtos` sem filtro, ou seja, igual a `/todos`.
- **Agora:** o backend ganhou `GET /produtos?novidades=true` (janela rolante de 14 dias sobre `criado_em`, sem coluna nova nem tarefa agendada; ver `docs/para-o-frontend.md` do backend). O `catalogoService.produtos` aceita `novidades` e a `Listagem` manda `novidades: true` no modo `novidades`, na primeira página e em "carregar mais". O filtro entra na chave que reinicia a lista. Nenhuma outra listagem muda.
- **Estado vazio de Novidades:** "Nenhuma novidade por enquanto." e "As novidades ficam aqui por duas semanas.", com a saída "Ver todas as peças" para `/todos` (mandar para `/novidades` seria um laço). O mesmo vale para o 404 genérico de `EstadoErro` e para o vazio das outras listagens: a saída deixou de ser "Ver novidades" e virou "Ver todas as peças".
- **Modo exemplo:** `catalogoExemplo.js` gera `criadoEm` relativo a hoje (de 3 em 3 dias) e o `servidorExemplo.js` entende `novidades=true`, então dá para ver produtos recentes e antigos. `?exemplo=vazio` mostra o estado vazio.
- **Limitação (backend):** a janela conta do `criado_em`; produto ocultado e reexibido depois de mais de 14 dias não volta a Novidades. Registrada em `docs/limitacoes-conhecidas.md` do backend.
- **Pendência:** outros estados vazios da loja (Home, Conta, Marcas, Seleção) ainda têm a saída "Ver novidades" para `/novidades`, que pode estar vazia. Não foram tocados nesta tarefa.
- **Saída manual (30/09/2026, pedido do dono):** `em_novidades` por produto (migração 0017, padrão `true`). `?novidades=true` = flag ligada E dentro dos 14 dias. Caixa "Colocar em novidades?" com botão "?" (`CampoNovidades.jsx`) na Revisão, na criação e na edição; "Remover das novidades" na lista de Produtos (`PATCH {emNovidades:false}`). "Realocar nas novidades" (`PATCH {emNovidades:true}`) aparece na lista nos produtos removidos, e a caixa na edição faz o mesmo. Realocar só devolve à página se o produto ainda estiver nos 14 dias.

## 22. Categoria escondida e categoria temática (30/09/2026)

- **`ativa` na tela de Categorias.** A tabela de cada coleção ganhou a coluna "Na loja" ("Aparece" / "Escondida", igual a Cores), com a linha escondida em tom suave. O formulário de criar e de editar tem a caixa "Mostrar na loja" (criar nasce marcada; editar só manda `ativa` no PATCH se mudou). Esconder tira a categoria do menu, dos filtros, dos destaques da home e do link direto; **não apaga o cadastro nem mexe nos produtos**, que continuam em `/todos`, busca, marca, novidades e nas outras categorias deles. Quando a categoria tem peças, o formulário avisa isso antes de salvar ("As N peças continuam no catálogo"). Não fizemos ação rápida na linha: esconder pede o aviso, e o aviso mora no formulário.
- **Categoria temática (verão, inverno) é categoria dentro das duas coleções**, não uma terceira coleção. Decisão assumida, **ainda a confirmar com a VIP Imports**; nenhuma migração, nenhuma coleção nova, nenhum contrato novo. Como um tema costuma existir nas duas coleções, o formulário de NOVA categoria tem "Criar também no [outra coleção]": duas chamadas `POST /admin/categorias`, a segunda com o mesmo nome, a mesma situação e o mesmo endereço da primeira. Se a segunda falhar, a primeira fica criada, a tela diz onde falhou e a lista recarrega. Só existe na criação.
- **Backend (ajustes desta tarefa, ver `docs/para-o-frontend.md` de lá):** o filtro `GET /produtos?colecao=&categoria=` passou a tratar categoria escondida como slug desconhecido; editar outros campos de um produto que já está numa categoria escondida não falha mais; categoria escondida não recebe produto novo (por destinos, por `categoriaId` nem em lote).

## 23. Hero da home: de crossfade a deslizar com arraste (30/09/2026)

- **Decisão.** A transição entre slides do hero deixa de ser crossfade (slides empilhados, opacity) e passa a **deslizar** (`translateX` por slide, relativo ao atual). Em tela de toque o slide **segue o dedo** (arraste, sem transição) e, ao soltar, assenta com a mesma curva `--curva-suave` ("vitrine") e `--duracao-lenta`. No celular as setas somem (a navegação é deslizar); contador e linha de progresso ficam. Zoom da foto, cascata do texto e progresso não mudam.
- **Motivo.** Pedido do dono em 30/09/2026.
- **Alternativa descartada.** Manter o crossfade: não responde ao dedo e destoa do gesto que o cliente espera num carrossel no celular.
- **Custo de tokens.** Nenhum token novo: reaproveita `--curva-suave` e `--duracao-lenta` (já zerada em `prefers-reduced-motion`). `DESIGN.md`, seção de Movimento, atualizada.

## 24. Feminino e Masculino viram o público do produto; categorias sem coleção (30/09/2026)

- **Decisão (caminho 1, pedido do dono).** As categorias deixam de pertencer a uma coleção e Feminino/Masculino passam a ser um campo do PRODUTO (`publicos`: `["feminino"]`, `["masculino"]` ou os dois = unissex). A tabela `colecoes` foi removida do banco (migração `0015_genero_no_produto` do backend); as duas coleções são constantes no código, com os mesmos ids (1 e 2) e slugs. `/feminino`, `/masculino`, `?colecao=` e `GET /colecoes` continuam existindo e funcionando como antes para a loja.
- **Aba Categorias do painel.** Uma lista só (sem blocos por coleção), com nome, endereço `?categoria=`, peças e "Na loja". "Criar também na outra coleção" saiu (não tem mais o que duplicar). O Nome ganhou `*` e a categoria não é criada sem ele. Substitui o que a seção 22 dizia sobre coleção e sobre "criar também"; o que ela diz de `ativa` (esconder) continua valendo.
- **Produto (painel e Revisão).** O formulário tem "Público" (caixas Feminino/Masculino, pelo menos uma) e "Categoria principal"; na edição dá para acrescentar até 4 categorias adicionais (temas, como "Coleção de verão"). Criar manda `categoriaId` + `publicos`; editar manda `categoriasIds` (a primeira é a principal) e `publicos` só se mudaram. `DestinosProduto.jsx` ficou com o valor `{ publicos, categoriasIds }`.
- **Loja.** `/categorias` segue mostrando as categorias por público, mas agora só as que têm peça naquele público. O cartão de categoria da home liga para `?categoria=` (a categoria em destaque não tem coleção). Um link `?categoria=` sozinho funciona.
- **Migração de dados.** Categorias de mesmo slug nas duas coleções foram fundidas em uma (fica a de menor id; produtos, destinos adicionais, destaque, imagem e situação migram junto). Produtos que estavam "nas duas coleções" (categoria adicional na outra) viraram unissex.
- **Como voltar (caminho 2).** O código está na branch `feat/genero-no-produto` dos dois repositórios; o `downgrade()` da migração é de melhor esforço, então o retorno seguro é restaurar o dump feito antes da 0015.
- **Fechado depois (mesmo dia).** A FK simples `produtos.categoria_id -> categorias.id` passou a ser criada pela migração; o `downgrade()` foi refeito (cópia da categoria no Masculino e unissex como adicional) e ensaiado num ciclo upgrade/downgrade/upgrade; os scripts de massa do backend (`gerar_massa`, `semear_taxonomia_real`, `limpar_massa_sintetica`, `medir_desempenho`, `importar_catalogo`) foram adaptados.

## 25. Cards da home: categoria no lugar de Feminina/Masculina (30/09/2026)

- **Pedido do dono.** Na home, os dois cards de coleção (Feminina e Masculina) podem ser substituídos por uma categoria, com a imagem que ele escolher. Em `/admin/categorias`, o formulário da categoria tem "Card Esquerda" e "Card Direita" (esquerda = no lugar da Feminina, direita = no lugar da Masculina).
- **Regras.** Cada lado tem UMA categoria: quem marcar toma o lugar de quem estava (o formulário avisa antes de salvar, e quem saiu perde a imagem do card). Uma categoria ocupa no máximo um lado (as duas caixas são excludentes). Sem imagem do card, vale a imagem da categoria; sem nenhuma, o card fica tipográfico. Categoria escondida (`ativa: false`) some do card mas guarda o lugar; ao reativar, volta.
- **Imagem.** URL `https://` ou envio de arquivo (mesmo `POST /admin/banners/upload` dos Banners), com prévia ao vivo. O formulário mostra a proporção recomendada: quadrada (1:1), ex. 1200 × 1200 px (no desktop o card é ~1:1; no celular fica mais largo que alto, então o assunto deve ficar no centro).
- **Clique.** O card da categoria leva a `/produtos?categoria=<slug>`. Sem categoria no lado, o card continua levando a `/feminino` ou `/masculino`.
- **Backend.** Migração `0016_card_home_categoria` (`categorias.card_home`, `card_home_imagem_url`, índice único parcial por lado); `GET /home` ganhou `cardsColecao` (na mesma consulta das categorias em destaque, o orçamento de 4 consultas continua). Registro em `docs/para-o-frontend.md` do backend.

## 26. Revisão: Reprovar, Atualizar produtos e link de origem (02/10/2026)

- **Reprovar com confirmação.** Cada cartão da Revisão tem "Reprovar" (estilo de link, longe do botão principal). Ele nunca reprova num clique: abre a janela "Reprovar este produto?" com o nome da peça, "Cancelar" (primeiro, é o foco) e "Sim, reprovar". Manda `POST /admin/revisao` com `status: 'rejected'` (o backend já aceitava); o item sai da fila e a decisão fica no PostgreSQL. Desfazer existe só na API (`DELETE /admin/revisao?produtoId=`), sem tela.
- **Atualizar produtos.** Botão na Revisão que puxa os álbuns novos da Yupoo (`POST /admin/revisao/atualizar`, andamento em `GET /admin/revisao/atualizacao`, consultado a cada 5 s). O backend roda `scripts/sync-yupoo.mjs ... --padrao` em segundo plano, uma coleta por vez. Não repete álbum: o script junta pelo id (`fornecedor-idDoÁlbum`) e a fila já esconde o que foi aprovado ou reprovado. Ao terminar com a tela aberta, a fila recarrega. Escolhido com o dono: Node dentro da API (a imagem ganhou Node e `data/` ficou gravável no compose; em produção é preciso reconstruir a imagem) e todos os fornecedores (os do `fornecedores-adicionais.json` mais os embutidos, como o qwer888, que não está no arquivo — listá-lo por link geraria o id `1234qwer888-…` e repetiria tudo).
- **Link de origem do produto.** `origemUrl` (coluna `produtos.origem_url`, que a aprovação já preenchia) passou a sair em `GET /admin/produtos` e no detalhe, e entra em `POST`/`PATCH /admin/produtos` (http/https; vazio apaga). Campo opcional "Link de origem" na criação e na edição; "Ver origem ↗" fica só na listagem do painel, ao lado de "Remover das novidades", nunca na loja. `linkDaOrigem` (acrescenta `uid=1`, que o Yupoo exige) mora em `src/lib/linkOrigem.js`.
- **Backend.** Duas branches, uma sobre a outra: `feat/origem-no-produto` e `feat/atualizar-produtos-yupoo`.


## 27. Preço interno do produto, só no painel (06/10/2026)

**Decisão (pedido do dono):** o dono registra o preço de cada peça só para consulta própria. A loja continua sem preço (seção "A loja não tem venda direta").

- **Onde:** campo "Preço (R$)" (`CampoPreco.jsx`) no cartão da Revisão (vai em `POST /admin/revisao` ao aprovar), no formulário de produto (criar e editar, o mesmo componente) e "Preço interno: R$ …" na lista de Produtos do painel.
- **Formato:** o backend guarda `precoCentavos` (inteiro, `null` = sem preço, 0 a 10.000.000). A tela aceita "1.234,50", "1234,5", "1.234" (milhar), "R$ 1.234,50", reescreve no formato certo ao sair do campo e recusa negativo, texto e valor acima de R$ 100.000,00 com mensagem. Conta só com inteiros (`src/lib/preco.js`).
- **Opcional:** vazio aprova e salva normalmente. No PATCH, vazio manda `null` e apaga; sem mudança, o campo nem viaja.
- **Nunca na loja:** nenhum componente da loja lê o campo; o modo exemplo só o guarda nas rotas de admin.
- **Alternativa descartada:** guardar em reais com vírgula flutuante (arredondamento) ou como texto.


## Pedidos sem histórico — 05/10/2026

Decisão do cliente: o rótulo "Fazer pedido" passa a "Encomendar" em toda a loja
e no painel. O histórico de pedidos sai da conta, do painel, das rotas e do
banco. `POST /selecoes` apenas gera `itens`, `mensagemWhatsapp` e `linkWhatsapp`
em memória (HTTP 200), sem id ou data e sem salvar o envio. A seleção em
andamento continua disponível. No resumo, o quarto contador passa a Clientes.
Não existem mais selecoesService.historico, selecoesAdminService, as páginas
admin/selecoes nem os campos selecoesNoMes e totalSelecoes. Esta decisão
substitui as referências anteriores ao histórico de seleções.

## 28. Pedidos voltam, com status (20/10/2026)

**Decisão (pedido do dono):** nova tela `/admin/pedidos` com os pedidos em andamento, finalizados e não finalizados, a quantidade de produtos, os produtos e os dados do cliente. Isto reverte, no painel e no banco, a seção "Pedidos sem histórico — 05/10/2026": a migração 0021 do backend recria `pedidos`/`pedido_itens`, e `POST /selecoes` passa a gravar o pedido. A conta do cliente continua sem histórico.

- **Status:** `em_andamento` (nasce assim), `finalizado` e `nao_finalizado`. Quem muda é a equipe, na própria tela; qualquer status vale para qualquer outro, para corrigir um clique.
- **Congelado:** peças e dados do cliente são cópia em texto do envio. Renomear um produto depois não muda o pedido.
- **Sem duplicar:** enviar a mesma seleção de novo enquanto o pedido está em andamento devolve o mesmo pedido.
- **Na tela:** filtro por status (com contagem de cada um, vinda do backend) e página na URL, cartão por pedido, três estados (carregando, vazio, erro). No modo exemplo, o envio da loja também gera pedido.
- **Alternativas descartadas:** só a tela com dados de exemplo (sem dado real); usar os checkouts do Mercado Pago como "pedidos" (não têm peças nem dados do cliente).
- **Privacidade:** o pedido guarda e-mail e telefone do cliente sem prazo e não há exclusão. Foi a escolha do dono; vale revisar quando houver política de retenção.

## 29. Degradê verde nas fotos de /categorias (22/10/2026)

- **Pedido.** As fotos dos cartões de categoria em `/categorias` levam o mesmo degradê verde dos dois cards de coleção da home (token `--degrade-sobre-foto`, de baixo para cima). O nome e a contagem de peças continuam abaixo da foto.
- **Como.** `FotoProduto` ganhou `degrade` (desenha `.vitrine-foto__degrade` só quando a foto existe; "Foto em breve" fica sem, como no card da home) e `CartaoCategoria` repassa a prop. Só `Categorias.jsx` passa `degrade`; a grade "Categorias" da home continua sem.

## 30. Imagem no painel só por arquivo: "Envie um arquivo" (22/10/2026)

- **Pedido.** Em todo lugar do painel que põe imagem no site, o campo de endereço da imagem (URL) saiu; no lugar dele fica um botão "Envie um arquivo". Vale para Banners (desktop e celular), a imagem da categoria e a do card da categoria (Categorias) e as imagens do produto (edição e criação). Substitui o "URL https:// ou envio de arquivo" da seção 25 e o "Endereço da imagem" da imagem da categoria (20/10). "Endereço na loja" (slug) e "Link de origem" não são imagem e continuam iguais.
- **Componentes** (`src/paginas/admin/CampoImagem.jsx`). `BotaoArquivo`: um `<button>` de verdade (`Button` variante `secundaria`, funciona com teclado) que abre o `<input type="file">` escondido; mostra "Enviando…" durante o envio. `CampoImagem`: rótulo, proporção, ajuda, botão, prévia e, no campo opcional, "Remover imagem" (antes era apagar o endereço); sobe pelo `POST /admin/banners/upload` e guarda a URL devolvida, então o corpo do `POST`/`PATCH` não mudou. `PreviaImagem` e `EnvioArquivo` saíram de `Banners.jsx` (o segundo deixou de existir).
- **Banner de celular** ganhou prévia: sem o endereço escrito, é o único jeito de ver que ele tem imagem.
- **Proporção recomendada em todo campo de imagem** (`ProporcaoRecomendada`, a mesma linha "Proporção recomendada: …" em todos). A prévia de cada campo usa a mesma proporção:

  | Imagem | Proporção | Exemplo | De onde vem |
  |---|---|---|---|
  | Banner (desktop) | 21:9, paisagem larga | 2100 × 900 px | o topo da home ocupa a largura toda com altura `--altura-hero` (460–720 px): de 2:1 a 8:3 nas telas comuns, cortado nas bordas (`object-fit: cover`) |
  | Banner (celular) | 2:3, retrato | 1080 × 1620 px | até 767px o mesmo topo fica perto de 2:3; sem esta imagem, o celular usa a de desktop cortada nas laterais |
  | Imagem da categoria | 1:1, quadrada | 1200 × 1200 px | o cartão de `/categorias` e da grade da home é quadrado (`object-fit: cover`) |
  | Card da categoria | 1:1, quadrada | 1200 × 1200 px | o card de coleção da home é quase quadrado no desktop e mais largo que alto no celular |
  | Produto | 4:5, retrato | 1200 × 1500 px | a vitrine (`.vitrine-foto`) é 4:5 com `object-fit: contain`: a foto entra inteira, sem cortar |

- **Produto.** Sobra "Texto alternativo" (preencha antes de enviar) e o botão. Continua com `capture` (no celular abre a câmera), como já era.
- **Modo exemplo.** `servidorExemplo.js` responde aos dois uploads com um `blob:` (vale só na aba; depois de recarregar, a prévia fica indisponível) e aceita `blob:` além de `https://` nas imagens.

## 31. Ações de lista do painel em desenho: lápis, lixeira e setas (22/10/2026)

- **Pedido.** Nas listas do painel, "Editar" virou um lápis, "Excluir" uma lixeira e "Mover para cima/baixo" setas. Vale para Banners, Categorias, Cores, Marcas e Produtos (lista), as imagens do produto (edição e criação) e as setas dos Destaques.
- **Componente** `src/paginas/admin/BotaoIcone.jsx` (`acao`: `editar`, `excluir`, `subir`, `descer`; com `para` vira `<Link>`). Desenhos novos em `components/Icones.jsx`: `IconeLapis`, `IconeLixeira`, `IconeSetaCima`, `IconeSetaBaixo`, no mesmo traço dos outros. Área de toque de 44px (`--altura-controle-compacto`), desenho de 20px, fundo creme ao passar o mouse.
- **O texto não sumiu**: `rotulo` vira `aria-label` (leitor de tela) e `title` (dica ao parar o mouse), com o nome do item — "Editar a categoria Bolsas", "Mover a imagem 2 para cima".
- **Setas sempre no lugar.** Antes, "Mover para cima" sumia na primeira linha; agora a seta fica apagada (desativada) na primeira e na última, para os ícones ficarem alinhados de uma linha para a outra.
- **Na lista de Produtos**, lápis e lixeira foram para o fim da linha, depois dos links de texto (Remover das novidades, Ver origem, Duplicar).
- **Ficaram em texto, de propósito:** "Excluir produto" no topo da tela do produto ganhou a lixeira ao lado do texto (é um botão grande ao lado de "Duplicar"); os botões de confirmação das janelas ("Excluir", "Excluir definitivamente") continuam texto; "Remover" dos Destaques só tira o item da lista (não exclui nada), então não leva lixeira; o "×" de tirar tamanho/cor da grade de variações continua igual.

## 32. Onda animada entre as seções da home (26/10/2026)

- **Pedido.** Uma onda em curva, em loop contínuo e lento, nas cores da marca, com degradê e bordas esfumaçadas, dividindo as seções da página inicial; parada para quem desativou as animações no sistema. A inspiração é o divisor da referência base44, sem o dourado dela.
- **Muda o `DESIGN.md`.** Até aqui ele dizia "não existe parallax nem onda decorativa" e "não crie onda ou gradiente animado". Agora a onda da home entra na lista de Movimento (48s, 72s e 120s linear, em loop) e as duas proibições valem para qualquer outra onda.
- **Onde.** Entre Destaques e Coleções e entre Categorias e Marcas, sempre na largura toda da tela. Não encosta nas faixas verdes (hero e CTA final), que já separam sozinhas. Cada uma sai adiantada da anterior (`fase`), para não parecerem cópia; `espelhada` também existe para isso. A onda entre Coleções e Categorias (a espelhada) saiu no mesmo dia, a pedido: acima de Categorias fica só o respiro normal da seção. Também no mesmo dia, a onda entrou na página do produto, acima da seção de sugestões, que passou de "Peças da mesma linha" a "Você Também Pode Gostar" (texto do pedido, com as maiúsculas); ela é desenhada junto com a seção e some quando não há sugestão. Ainda no mesmo dia, entrou em `/categorias`, entre Feminina e Masculina; para ir de ponta a ponta da tela, a página deixou de ter um `.container` só e cada bloco (cabeçalho e as duas seções) ganhou o seu. Coleções perdeu o `secao--proxima`: com a onda no meio, ela deixou de ser continuação dos Destaques.
- **Desenho** (`components/DivisorOnda.jsx`). Três faixas de SVG: a névoa (larga, bem desfocada, só creme), a faixa principal (engorda e afina ao longo do caminho, creme → verde → creme) e um fio fino (verde → creme). Verde na névoa ficou de fora: desfocado sobre o papel, vira cinza e parece sombra. As pontas somem no papel por máscara (`--mascara-onda`).
- **Por que não trava.** Cada SVG tem 200% da largura e um desenho que se repete na metade; a animação só desliza o SVG (`translateX` de 0 a −50%). O caminho e o desfoque são pintados uma vez e o resto é composição, fora da thread principal: nada de animar o `d` do caminho, que redesenharia a onda a cada quadro. Fora da tela a animação pausa (`IntersectionObserver`), e o caminho é calculado uma vez quando o módulo carrega.
- **Movimento reduzido.** Com `prefers-reduced-motion: reduce`, `animation: none`: a onda continua lá, parada.
- **A onda se completa com a rolagem** (pedido do mesmo dia). As três faixas ficam dentro de `.onda__desenho`, que ganha uma máscara com a ponta esfumaçada (`--mascara-onda-avanco`); o tamanho da máscara vai de 0 a 135% conforme a própria onda passa pela tela (`view-timeline` na `.onda`, `animation-range: entry 0% cover 50%`): começa quando ela entra pelo pé da tela e fica inteira quando o meio dela chega ao meio da tela. Rolar de volta desfaz. É CSS puro, sem JavaScript a cada rolagem. Fica dentro de `@supports (animation-timeline: view())` e de `prefers-reduced-motion: no-preference`: no Firefox (que ainda não tem) e com movimento reduzido, a onda aparece inteira, como antes. A timeline é nomeada na `.onda` porque o `overflow: hidden` dela faria um `view()` anônimo no filho medir a rolagem dentro da própria onda.
- **Tokens novos.** `--cor-onda-luz` (creme), `--cor-onda-corpo` (verde), `--mascara-onda`, `--altura-onda` (96–160px), `--margem-onda` (a onda avança meia `--espaco-secao` sobre o respiro de cada seção vizinha), `--duracao-onda-nevoa`/`-faixa`/`-fio` e `--atraso-onda`. A forma (amplitude, espessura, desfoque) fica no próprio componente, em unidades do SVG, como o desenho dos ícones.
- **Alternativas descartadas:** animar o `d` do caminho (repinta a cada quadro); fundo CSS repetido com `background-position` animado (também repinta); `<canvas>` (precisa de laço em JS na thread principal).

## 33. Cartões de produto e de categoria aparecem com a rolagem (26/10/2026)

- **Pedido.** Ao descer a tela, os produtos aparecem conforme a rolagem chega neles. No mesmo dia, o mesmo para as categorias.
- **Muda o `DESIGN.md`.** Ele proibia "cartões de produto aparecendo no scroll (nenhum fade-up na grade, porque a pessoa está lendo e comparando)". Para respeitar esse motivo, o efeito acontece uma vez só por cartão (rolar de volta não anima de novo) e o cartão que já está na tela quando a página abre não se mexe — a entrada da página continua levando a grade visível como um bloco só. Fade-up em texto corrido e em outros cartões continua proibido.
- **Como fica.** O cartão sobe 24px e ganha opacidade em 900ms `vitrine`; a fileira que entra junta aparece da esquerda para a direita, 90ms entre um e outro (`--atraso-cascata`), no máximo 5 passos. Dispara quando o cartão passa 8% acima do pé da tela.
- **Onde.** Em todo `CartaoProduto` (Destaques da home, listagens — inclusive o que entra por "Carregar mais peças" abaixo da dobra —, relacionados na página do produto e favoritos da conta) e em todo `CartaoCategoria` (grade "Categorias" da home e `/categorias`). Marcas e os dois cards de coleção ficam de fora.
- **Como** (`hooks/useAparecerNaRolagem.js`). Um `IntersectionObserver` só para a página toda. O cartão que monta abaixo da dobra ganha `data-aparece="espera"` (escondido — fora da tela, então nada pisca) e passa a `visivel` ao entrar; o estado vai direto no DOM, sem re-render do React. Só `opacity` e `transform` animam. O CSS é genérico, por `data-aparece`, em `global.css`: outro cartão só ganha o efeito se o time decidir e chamar o hook.
- **Movimento reduzido.** Com `prefers-reduced-motion: reduce` o hook não esconde nada, e o CSS força o cartão visível se a preferência mudar no meio da visita. Sem `IntersectionObserver`, o cartão também fica sempre visível.
- **Tokens novos.** `--duracao-aparece-rolagem` (900ms) e `--deslocamento-aparece-rolagem` (24px), os dois zerados com movimento reduzido.
- **Alternativa descartada:** um observador por cartão (dezenas na listagem) e cascata pela posição na grade inteira (o último cartão de 24 levaria mais de 2s para aparecer).

## 34. Carregador animado no lugar dos esqueletos da loja (26/10/2026)

- **Pedido.** Usar a animação do Lottie `https://lottie.host/5392a6eb-5b01-4a19-9c8c-5361f91c68be/zCkF8mMWg7.json` "sempre que o site estiver carregando", com as cores do site. Os cantos arredondados do original ficam (escolha do cliente, contra a regra "raio 0 ou círculo").
- **Muda o `DESIGN.md` e o `CLAUDE.md`.** Antes, carregando = esqueleto estático ("carregar não é evento"). Agora, na **loja**, carregando = carregador animado. O **painel** (`/admin`) continua com os esqueletos de `Estados.jsx`: são dezenas de usos e o pedido foi para "o site". Os três estados (carregando, vazio, erro) continuam obrigatórios.
- **A animação.** Três quadrados de canto arredondado: o da frente desliza para a direita, para, volta girando 90° e para de novo; os outros dois vêm 1 e 2 quadros atrás e desenham o rastro. Ciclo de 1875ms. As curvas de cada trecho foram copiadas do JSON, quadro a quadro. Cores: frente em verde, rastro em creme 72% sobre verde e em creme (no original eram verde-água, rosa e lilás).
- **Sem a biblioteca do Lottie.** Refeita em CSS (`components/Carregando.jsx` e `.css`). Só `translate` e `rotate` animam, então roda fora da thread principal e não pesa nada no download (o `lottie-web` são ~250 KB). Também deixa as cores como tokens, o que o JSON não permite.
- **Onde.** Abertura do site (`carregando` em `Estrutura` → `PortaoCarregando`, variante `tela`); home e produto (variante `pagina`, um carregador só por página); seções das listagens, `/categorias`, `/marcas`, relacionados, conta, favoritos e seleção (variante `bloco`); filtros da listagem, "Carregar mais peças", tamanhos e cores (seleção e janela de compra) e "Abrindo o WhatsApp…" (variante `compacto`). O botão "Consultar valores no WhatsApp" continua só com o texto.
- **Abertura sem tela branca e sem tranco.** O `index.html` tem a mesma marcação (`#carregador-inicial`), com o estilo do CSS do site, que no build entra no `<head>`: o carregador aparece antes do JavaScript. Ele fica por cima da página até a resposta do acesso e só então sai (`lib/carregadorInicial.js`, chamado pela `Estrutura` e pelo `ProvedorSessaoAdmin`). Por isso a animação não recomeça quando o React monta. Em `npm run dev` o CSS chega pelo JavaScript, então o texto aparece sem estilo por um instante; no build, não.
- **Sem piscar.** Fora da abertura, o carregador só aparece depois de 200ms (`--atraso-carregador`).
- **Movimento reduzido.** Os quadrados param, os de rastro ficam escondidos atrás do da frente e o texto "Carregando…" (até então só para leitor de tela) aparece ao lado.
- **Removidos:** `HeroEsqueleto` (home), `ProdutoEsqueleto`, `SelecaoEsqueleto` e o CSS `.hero__esqueleto*`. `Esqueleto`, `EsqueletoCartao` e `EsqueletoGrade` continuam em `Estados.jsx` para o painel.
- **Tokens novos.** `--cor-carregador-frente`/`-rastro`/`-rastro-fim`, `--raio-carregador` (32%), `--tamanho-carregador` (24px), `--tamanho-carregador-tela` (36px), `--tamanho-carregador-compacto` (10px), `--altura-carregador-bloco` (240px), `--camada-carregador`, `--duracao-carregador` (1875ms), `--atraso-rastro-carregador` (42ms) e `--atraso-carregador` (200ms).
- **Alternativas descartadas:** `lottie-web` ou `@lottiefiles/dotlottie-react` com o JSON recolorido (download pesado, cor fora dos tokens); um carregador por seção na home (quatro animações ao mesmo tempo para uma requisição só).

## 35. Sacola triste animada no estado de erro da loja (26/10/2026)

- **Pedido.** Usar a animação do Lottie `https://lottie.host/67693120-eb9f-42ea-91e5-d1e1994bc124/HvA383qTyW.json` "quando o site tiver algum erro".
- **A animação.** Uma sacola de compras que vira de cabeça para baixo: a alça (o furo da sacola de papel) vira uma boca triste e se desenha, aparecem dois traços de olho, a sacola fica assim por uns 2 s, a cara se apaga e ela volta ao lugar. Ciclo de 5005ms (150 quadros a 29,97 fps), em loop.
- **Sem a biblioteca do Lottie**, como o carregador (seção 34): refeita em SVG + CSS em `components/SacolaErro.jsx` e `.css`, com as coordenadas e as curvas do JSON. Traço que "se desenha" = `stroke-dashoffset` com `pathLength="1"`.
- **Cores.** O original tinha cara vermelha, contorno cinza, sacola cinza-clara e lado de dentro cinza-azulado. Ficou: círculo de fundo creme, sacola branca, lado de dentro em creme 72% sobre verde, contorno em verde 62% (`--cor-borda-forte`) e cara em verde. Sem vermelho, como manda a paleta.
- **Muda o `DESIGN.md`.** Ele dizia "no erro, o ícone de alerta vem antes do título. Nunca ilustração". Agora, na loja, a sacola entra no lugar do ícone; o resto do estado de erro (título, mensagem da API, "Tentar de novo", traço verde de 2px à esquerda) continua igual.
- **Onde.** `EstadoErro` ganhou a opção `sacola`, e as 8 chamadas da loja passam `sacola` (home, listagens, produto, sugestões, categorias, marcas, favoritos, seleção). Também na página 404 ("Esta página saiu da vitrine."). **Fica de fora:** o painel (continua com o ícone de alerta), o erro de campo de formulário e as mensagens curtas em linha (`ErroGeral`), em que uma animação de 120px não cabe.
- **Movimento reduzido.** A sacola fica parada no quadro que diz "erro": de cabeça para baixo, com a cara triste.
- **Tokens novos.** `--cor-sacola-fundo`, `--cor-sacola`, `--cor-sacola-dentro`, `--cor-sacola-contorno`, `--cor-sacola-rosto`, `--tamanho-sacola-erro` (120px) e `--duracao-sacola-erro` (5005ms).

## 36. Ilustração animada na página Sobre (26/10/2026)

- **Pedido.** Usar a animação do Lottie `https://lottie.host/c9e55681-1d3d-41ff-ac6d-14b252ccc278/L891TyIje4.json` na página Sobre, "de acordo com a paleta de cores".
- **O desenho.** Quatro pessoas em pé, lado a lado (uma com uma maleta), que piscam, mexem as sobrancelhas e a boca e acenam. 1920 × 1080, 60 fps, 151 quadros, em loop.
- **Com o `lottie-web` desta vez** (versão leve, `lottie-web/build/player/lottie_light`, fixada em 5.12.2). São 51 camadas com caminhos animados quadro a quadro: refazer à mão em CSS, como o carregador (seção 34) e a sacola (seção 35), não é viável. A biblioteca e o JSON entram por `import()` dentro do componente, então viram arquivos separados no build (≈47 KB e ≈39 KB comprimidos) e só quem abre o Sobre baixa; o resto do site não muda de peso. A versão leve não usa `eval`.
- **Cores pela claridade.** O JSON (em `src/assets/animacoes/sobre-equipe.json`, sem mudança) tem 24 cores: tons de pele, cabelo, roupa, contorno. Na hora de carregar, cada cor sólida vira um tom da rampa `--cor-ilustracao-escura` (verde) → `--cor-ilustracao-clara` (creme) → `--cor-ilustracao-luz` (branco), escolhido pela claridade (L*) da cor original: até L* 20 é verde; de 20 a 80, mistura de verde com creme; de 80 a 100, de creme com branco. Assim o que era escuro continua escuro e o que era claro continua claro, e as pessoas continuam diferentes entre si (inclusive no tom de pele), mas tudo em misturas das três cores oficiais, como os neutros do `tokens.css`. As cores vêm dos tokens, lidas com `getComputedStyle`; mudou o token, muda a ilustração.
- **Recorte.** O quadro original (1920 × 1080) tem muita sobra dos lados, e o desenho passa um pouco dele em cima e embaixo. O componente usa o quadro `RECORTE` (x 120, y −15, 1570 × 1110), medido somando todos os 151 quadros: o desenho vai de x 147 a 1658 e de y −9 a 1089. A primeira versão mediu só o primeiro quadro e cortava a mão da moça da esquerda quando ela acena (quadro 71); corrigido no mesmo dia. A proporção da caixa é o token `--proporcao-ilustracao-sobre` (1570 / 1110); mudou o recorte em `IlustracaoSobre.jsx`, mude o token, e meça de novo em todos os quadros.
- **Na página.** A partir de 1024px, duas colunas: o texto à esquerda (até 64ch) e a ilustração à direita, que acompanha a rolagem (`position: sticky` abaixo do cabeçalho). Abaixo disso, a ilustração vem antes do texto, com até 480px de largura.
- **Sem travar.** O `lottie-web` desenha cada quadro na thread principal, então a animação pausa fora da tela (`IntersectionObserver`) e o componente destrói a animação ao sair da página. Com `prefers-reduced-motion`, fica parada no primeiro quadro. Se a biblioteca ou o JSON falharem, a página fica só com o texto.
- **Acessibilidade.** Decorativa (`aria-hidden`): o conteúdo do Sobre é o texto.
- **Alternativas descartadas:** recolorir o JSON à mão e guardar as cores novas nele (cor fora dos tokens); `@lottiefiles/dotlottie-web` (renderizador em WASM e canvas, mais pesado); trocar cada tom de pele por um creme único (apagaria a diferença entre as pessoas).
