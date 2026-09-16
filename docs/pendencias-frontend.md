# Pendências do frontend

Uma linha por item: o que falta, por que ficou e quem decide. Decisões já tomadas ficam em `decisoes-frontend.md`.

| Pendência | Motivo | Quem decide |
|---|---|---|
| Cliente escolher a direção visual (opção 1 em `docs/propostas/`, opção 2 em `docs/comparacao/`). | `tokens.css` está com valores provisórios e fontes de sistema. Depois da escolha: skill `design-md-planner` → `DESIGN.md` na raiz → `npm run lint:design` → trocar só os valores de `tokens.css`. | Cliente (VIP Imports). |
| Logo oficial em SVG. | `src/components/Logo.jsx` monta o wordmark em texto. Quando o arquivo do manual chegar, trocar só o conteúdo do componente. | Time + @mpandradecom. |
| Fotos reais dos produtos, dos banners e dos painéis de coleção. | A massa do backend aponta para `cdn.exemplo.com`, que não existe, e o site mostra "Foto em breve". Os banners pedem `imagemUrlMobile` para o hero no celular. | Carga da Fatia 5 (backend) e cliente. |
| Número/links de contato geral (WhatsApp e Instagram do rodapé, página Contato e CTA). | Não existe rota pública com esses dados, e a regra do backend é não guardar o número da loja no frontend. Por enquanto: `VITE_LINK_WHATSAPP_CONTATO` / `VITE_LINK_INSTAGRAM` (vazio esconde). O ideal é uma rota pública de configuração da loja. | Backend com o frontend (contrato v1.1). |
| Textos oficiais de Sobre e Contato. | Os atuais são provisórios e descrevem só o funcionamento do site. | Cliente. |
| Painel administrativo (`/admin/*`). | Rotas e `EstruturaAdmin` existem só como placeholders. Falta: login, sessão própria (`vip_sessao_admin`, 401 = sessão acabou, 403 = sessão de cliente), rota protegida, service do painel e as regras de "substitui o conjunto inteiro" do `CLAUDE.md`. | Trilha B (Dev3). |
| Tipos gerados do OpenAPI (`openapi-typescript`). | O projeto é JavaScript. Se migrar para TypeScript, gerar a partir de `/api/v1/openapi.json` como descreve `para-o-frontend.md` do backend. | Time. |
