# Etapa 1: build de la app con Node
FROM node:24-alpine AS build
WORKDIR /app

# Primero solo las dependencias, así Docker reutiliza esta capa si no cambian
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: nginx sirve los archivos estáticos y hace de proxy hacia la API
FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
