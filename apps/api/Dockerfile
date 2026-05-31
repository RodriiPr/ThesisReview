FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/ai-engine/package.json ./packages/ai-engine/

RUN pnpm install --frozen-lockfile --ignore-scripts


FROM base AS builder
COPY --from=deps /app .
COPY apps/api ./apps/api
COPY packages ./packages
COPY package.json pnpm-workspace.yaml turbo.json ./
RUN pnpm --filter @thesis-review/database build
RUN pnpm --filter @thesis-review/ai-engine build
RUN pnpm --filter @thesis-review/api build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  font-noto \
  ttf-freefont

ENV PUPPETEER_SKIP_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main.js"]
