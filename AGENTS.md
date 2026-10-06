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
- Toda tela que busca dado tem os três estados: carregando (esqueleto), vazio (com saída) e erro ("Tentar de novo"). Use `useRequisicao`, `components/Estados.jsx` e as classes de estado de `styles/global.css`.
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
