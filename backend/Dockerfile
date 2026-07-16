FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsconfig.base.json ./
COPY packages ./packages
COPY services ./services
COPY server.ts combined-server.ts seed_products.ts artisan_haven.products.json ./

RUN npm install
RUN npm --workspace @artisan-haven/database run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 4000
ENV PORT=4000

CMD ["sh", "-c", "npx prisma db push --schema packages/database/prisma/schema.prisma --accept-data-loss && npx tsx seed_products.ts && npx tsx server.ts"]
