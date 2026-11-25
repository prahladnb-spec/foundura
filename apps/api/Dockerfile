# Foundura API. Build from the repo root:
#   docker build -f apps/api/Dockerfile -t foundura-api .
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
# pnpm at the version in package.json "packageManager". Installed with npm because Node 25 and later no longer ship corepack.
COPY package.json /tmp/package.json
RUN npm install -g --no-fund --no-audit "$(node -p 'require("/tmp/package.json").packageManager')" && rm /tmp/package.json
WORKDIR /repo

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter @foundura/api...
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @foundura/shared build && pnpm --filter @foundura/api build
# Production-only node_modules plus the compiled server, migrate and seed scripts, and the SQL migrations.
RUN pnpm --filter @foundura/api deploy --legacy --prod /out && rm -rf /out/src /out/test /out/db && cp -r apps/api/dist apps/api/drizzle /out/

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:4000/v1/health || exit 1
CMD ["node", "dist/src/main.js"]
