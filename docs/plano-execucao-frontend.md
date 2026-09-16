# Frontend VIP Imports — plano até domingo (20/09)

Prazo: de hoje, terça 15/09, até domingo 20/09. Escopo: loja completa (catálogo, carrinho, WhatsApp) **e** painel administrativo completo. Time: Zé + Dev2 + Dev3, via Claude Code.

Repositório: `C:\Users\José\Desktop\No Fear\Frontend-VIP-IMPORTS` (vazio, só com README — repo real já existe no GitHub). Já tem `CLAUDE.md` e a skill `design-md-planner` (`.claude/skills/design-md-planner/`) commitados — o Dia 0 usa os dois.

Stack: React + Vite, sem framework de CSS pronto (CSS puro com variáveis, seguindo o padrão que o time já usa no frontend do MVP odonto). Roteamento com `react-router-dom`.

## Antes de tudo: backend local no ar

Toda a suíte roda contra a API real, não mock — o backend já está pronto e testado. Quem for programar a loja ou o painel precisa, na própria máquina, ter o `Backend-VIP-IMPORTS` rodando (`docker compose up -d`, ou o `.venv` + `uvicorn` como já está documentado lá) escutando em `localhost:8000`. O CORS do backend já libera `localhost:5173` (porta padrão do Vite) — não mude a porta do frontend sem avisar.

A fonte da verdade para qualquer dúvida de formato de request/response é `docs/para-o-frontend.md` e `docs/contrato-api-v1.json`, ambos dentro do repositório do backend. Todo prompt abaixo manda o Claude Code ler esses dois arquivos antes de codar — é mais confiável do que eu copiar as regras aqui e alguém copiar errado depois.

## Identidade visual (já confirmada, manual da marca por @mpandradecom)

Não tem designer externo entregando tela pronta — a tela é por conta do próprio time. O que já é fixo, e está documentado em `CLAUDE.md` do repositório:

- Paleta oficial, só estas três cores: `#FCEAB3` (creme), `#28361F` (verde), `#FFFFFF` (branco). **Não existe dourado** — qualquer palpite anterior de "dourado provisório" está descartado.
- Logo: wordmark "VIP" serifado + "IMPORTS" em versalete abaixo, três combinações de cor prontas (branco/verde, verde/creme, creme/verde), versão alternativa só com o "V" e um selo circular ("use vip imports") para redes sociais.
- Referência de inspiração de estrutura/layout/tom: https://vip-imports.base44.app/ — ver detalhes no `CLAUDE.md`. Não copiar o dourado que esse site usa como destaque; a paleta fica só nas três cores acima.

**Status da decisão estética (16/09):** a skill `design-md-planner` já rodou e gerou as direções estéticas; elas foram enviadas ao cliente e a escolha dele está pendente. Por isso o Dia 0 **não** gera o `DESIGN.md` ainda — ele cria o `tokens.css` como contrato de nomes com valores provisórios (ver passo 2). Nada trava esperando isso.

Quando o cliente responder, a mudança é contida: finalizar o `DESIGN.md` a partir da direção escolhida (retomando a skill do passo 2 em diante, com auditoria via `npx @google/design.md lint`) e substituir os VALORES em `src/styles/tokens.css`. Os nomes dos tokens não mudam, então nenhum componente precisa ser reescrito — é por isso que a regra de "nenhum hex solto dentro de componente" é inegociável neste projeto.

## Divisão de trilhas

- **Trilha A — Loja** (cliente final): home, listagens, produto, carrinho, identificação, favoritos, envio pelo WhatsApp.
- **Trilha B — Painel** (admin): login, produtos, imagens/variações, marcas/categorias/banners, destaques, resumo, seleções, clientes.

As duas trilhas só podem começar depois da fundação (Dia 0), porque dependem do mesmo cliente de API, dos mesmos tokens de design e dos mesmos componentes base — sem isso as duas trilhas duplicam trabalho ou colidem.

