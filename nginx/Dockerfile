FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json ./
RUN npm install
COPY frontend/ .
# Собираем SPA под префиксом /survey/ (заходит в import.meta.env.BASE_URL)
ARG VITE_BASE=/survey/
ENV VITE_BASE=$VITE_BASE
RUN npm run build

FROM nginx:1.25
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/poll.conf /etc/nginx/conf.d/
# Статика лежит в подпапке survey, чтобы пути /survey/assets/* резолвились
COPY --from=frontend-builder /app/dist /usr/share/nginx/html/survey
