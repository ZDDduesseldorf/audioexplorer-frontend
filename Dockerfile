FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 4173

CMD ["sh", "-c", "echo \"\" && echo \"Frontend is ready!\" && echo \"Access the application at: http://localhost:4173\" && echo \"(If running on a remote host, replace localhost with the host IP address)\" && echo \"\" && npm run preview -- --host 0.0.0.0"]