---

## Dia 0 — hoje, terça 15/09 (fundação — só uma pessoa, o resto trava nisso)

**Modelo recomendado: Claude Opus.** É a base que todo o resto empilha em cima — vale gastar mais raciocínio aqui para não ter que desfazer depois.

```
Contexto: estou começando o frontend da VIP Imports do zero, em
C:\Users\José\Desktop\No Fear\Frontend-VIP-IMPORTS (React + Vite). O
backend já está pronto em C:\Users\José\Desktop\No Fear\Backend-VIP-IMPORTS
(FastAPI, rodando em localhost:8000/api/v1). Antes de escrever qualquer
tela, leia docs/para-o-frontend.md e docs/contrato-api-v1.json dentro do
repositório do backend — é a fonte da verdade do formato de toda
requisição e resposta, incluindo os desvios do contrato original. Leia
também o CLAUDE.md deste repositório, que já documenta a identidade
visual da marca (paleta e logo) e a referência de inspiração.

Monte a fundação do projeto, sem nenhuma tela de produto ainda:

1. Scaffold Vite + React (npm create vite@latest . -- --template react),
   com react-router-dom instalado. .gitignore cobrindo node_modules/,
   dist/, .env. .env.example com VITE_API_URL=http://localhost:8000/api/v1.

2. Design system: use a skill design-md-planner (.claude/skills/
   design-md-planner/) para gerar DESIGN.md na raiz do projeto. A paleta
   (#FCEAB3, #28361F, #FFFFFF) e o logo já são fixos — trate como
   restrição, não escolha cor nova. Não há tela de designer pronta pra
   codificar, então é modo entrevista (greenfield) pro resto: tipografia
   de UI, escala, espaçamento (base de 4px), raio de borda, sombra de
   card, e a "sensação no primeiro segundo" da loja (pode perguntar pra
   mim se precisar de uma decisão que eu não dei ainda). Audite com
   npx @google/design.md lint até fechar sem erro nem aviso (ou um
   `omitted` com razão, se algum aviso genuinamente não se aplicar).
   Só depois de fechar o DESIGN.md, traduza os tokens dele para
   src/styles/tokens.css. Um src/styles/global.css que importa os
   tokens e define reset básico + classes reutilizáveis para os três
   estados de tela (carregando/vazio/erro) que toda listagem vai usar.

3. Cliente de API único em src/lib/apiClient.js: função central que
   monta a URL com VITE_API_URL, manda credentials:"include" (a sessão
   viaja por cookie, cliente e admin são cookies diferentes e
   independentes), e trata o envelope de erro do contrato
   (erro.codigo/mensagem/campos/detalhes) como uma classe ErroApi, lendo o
   cabeçalho X-Rastreio nos erros 500 (não vem no corpo). Nenhuma tela
   deve chamar fetch diretamente — tudo passa por aqui.

4. Um arquivo de service por domínio em src/services/: catalogoService
   (home, produtos, produto por código, relacionados, marcas, coleções,
   categorias da coleção), clienteService (identificar, eu, atualizar eu,
   sair), carrinhoService (obter, adicionar, trocar variação — PATCH troca
   o PAR INTEIRO de variacaoTamanhoId/variacaoCorId, nunca um campo só —,
   remover, migrar), favoritosService, selecoesService (enviar, histórico).
   Cada função corresponde a uma rota do contrato — confira os nomes e
   parâmetros exatos no docs/contrato-api-v1.json.

5. Componentes base em src/components/ui/: Button (variantes primária/
   secundária/texto), Field (input com label e erro), Card, Modal. Um
   utilitário cn.js para juntar classes condicionalmente. Todos usando só
   os tokens do passo 2, nenhuma cor solta no meio do componente.

6. Esqueleto de rotas em src/App.jsx com react-router-dom: "/", "/produto/
   :codigo", "/marcas/:marca", "/categorias/:categoria", "/colecoes/:slug",
   "/carrinho", "/favoritos", e um grupo "/admin/*" separado (login,
   produtos, marcas, categorias, banners, destaques, resumo, seleções,
   clientes) — todas as páginas por enquanto só precisam existir como
   componente vazio com o nome da rota, sem conteúdo real ainda. Um
   Header e um Footer básicos (podem ser só a estrutura, sem estar
   bonitos ainda) já ligados no layout.

7. Confirme que `npm run dev` sobe sem erro, que `npm run build` funciona,
   e que uma chamada de teste do home (`catalogoService.home()`) contra o
   backend local realmente devolve dado — cole a resposta.

Ao final, rode `git add`, `git status` e mostre a lista de arquivos antes
de qualquer commit — não commite sozinho, eu confirmo antes.
```

