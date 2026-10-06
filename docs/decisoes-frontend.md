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


## Pedidos sem histórico — 05/10/2026

Decisão do cliente: o rótulo "Fazer pedido" passa a "Encomendar" em toda a loja
e no painel. O histórico de pedidos sai da conta, do painel, das rotas e do
banco. `POST /selecoes` apenas gera `itens`, `mensagemWhatsapp` e `linkWhatsapp`
em memória (HTTP 200), sem id ou data e sem salvar o envio. A seleção em
andamento continua disponível. No resumo, o quarto contador passa a Clientes.
Não existem mais selecoesService.historico, selecoesAdminService, as páginas
admin/selecoes nem os campos selecoesNoMes e totalSelecoes. Esta decisão
substitui as referências anteriores ao histórico de seleções.
