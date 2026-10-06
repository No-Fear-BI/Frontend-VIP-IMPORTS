# VIP Imports — Frontend

Loja virtual em catálogo para o cliente VIP Imports. React + Vite, CSS puro com variáveis (sem Tailwind). Código, nomes de variável e de rota em português, como no backend.

## Identidade visual (manual da marca, feito por @mpandradecom)

Paleta oficial — só estas três cores, nenhuma outra:

- `#FCEAB3` — creme (cor de fundo clara, papel de etiqueta)
- `#28361F` — verde (cor de fundo escura, dominante na marca)
- `#FFFFFF` — branco

**Não existe dourado na paleta oficial.** Qualquer menção anterior a um "dourado provisório" era palpite e está descartada — nas fotos de aplicação da marca (sacola, etiqueta, fachada) o que parece dourado é reflexo de luz do mockup, não uma quarta cor definida no manual.

Logo: wordmark "VIP" em serifada display (o V com o traço esquerdo mais fino, caindo em bico), "IMPORTS" abaixo em versalete sem serifa bem espaçado, separado por uma linha fina. Três combinações de cor prontas: branco sobre verde, verde sobre creme, creme sobre verde — não inventar uma quarta combinação. Existe uma versão alternativa só com o "V" solto (sem "IMPORTS"), e um selo circular com "use vip imports" repetido ao redor do V — para uso em redes sociais/carimbo, não como logo principal de cabeçalho.

Isso é insumo fixo para a skill `design-md-planner` (abaixo) — ela deriva tipografia de UI, escala, espaçamento e tokens semânticos em cima destas cores e deste logo, não escolhe cor nova.

## Referência de inspiração: https://vip-imports.base44.app/

O site queria que o Claude Code use como inspiração de estrutura, layout e tom — não como fonte de cor nova. O que reaproveitar dali:

- Header: os mesmos itens de menu do plano (Início, Feminino, Masculino, Categorias, Marcas, **Todos**, Novidades, Sobre, Contato) + ícones de conta/busca/carrinho à direita. "Todos" (`/todos`, o catálogo inteiro) foi pedido pelo cliente em 21/09/2026 e não vem da referência.
- Hero em carrossel na home, com legenda pequena versalete acima de um título serifado grande.
- Seção de produtos isolados sobre fundo neutro (sem card, sem sombra pesada) — várias peças flutuando, foto limpa.
- Dois banners grandes lado a lado para "Coleção Feminina" / "Coleção Masculina": foto de fundo cheia, texto sobre gradiente escuro, link sublinhado versalete.
- Grade de categorias em destaque: foto quadrada + nome da categoria (serifado) + gênero (versalete cinza pequeno) abaixo.
- Cartão de produto: marca em versalete cinza pequeno, "Código X030" como título serifado, categoria, "Valor confirmado pelo atendimento." no lugar do preço, link "Ver detalhes →" (sem botão de compra no cartão) — é exatamente o padrão que já está descrito no Dia 2 do plano (loja), esse site já implementa.
- Grade de marcas: cartões simples com borda fina, nome centralizado.
- Seção final de CTA com dois botões (ação primária + "Falar no WhatsApp") antes do footer.
- Footer: colunas de coleções / navegação / contato, com WhatsApp e Instagram.

**Não copiar a cor de destaque dourada/mostarda** que esse site usa nos botões e nos divisores — decidido: a paleta fica só nas três cores oficiais do manual de identidade (`#FCEAB3`, `#28361F`, `#FFFFFF`). Onde esse site usa dourado, resolva com uma das três cores oficiais (ex: creme ou um tom derivado do verde) — é trabalho da skill `design-md-planner` decidir qual, não do palpite de quem estiver codando a tela.

## Antes de construir qualquer tela

Não tem designer externo entregando tela pronta — a tela é por conta do próprio time. Por isso:

