FROM node:24-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24-alpine AS prod
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --prod --frozen-lockfile
COPY --from=builder /app/dist/ ./src
COPY drizzle.config.ts entrypoint.sh ./
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]

