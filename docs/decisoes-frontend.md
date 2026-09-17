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
- **Link de contato geral** (rodapé, página Contato, "Falar no WhatsApp" do CTA): não existe rota pública com o número da loja. Por enquanto vem de `VITE_LINK_WHATSAPP_CONTATO` / `VITE_LINK_INSTAGRAM`, e vazio esconde o elemento. Isso **não** é o link da compra. Pendência em `pendencias-frontend.md`.
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
