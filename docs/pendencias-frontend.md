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
| Escala de `tokens.css` mais fina, para bater 1:1 com o `DESIGN.md`. | Hoje `--texto-2xl` serve `headline-lg` e `headline-md` (DESIGN.md dá tamanhos diferentes: `clamp(30px,5vw,44px)` × `30px` fixo); `--texto-xs`/`--texto-sm` também dividem `label-caps`/`label-caps-sm`/`button` e `body-sm`/`codigo`; `--altura-linha-titulo` e `--tracking-titulo` usam um valor médio para 4 tamanhos de título que no DESIGN.md têm razão e tracking próprios. Só vira exato criando token novo por papel (ex. `--texto-headline-md`), o que o contrato atual proíbe sem decisão do time. Ver comentários em `tokens.css`. | Time (decide se abre novos tokens). |
| Animação de saída do modal/gaveta (160ms `ease-in`, DESIGN.md § Elevation & Depth). | `Modal.css` só anima a entrada (`[open]`); não existe token nem `@keyframes` de saída hoje. | Time. |
