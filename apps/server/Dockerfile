FROM node:18-alpine
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/ ./packages/shared/
COPY apps/server/ ./apps/server/

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter @photo-app/shared build
RUN cd apps/server && npx prisma generate
RUN pnpm --filter @photo-app/server build

EXPOSE 4000
CMD ["node", "apps/server/dist/main.js"]