Depois de revisar e commitar esse dia, as duas trilhas abaixo podem rodar em paralelo a partir de amanhã.

---

## Dia 1 — quarta 16/09

### Trilha A — Loja (Dev2)

**Modelo recomendado: Claude Sonnet.**

```
Leia src/lib/apiClient.js, src/services/catalogoService.js e
docs/para-o-frontend.md (no repositório do backend) antes de começar.

1. Header fixo: logo à esquerda, navegação no centro (Feminino,
   Masculino, Categorias, Marcas, Novidades — os 8 itens do menu como no
   plano de execução), ícones de conta/busca/carrinho à direita, item
   ativo sublinhado. No mobile vira ícone de três linhas com o menu em
   painel lateral ou dropdown.

2. Uma página de listagem reutilizável (não cinco páginas duplicadas):
   recebe os filtros (marca/categoria/coleção) e busca em
   catalogoService.listarProdutos, respeitando a paginação por cursor do
   contrato (nunca traga tudo de uma vez). Os filtros escolhidos vão para
   a URL (query string), para o link ser compartilhável e o botão voltar
   funcionar.

3. Card de produto: foto com ALTURA FIXA e fundo cinza claro, imagem
   ajustada para caber sem distorcer (object-fit: contain ou cover,
   decida olhando como ficam as fotos reais) — nunca deixe o card se
   adaptar ao tamanho da foto, senão a grade desalinha. Mostra foto,
   marca, código, categoria e a frase "Valor confirmado pelo atendimento"
   no lugar do preço (não existe preço em lugar nenhum do catálogo).

4. Barra de filtros: marca, categoria, tamanho, combináveis, sincronizada
   com a URL da listagem do passo 2.

Ao final, mostre a tela rodando com produtos reais do backend local (não
invente dado).
```

### Trilha B — Painel (Dev3)

**Modelo recomendado: Claude Sonnet.**

```
Leia src/lib/apiClient.js, src/services/clienteService.js e a seção
"Painel administrativo — acesso" de docs/para-o-frontend.md (no
repositório do backend) antes de começar.

1. Tela de login do painel (POST /admin/sessao): e-mail e senha. Falha
   sempre devolve a MESMA mensagem ("E-mail ou senha inválidos") — não
   tente diferenciar e-mail inexistente de senha errada, o backend não
   distingue de propósito.

2. Contexto de sessão do admin: ao abrir qualquer rota /admin/*, chama
   GET /admin/eu. 401 manda para o login; 403 (sessão é de CLIENTE, não
   de admin) mostra mensagem própria, não manda para o login do painel.
   A sessão dura 12h e NÃO renova sozinha — trate 401 em qualquer chamada
   do painel como "sessão acabou", sempre.

3. Layout do painel: navegação lateral ou superior própria, separada da
   loja (o cookie do painel é vip_sessao_admin, completamente
   independente do vip_sessao_cliente — os dois convivem no mesmo
   navegador).

4. Rota protegida (componente wrapper) que qualquer página /admin/* usa
   para exigir sessão válida antes de renderizar.

Ao final, mostre o login funcionando contra um admin real criado com
scripts/criar_admin.py no backend (ou peça pra eu criar um se não
existir).
```