1. **`src/styles/tokens.css` é um CONTRATO DE NOMES.** Os nomes são definitivos; os valores seguem o `DESIGN.md` na raiz — a direção visual "Vitrine Reservada" é definitiva desde 17/09/2026 (ver "Decisões já tomadas" abaixo). A skill `design-md-planner` só roda de novo se o time decidir reabrir a direção visual — não é o caso agora. Se um dia isso mudar, a skill gera um `DESIGN.md` novo e só os VALORES de `tokens.css` mudam — nenhum nome, nenhum componente.
2. **Nenhum componente escreve valor solto**: nada de hex, rgb(), px de espaçamento, tamanho ou família de fonte, duração. Tudo é `var(--token)`. Falta um valor? Crie o token em `tokens.css`, nomeado pela função (`--cor-borda`), nunca pela aparência (`--verde-escuro`). Única exceção: os pontos de quebra das media queries (480px, 767px, 1023px, 1240px), porque CSS não aceita `var()` em `@media`.
3. `design/` é opcional — só existe se alguém do time fizer um esboço/wireframe próprio de uma tela (ver `design/README.md`). Sem esboço, a estrutura da tela vem do contrato de API e a aparência vem dos tokens.

## Decisões já tomadas — não reabra sem falar com o time

Registro completo, com o porquê e as alternativas descartadas, em `docs/decisoes-frontend.md`. O que está pendente fica em `docs/pendencias-frontend.md`. Resumo:

- **Direção visual: definitiva desde 17/09/2026 — "Vitrine Reservada".** Foi construída em 15/09, suspensa em 16/09 e retomada como definitiva em 17/09 (registro completo em `docs/decisoes-frontend.md`, seção 1). O `DESIGN.md` na raiz é a fonte de verdade; `docs/propostas/DESIGN-opcao-1-vitrine-reservada.md` é o retrato da proposta original, não importe de lá. A opção 2 (Luxo minimalista) existe só em `docs/comparacao/`, descartada.
- **A loja não tem venda direta.** Não existe preço, checkout ou "Adicionar ao carrinho". Todo botão de compra diz **"Consultar valores no WhatsApp"** ("Consultar disponibilidade" se `status === 'esgotado'`), e ele fica só na página do produto: o cartão da listagem leva a ela por "Ver detalhes →". Nome definido pelo cliente em 21/09/2026 (antes era "Comprar no WhatsApp"); o texto sai de `rotuloCompra()` em `components/Produto.jsx`. No texto, o carrinho do backend se chama **"seleção"**.
- **"Consultar valores no WhatsApp" passa pelo backend** (`src/contexto/CompraWhatsApp.jsx`): escolhe tamanho/cor (opcionais) → identifica por e-mail se não houver sessão → `POST /carrinho` → se a seleção já tinha outras peças, pergunta "só esta" ou "todas juntas" → `POST /selecoes` → abre o `linkWhatsapp` que o backend devolve. **Nunca monte link `wa.me` de compra no frontend nem guarde o número da loja aqui.**
- **Portão de acesso (modo aprovação, backend seção 05).** Com o modo em `aprovacao`, quem não foi liberado não vê a loja: `<Estrutura>` troca tudo pela tela de bloqueio (`components/PortaoAcesso.jsx`, cinco estados: e-mail, nome+telefone, na fila, recusado que pode pedir de novo, recusado em espera) enquanto `GET /acesso/estado` disser `podeNavegar: false`. O estado mora em `contexto/AcessoLoja.jsx` (reconsulta ao identificar/sair, em 403 `ACESSO_PENDENTE`/`ACESSO_RECUSADO`, e grava `bloqueadoAte` do 403 `ACESSO_EM_ESPERA`). **O portão cobre só a loja: `/admin/*` fica fora de `<Estrutura>` de propósito** — é do painel (`/admin/permissoes`, "Permissões de Acesso") que a equipe liga/desliga o modo e decide a fila. 3 recusas seguidas = 3 dias sem poder pedir (regra do backend; revogação de acesso conta como recusa, limitação aceita).
- **Novidades = últimos 14 dias (decidido em 29/09/2026 com o cliente).** Todo produto fica no máximo 2 semanas em `/novidades`; depois só nas categorias, `/todos`, busca, marca e coleção. É um recorte por data no backend (`GET /produtos?novidades=true`, janela rolante sobre `criado_em`); nada do produto muda. `Listagem` em `modo="novidades"` manda o filtro na primeira página e em "carregar mais". Estado vazio: "Nenhuma novidade por enquanto" com saída para `/todos` (nunca para `/novidades`). Registro em `docs/decisoes-frontend.md`, seção 21. **Saída manual (30/09/2026):** cada produto tem `emNovidades` (padrão `true`; coluna `em_novidades`, migração 0017). `/novidades` mostra quem tem a flag E está nos 14 dias. A caixa "Colocar em novidades?" (com botão "?" que explica a regra, `paginas/admin/CampoNovidades.jsx`) aparece na Revisão ("…ao permitir?"), na criação e na edição do produto; em Produtos, "Remover das novidades" faz `PATCH {emNovidades:false}` nos que ainda estão na janela, e "Realocar nas novidades" (`PATCH {emNovidades:true}`) aparece nos que foram removidos.
- **Revisão do painel (02/10/2026).** "Reprovar" pede confirmação numa janela (nunca num clique só). "Atualizar produtos" puxa os álbuns novos da Yupoo pelo backend (`POST /admin/revisao/atualizar`, andamento em `GET /admin/revisao/atualizacao`; sem repetir álbum, o script junta pelo id). `origemUrl` do produto: campo opcional na criação/edição e "Ver origem ↗" só na listagem do painel, nunca na loja. Registro em `docs/decisoes-frontend.md`, seção 26.
- **Não existe carrinho anônimo.** Só entra peça na seleção pelo fluxo acima, que já identifica o cliente. Por isso a loja não usa `carrinhoService.migrar` (`POST /carrinho/migrar`).

