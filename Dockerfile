# Imagem do site publicado — trilha de DevOps (Dev 4), tarefas 10 e 13.
#
# Duas etapas: a primeira instala e roda o build do Vite; a segunda fica só com
# os arquivos prontos, sobre um Nginx. A imagem final não tem Node, nem
# node_modules, nem código-fonte — pesa dezenas de MB em vez de centenas, e o
# que não está lá dentro não pode ser explorado.
#
# A CONFIGURAÇÃO deste Nginx não está aqui: ela é montada de fora, do
# repositório Infra-VIP-IMPORTS (`borda/nginx/site.conf`). Assim uma mudança de
# cache ou de rota não exige reconstruir e republicar o site.

# ------------------------------------------------------------------ build
FROM node:22-alpine AS build

WORKDIR /app

# package.json e lock primeiro, sozinhos: enquanto as dependências não
# mudarem, o Docker reaproveita esta camada e `npm ci` nem roda de novo.
COPY package.json package-lock.json ./
# `npm ci` e não `npm install`: instala exatamente o que está no lock, sem
# atualizar nada. É o que faz o build da máquina do dev e o do servidor
# produzirem o mesmo resultado.
RUN npm ci

COPY . .

# O Vite lê as variáveis VITE_* do ambiente NO MOMENTO DO BUILD e grava os
# valores dentro do bundle — não existe configuração em tempo de execução num
# site estático. Trocar qualquer uma delas exige reconstruir a imagem.
ARG VITE_API_URL=/api/v1
ARG VITE_LINK_WHATSAPP_CONTATO=
ARG VITE_LINK_INSTAGRAM=
ARG VITE_IMAGEM_COLECAO_FEMININA=
ARG VITE_IMAGEM_COLECAO_MASCULINA=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_LINK_WHATSAPP_CONTATO=$VITE_LINK_WHATSAPP_CONTATO \
    VITE_LINK_INSTAGRAM=$VITE_LINK_INSTAGRAM \
    VITE_IMAGEM_COLECAO_FEMININA=$VITE_IMAGEM_COLECAO_FEMININA \
    VITE_IMAGEM_COLECAO_MASCULINA=$VITE_IMAGEM_COLECAO_MASCULINA

RUN npm run build

# --------------------------------------------------------------- publicado
FROM nginx:1.27-alpine

# Só o resultado do build. Nada de /app, nada de node_modules.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
