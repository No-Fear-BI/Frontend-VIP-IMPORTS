# Frontend-VIP-IMPORTS

Loja em catálogo da VIP Imports (React + Vite, CSS puro). Não há venda direta: cada peça tem o botão **Comprar no WhatsApp**, e o atendimento confirma valor, tamanho e entrega na conversa.

```
npm install
npm run dev            # site contra a API real em localhost:8000 (ver ../Backend-VIP-IMPORTS)
npm run dev:exemplo    # site com API simulada e ilustrações de exemplo, sem backend
npm run build
npm run lint:design    # auditoria do DESIGN.md
```

- `DESIGN.md`: direção visual definitiva ("Vitrine Reservada" — editorial de moda cruzado com etiqueta de alfaiataria), escolhida pelo cliente em 17/09/2026.
- `src/styles/tokens.css`: contrato de tokens (nomes definitivos), com os valores do `DESIGN.md`. Fonte de toda cor, fonte e espaçamento.
- `CLAUDE.md` / `AGENTS.md`: instruções para quem programa, humano ou agente.
- `docs/decisoes-frontend.md`: por que as coisas são como são. `docs/pendencias-frontend.md`: o que falta.