## Como o código está organizado

- `src/lib/apiClient.js`: o único `fetch` do projeto (envelope de erro → `ErroApi`, `X-Rastreio` nos 500). `src/lib/apiAdmin.js`: `requisitarAdmin`, o `requisitar` das rotas do painel — avisa a sessão do painel quando qualquer chamada volta 401 (sessão de 12h acabou) ou 403 (sessão de cliente). `src/lib/cn.js`: junta classes condicionalmente.
- `src/services/`: um service por domínio, um método por rota, com o `handler` do contrato no comentário — `catalogoService` (home, produtos, produto, relacionados, marcas, cores, colecoes, categoriasDaColecao), `clienteService` (identificar, eu, atualizarEu, sair), `carrinhoService` (obter, adicionar, trocarVariacao, remover, migrar), `favoritosService` (listar, adicionar, remover), `selecoesService` (enviar, historico). Tela nenhuma chama `requisitar` ou `fetch` direto. Painel: `adminService` (entrar, eu, sair), `coresService` (listar, criar, editar, excluir, produtosDaCor), `marcasService` (listar, criar, editar, excluir), `categoriasService` (listar, criar, editar, excluir), `produtosAdminService` (listar, obter, criar, editar, duplicar, adicionarImagens, reordenarImagens, excluirImagem, definirVariacoes), `bannersService` (listar, criar, editar, excluir, reordenar) e `destaquesService` (produtos, categorias — cada uma manda a lista COMPLETA de ids); todo service novo do painel usa `requisitarAdmin`, nunca `requisitar` — só o login foge disso, porque o 401 dele (`CREDENCIAIS_INVALIDAS`) é erro de formulário. Exceção proposital: a tela de Destaques lê o estado ATUAL via `catalogoService.home` (rota pública) em vez de inventar uma leitura administrativa que o contrato não tem — é dado público, e é exatamente o que a home mostra.
- `src/lib/exemplo/`: API simulada para `npm run dev:exemplo` (catálogo e ilustrações fictícios em `public/exemplo/`). Na URL, `?exemplo=lento`, `?exemplo=vazio` e `?exemplo=erro` forçam os três estados; `?exemplo=vibrante` troca os banners da home por 3 de cores vibrantes (imagens em `public/exemplo/banners-teste/`), só para avaliar o carrossel — fora da paleta da marca de propósito. Nunca entra no build de produção.
- `src/components/ui/`: componentes base — `Button` (variantes `primaria`, `secundaria`, `texto`, `sobre-primaria`, `contorno-sobre-primaria`; vira `<Link>` com `para`), `Field` (input + rótulo + erro, e `ErroGeral`), `Card` (`borda`, `como`), `Modal` (única camada flutuante; `lateral` vira gaveta).
- `src/components/`: peças da loja — `Estados.jsx` (EstadoVazio, EstadoErro, esqueletos), `Produto.jsx` (FotoProduto, Etiqueta, CartaoProduto), `SeletorVariacoes`, `FormIdentificacao`, `Cabecalho`, `Rodape`, `Estrutura`, `Logo` (**provisório**, em texto, até chegar o SVG oficial).
- `src/contexto/`: `SessaoCliente.jsx` (cliente, seleção, favoritos, aviso) e `CompraWhatsApp.jsx` (o diálogo de compra, em qualquer tela via `useCompra()`). `SessaoAdmin.jsx` (`useSessaoAdmin()`: admin, `situacao` verificando/dentro/fora/cliente/erro, entrar, sair) — só existe dentro de `/admin/*` e não lê nada de `SessaoCliente`.
- `src/hooks/useRequisicao.js`: devolve `{dados, erro, carregando, recarregar}`. Use nas telas que buscam dado, porque é ele que garante os três estados.
- `src/paginas/`: telas da loja. `src/paginas/admin/`: painel (`/admin/*`, com `EstruturaAdmin` própria). `Acesso.jsx` tem a `RotaAdminProtegida` (401 → `/admin/login` guardando a origem; 403 → mensagem "área da equipe" sem mandar ao login) e a moldura das telas sem sessão. Login, Sair, Cores, Produtos, Marcas, Categorias, Banners e Destaques prontos (listagem com filtros na URL; dados com PATCH parcial; imagens — acrescentar, reordenar, excluir; criar em `/admin/produtos/novo`; duplicar, que nasce oculto; a grade de variações — carrega, edita uma cópia local e manda tudo de volta, cada cor com o `corId` da leitura; Marcas e Categorias no mesmo padrão de Cores — CRUD simples, slug gerado do nome ou explícito, 409 com contagem de peças barra a exclusão, Categorias sem coleção desde a 0015 (slug único na tabela, uma lista só; Feminino/Masculino são o `publicos` do PRODUTO, escolhidos em `DestinosProduto.jsx`), com coluna e caixa "Mostrar na loja" (`ativa`: esconde da vitrine sem mexer nas peças) Nome obrigatório (`*`) e "Card Esquerda"/"Card Direita" (a categoria ocupa um dos dois cards de coleção da home, com imagem própria e a proporção recomendada na tela; `cardsColecao` em `GET /home`) — categoria temática é uma categoria como as outras; Banners — CRUD com prévia de imagem ao vivo no formulário, reordenar com mover para cima/baixo, teto de 4 ativos sem travar a tela — a mensagem do 400 aparece sob o checkbox "Ativo"; Destaques — duas grades (produtos até 12, categorias até 8) no mesmo padrão da grade de variações: carrega o estado atual de `GET /home`, edita uma cópia local — busca de produto por nome/código, categoria por um `<select>` — e manda a lista inteira de volta ao salvar; produto oculto/categoria inativa ficam marcados na própria linha, sem travar o formulário). As demais páginas ainda são placeholders.
- `src/styles/tokens.css`: o contrato de tokens. `global.css`: importa os tokens; reset, classes `t-*`, `.botao--*`, `.link-caps`, `.filete` e as classes dos três estados (`.estado--vazio`, `.estado--erro`, `.estado-carregando`, `.esqueleto*`). `paginas.css`: blocos de página compartilhados. **Os estilos globais são importados antes do `App` em `main.jsx`, e essa ordem precisa ser mantida**, senão o CSS do componente perde para `.botao`.
- `src/config.js`: variáveis de ambiente (links de contato geral, imagens dos painéis de coleção). Veja `.env.example`.

