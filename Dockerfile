# Build
FROM node:20-alpine AS builder
WORKDIR /app

# ① Terima build arg dari CI
ARG VITE_API_URL
# ② Tulis ke .env.production di dalam konteks build
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production

COPY ENOTARIS-WEB/package*.json ./
RUN npm ci
COPY ENOTARIS-WEB ./

# ③ Build akan membaca .env.production
RUN npm run build

# Serve
FROM nginx:alpine
COPY ENOTARIS-WEB/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