---

## Dia 2 — quinta 17/09

### Trilha A — Loja

**Modelo recomendado: Claude Opus** (a lógica de carrinho com par de variações e migração tem detalhes finos que valem mais raciocínio).

```
Leia docs/para-o-frontend.md, seções sobre carrinho e variações, antes de
codar.

1. Página de produto: galeria de fotos (a de ordem 1 é a capa — mas o
   detalhe do produto já traz "imagens" completo e ordenado, não filtre
   de novo), nome, marca, código, descrição, seletor de tamanho e de cor
   (são dois seletores independentes, cada um opcional), botão de
   adicionar ao carrinho, produtos relacionados no fim.

2. Carrinho: listar (GET /carrinho), adicionar (produtoId +
   variacaoTamanhoId + variacaoCorId, os dois últimos opcionais), trocar
   variação (PATCH manda o PAR INTEIRO sempre, nunca um campo só — se só
   o tamanho mudou, ainda assim mande variacaoCorId de novo), remover.
   Não existe quantidade: mesmo produto com o mesmo par não duplica.
   Se a troca colidir com um item que já existe, o item alterado some —
   recarregue com GET /carrinho em vez de confiar no id antigo.

3. Identificação por e-mail (sem senha): POST /clientes/identificar
   sempre responde 200, não ramifique por "conta nova" vs "conta
   existente". Logo depois de identificar, se havia carrinho anônimo no
   localStorage, chama POST /carrinho/migrar com os itens salvos e
   mostra os "ignorados" da resposta ("2 itens não estão mais
   disponíveis") em vez de sumir com eles.

Peça pra eu conferir a página de produto com um código real do banco de
desenvolvimento antes de considerar pronto.
```

### Trilha B — Painel

**Modelo recomendado: Claude Opus** (a grade de variações e a reordenação de imagens têm regras de "substitui o conjunto inteiro" fáceis de implementar errado).

```
Leia a seção "Painel administrativo — produtos" e "— imagens e
variações" de docs/para-o-frontend.md antes de codar.

1. Listagem de produtos do painel: traz OCULTOS junto (ao contrário da
   loja), filtros por busca/marca/categoria/status, paginação POR
   PÁGINA (não cursor — é diferente da loja aqui).

2. Formulário de criar/editar produto. Campo "código" é opcional na
   criação (o backend gera sozinho). PATCH: campo ausente não muda,
   null em descrição apaga.

3. Duplicar produto: avise na tela que a cópia nasce OCULTA — quem
   duplicar e for procurar vai achar que sumiu se não souber disso.

4. Gestão de imagens: acrescentar por URL (só https, máximo 10),
   reordenar mandando a LISTA COMPLETA de ids na ordem nova (lista
   parcial é erro), excluir. A imagem de ordem 1 é sempre a capa.

5. Grade de variações: PATCH que SUBSTITUI o conjunto inteiro. A tela
   tem que carregar a grade atual do produto, deixar editar, e mandar de
   volta INTEIRA sempre — nunca só a variação que mudou, ou as outras
   somem e quem tinha aquele tamanho no carrinho perde a escolha.

Peça pra eu conferir o fluxo de criar produto → adicionar imagem →
definir variações contra o backend local antes de considerar pronto.
```

---

## Dia 3 — sexta 18/09

### Trilha A — Loja

**Modelo recomendado: Claude Sonnet.**