## Rotas

Loja: `/`, `/feminino`, `/masculino`, `/colecoes/:slug`, `/todos` (catálogo inteiro, sem filtro), `/novidades`, `/produtos?busca=`, `/categorias`, `/categorias/:categoria?colecao=` (redireciona para a coleção filtrada; slug de categoria só é único dentro da coleção), `/marcas`, `/marcas/:slug` (as listagens aceitam `?cor=slug1,slug2`), `/produto/:codigo`, `/selecao` (`/carrinho` redireciona), `/conta` (`/favoritos` redireciona), `/sobre`, `/contato`. Painel: `/admin/login` (única aberta) e, atrás da rota protegida, `resumo`, `produtos`, `produtos/novo`, `produtos/:id` (por id, não código: no painel o código é editável), `marcas`, `cores`, `categorias`, `banners`, `destaques`, `selecoes`, `clientes`, `permissoes`.

## Rodar

- Backend: em `../Backend-VIP-IMPORTS`, `docker compose up -d` (API em `localhost:8000`, massa de dados já carregada no volume; o Docker Desktop precisa estar aberto). O `vite.config.js` encaminha `/api` para lá, então os cookies funcionam sem configurar CORS.
- `npm run dev`: site contra a API real (`localhost:5173`). As fotos da massa apontam para `cdn.exemplo.com` e aparecem como "Foto em breve", que é o comportamento certo para foto quebrada.
- `npm run dev:exemplo`: site com a API simulada, para avaliar layout sem backend. Painel: qualquer e-mail com a senha `exemplo`.
- Admin no banco local: `docker exec -it vip-imports-api python scripts/criar_admin.py` (não existe cadastro de admin pela API).
- `npm run build`: build de produção. `npm run lint:design`: auditoria do `DESIGN.md` contra a implementação — rode depois de mexer em `tokens.css` ou em telas.

