# =========================
# Stage 1: Build Angular app
# =========================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build:prod


# =========================
# Stage 2: Serve with Nginx
# =========================
FROM nginx:alpine

# remove default nginx site
RUN rm -rf /usr/share/nginx/html/*

# copy build output to nginx
COPY --from=build /app/dist/study-platform-frontend/browser /usr/share/nginx/html

# expose port
EXPOSE 80

# start nginx
CMD ["nginx", "-g", "daemon off;"]