# Stage 1 — install deps and build
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files first (cached unless deps change)
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm run build

# Stage 2 — lean production image
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
