FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev --no-audit --no-fund --loglevel verbose


COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
