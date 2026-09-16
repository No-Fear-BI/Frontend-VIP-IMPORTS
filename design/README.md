# Referências de tela (opcional)

Não tem designer externo — a tela é por conta do próprio time. Essa pasta só existe pra quem quiser deixar um esboço/wireframe próprio antes de codar uma tela específica, pra outra pessoa do time construir a partir dele em vez de inventar do zero.

Não é obrigatório ter nada aqui. Sem esboço pra uma tela, ela é construída direto a partir de `DESIGN.md` (paleta/tipografia/tokens, na raiz do projeto) e do contrato de API (`docs/para-o-frontend.md` e `docs/contrato-api-v1.json`, no repositório do backend) — a estrutura da tela vem do que a rota da API já define, a aparência vem do `DESIGN.md`.

Se alguém deixar um esboço, mesma convenção de nome de antes ajuda o Claude Code a apontar certo:

```
design/
  01-home.png
  02-listagem.png
  03-produto.png
  04-carrinho.png
  05-identificacao.png
  06-painel-login.png
  07-painel-produtos.png
  08-painel-produto-form.png
  09-painel-marcas-categorias-banners.png
  10-painel-destaques.png
  11-painel-resumo.png
```

A identidade visual da marca (logo, paleta oficial: `#FCEAB3`, `#28361F`, `#FFFFFF`) já está documentada em `CLAUDE.md` — não precisa repetir aqui.