```
1. Envio da seleção: botão que chama POST /selecoes e abre o
   linkWhatsapp que já vem pronto na resposta (não monte a URL, não
   guarde número de telefone no frontend). NÃO esvazie o carrinho depois
   — se a pessoa fechar o WhatsApp sem mandar, a seleção não pode sumir.

2. Favoritos: listar, adicionar, remover.

3. Três estados em TODA tela que busca dado: carregando (esqueleto
   cinza, nunca tela branca), vazio (mensagem + sugestão de limpar
   filtros, quando aplicável), erro (mensagem + botão de tentar de
   novo). Use as classes já definidas em global.css.

4. Lazy loading de imagens (loading="lazy" nas fotos de produto fora da
   dobra, no mínimo).

5. Responsividade: confira a listagem, o produto e o carrinho em largura
   de celular (~375px), não só desktop.
```

### Trilha B — Painel

**Modelo recomendado: Claude Sonnet.**

```
Leia a seção "Painel administrativo — marcas, categorias e banners" e
"— destaques" de docs/para-o-frontend.md antes de codar.

1. CRUD de marcas e categorias: mostre totalProdutos ANTES do botão de
   excluir (excluir com produtos vinculados dá 409 com a contagem —
   trate esse erro mostrando a mensagem, não como erro genérico).
   Categoria: slug é único por COLEÇÃO, não global.

2. CRUD de banners: máximo 4 ATIVOS (a 5ª ativação é 400 — mostre a
   mensagem de limite, não deixe a tela travar). Reordenação manda a
   lista completa de ids, igual às imagens do produto.

3. Destaques (produtos e categorias na home): SUBSTITUEM o conjunto
   inteiro — a tela precisa carregar a lista atual, deixar reordenar/
   adicionar/remover, e mandar de volta inteira. Teto de 12 produtos e 8
   categorias. Produto oculto ou categoria inativa são recusados — os
   ids problemáticos vêm em erro.detalhes, marque-os na tela.
```

---

## Dia 4 — sábado 19/09

### Trilha B — Painel

**Modelo recomendado: Claude Sonnet.**

```
Leia a seção "Painel administrativo — destaques e consultas" de
docs/para-o-frontend.md.

1. Resumo/dashboard: totalProdutos, produtosEsgotados, produtosOcultos,
   porMarca, selecoesNoMes, totalClientes — os números da tela inicial
   do painel.

2. Seleções recebidas: lista (mais recentes primeiro) e detalhe. Os
   itens são dado CONGELADO (nome/marca/variação como estavam no
   envio) — se o produto foi excluído depois, produtoId vem null; não
   esconda o item nem tente buscar por esse id.

3. Clientes: lista com busca por nome/e-mail, mostrando totalSelecoes e
   telefone (é o painel, faz sentido aparecer aqui).
```

### Trilha A + B juntas

Depois que as telas acima estiverem prontas, façam uma passada cruzada: mude um destaque, um banner e a visibilidade de um produto pelo painel, e confiram ao vivo que a loja (rodando ao lado) reflete a mudança sem precisar de truque nenhum — é o mesmo backend, então deveria "só funcionar", mas é o tipo de coisa que só aparece testando as duas pontas juntas.

---

## Dia 5 — domingo 20/09 (fechamento)

Sem prompt de código novo — é revisão, o dia inteiro:

1. Suba o backend local do zero (`docker compose up -d` ou equivalente) e rode a loja e o painel inteiros contra ele, sem nenhum dado inventado.
2. Confira os três estados (carregando/vazio/erro) em cada tela que busca dado — é o detalhe que "quase ninguém faz e todo cliente percebe", segundo o próprio plano de execução.
3. Teste em largura de celular (~375px) a loja inteira.
4. `npm run build` sem erro.
5. Releia `docs/para-o-frontend.md` como checklist: confirme que nenhuma tela ignora os avisos de "substitui o conjunto inteiro" (variações, destaques, ordem de imagens/banners) — é o bug mais fácil de cometer e mais destrutivo se passar.
6. Reunião rápida do time: o que ficou de fora (se algo ficou) vira uma lista curta para depois — não trava a entrega por causa disso.

---

## Depois de sexta/domingo

DevOps (apontar o domínio, subir o build de produção na VPS) fica para depois, como combinado — não faz parte deste plano.