## API

O backend vive em `../Backend-VIP-IMPORTS` (FastAPI, `localhost:8000/api/v1`). A fonte da verdade para qualquer formato de request/response é `docs/para-o-frontend.md`, `docs/contrato-api-v1.json` e `docs/contrato-api-v1-adendo.json` (rotas posteriores ao v1.0, como cores e `/admin/eu`) naquele repositório — leia os três antes de escrever ou alterar uma chamada de API. Se esse repositório não estiver acessível na sessão, rode `/add-dir` apontando para ele antes de continuar.

Regras que corrompem dado se forem ignoradas — releia antes de mexer nas telas correspondentes:

- **Variações do produto, destaques da home e ordem de imagens/banners SUBSTITUEM o conjunto inteiro.** Sempre carregue a lista atual, altere, e mande de volta inteira. Mandar só o item que mudou apaga todo o resto, sem erro nenhum.
- **`PATCH /carrinho/:itemId` troca o PAR inteiro** (`variacaoTamanhoId` + `variacaoCorId`). Mande os dois sempre, mesmo quando só um mudou.
- **Sessão do cliente e sessão do painel são cookies separados e independentes** (`vip_sessao_cliente` / `vip_sessao_admin`). 401 numa rota de painel é a sessão de 12h expirada, não "não identificado" — a tela de painel não deve confundir os dois.
- **Nenhuma rota devolve 204.** Sucesso sem corpo vem como `200 {"ok": true}`. Erro vem em `erro.codigo` / `erro.mensagem` / `erro.campos` / `erro.detalhes` — leia `apiClient.js` antes de tratar erro na mão em algum lugar.
- **`POST /clientes/identificar` sempre responde 200.** Não ramifique tela por "conta nova" vs "conta existente".

## Toda tela que busca dado

Precisa dos três estados: carregando (esqueleto, nunca tela branca), vazio (com uma saída sugerida, tipo limpar filtros) e erro (com botão de tentar de novo).

## Ao terminar uma tela

Suba o dev server e tire um screenshot. Se houver esboço de referência em `design/` para essa tela, compare lado a lado e aponte o que ficou diferente. Confirme também que todo valor usado é `var(--token)` de `tokens.css` (nenhum hex/px solto) e que os três estados (carregando/vazio/erro) estão implementados — não basta rodar sem erro.


## Pedidos sem histórico — 05/10/2026

Decisão do cliente: o rótulo "Fazer pedido" passa a "Encomendar" em toda a loja
e no painel. O histórico de pedidos sai da conta, do painel, das rotas e do
banco. `POST /selecoes` apenas gera `itens`, `mensagemWhatsapp` e `linkWhatsapp`
em memória (HTTP 200), sem id ou data e sem salvar o envio. A seleção em
andamento continua disponível. No resumo, o quarto contador passa a Clientes.
Não existem mais selecoesService.historico, selecoesAdminService, as páginas
admin/selecoes nem os campos selecoesNoMes e totalSelecoes. Esta decisão
substitui as referências anteriores ao histórico de seleções.
