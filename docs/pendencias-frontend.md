# Pendências do frontend

Uma linha por item: o que falta, por que ficou e quem decide. Decisões já tomadas ficam em `decisoes-frontend.md`.

| Pendência | Motivo | Quem decide |
|---|---|---|
| Logo oficial em SVG. | `src/components/Logo.jsx` monta o wordmark em texto. Quando o arquivo do manual chegar, trocar só o conteúdo do componente. | Time + @mpandradecom. |
| Fotos reais dos produtos, dos banners e dos painéis de coleção. | A massa do backend aponta para `cdn.exemplo.com`, que não existe, e o site mostra "Foto em breve". Os banners pedem `imagemUrlMobile` para o hero no celular. | Carga da Fatia 5 (backend) e cliente. |
| Número/links de contato geral (WhatsApp e Instagram do rodapé, página Contato e CTA). | Não existe rota pública com esses dados, e a regra do backend é não guardar o número da loja no frontend. Por enquanto: `VITE_LINK_WHATSAPP_CONTATO` / `VITE_LINK_INSTAGRAM` (vazio esconde). O ideal é uma rota pública de configuração da loja. | Backend com o frontend (contrato v1.1). |
| Textos oficiais de Sobre e Contato. | Os atuais são provisórios e descrevem só o funcionamento do site. | Cliente. |
| Painel administrativo (`/admin/*`). | Rotas e `EstruturaAdmin` existem só como placeholders. Falta: login, sessão própria (`vip_sessao_admin`, 401 = sessão acabou, 403 = sessão de cliente), rota protegida, service do painel e as regras de "substitui o conjunto inteiro" do `CLAUDE.md`. | Trilha B (Dev3). |
| Tipos gerados do OpenAPI (`openapi-typescript`). | O projeto é JavaScript. Se migrar para TypeScript, gerar a partir de `/api/v1/openapi.json` como descreve `para-o-frontend.md` do backend. | Time. |
| Altura de linha por tamanho de título (`--altura-linha-titulo`). | `display`/`headline-lg`/`headline-md`/`headline-sm` dividem uma única razão (1.1); o DESIGN.md pede 1.02/1.08/1.15/1.2 (inversa ao tamanho — quanto maior o título, mais apertada a linha). Tamanho e tracking já ganharam token por papel em 17/09 (ver `docs/decisoes-frontend.md`, seção 10); a altura de linha ficou de fora dessa rodada. | Time (mesma mecânica: token novo por papel, sem renomear os existentes). |
| Largura máxima do título (`--medida-titulo`). | Um só token (16ch) serve o título do hero (14ch no DESIGN.md) e o do CTA final (18ch). | Time. |
