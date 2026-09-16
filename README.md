# Frontend-VIP-IMPORTS

> ⚠️ **`npm run lint:design` falha hoje, e é esperado.** O cliente ainda não escolheu a
> direção visual, então não existe `DESIGN.md` na raiz (só a proposta em
> `docs/propostas/DESIGN-opcao-1-vitrine-reservada.md`). `src/styles/tokens.css` está
> com valores provisórios enquanto isso — ver a seção 8 de `docs/decisoes-frontend.md`.
> Uma falha do `lint:design` não é regressão: só passa a valer depois que o `DESIGN.md`
> definitivo for gerado pela skill `design-md-planner`.

Loja em catálogo da VIP Imports (React + Vite, CSS puro). Não há venda direta: cada peça tem o botão **Comprar no WhatsApp**, e o atendimento confirma valor, tamanho e entrega na conversa.

```
npm install
npm run dev            # site contra a API real em localhost:8000 (ver ../Backend-VIP-IMPORTS)
npm run dev:exemplo    # site com API simulada e ilustrações de exemplo, sem backend
npm run build
npm run lint:design    # auditoria do DESIGN.md (quando existir)
```

- `src/styles/tokens.css`: contrato de tokens (nomes definitivos, valores provisórios até o cliente escolher a direção visual). Fonte de toda cor, fonte e espaçamento.
- `CLAUDE.md` / `AGENTS.md`: instruções para quem programa, humano ou agente.
- `docs/decisoes-frontend.md`: por que as coisas são como são. `docs/pendencias-frontend.md`: o que falta.
- `docs/comparacao/index.html`: comparação das duas direções visuais para o cliente (abre com duplo clique).
