###############################################################################
# Miru API — multi-stage Dockerfile for Railway / any Docker host.
# Built from the monorepo root: `docker build -f apps/api/Dockerfile .`
###############################################################################

# ---- 1. base: pinned Node + pnpm + corepack -------------------------------
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# openssl: Prisma engines need it at runtime to talk to Postgres over TLS.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@9 --activate
WORKDIR /app

# ---- 2. deps: install every workspace dep with the lockfile ---------------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/anilist/package.json   ./packages/anilist/
COPY packages/config/package.json    ./packages/config/
COPY packages/db/package.json        ./packages/db/
COPY packages/http-client/package.json ./packages/http-client/
COPY packages/jikan/package.json     ./packages/jikan/
COPY packages/types/package.json     ./packages/types/
COPY packages/ui/package.json        ./packages/ui/
# Skip lifecycle scripts (prisma generate) until the prisma schema is copied.
RUN pnpm install --frozen-lockfile --ignore-scripts

# ---- 3. build: compile every workspace the api depends on -----------------
FROM deps AS build
COPY apps/api ./apps/api
COPY packages ./packages
# Generate the Prisma client now that the schema is present.
RUN pnpm --filter @miru/db exec prisma generate
# Two passes: workspace deps first, then the api. Avoids a race where turbo
# schedules api#build while @miru/db is still emitting its dist/.
RUN pnpm turbo build --filter='./packages/*'
RUN pnpm turbo build --filter=api

# ---- 4. runtime: ships the api with everything it needs to run ------------
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3001

# Copy the lockfile + workspace manifests so pnpm understands the layout,
# then bring over the already-installed node_modules from the build stage.
# We intentionally include devDeps here because the runtime image still
# needs the Prisma CLI to run `migrate deploy` on boot. The size hit is
# modest (~60 MB) and avoids a fragile prod-only install dance.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/anilist/package.json   ./packages/anilist/
COPY packages/config/package.json    ./packages/config/
COPY packages/db/package.json        ./packages/db/
COPY packages/http-client/package.json ./packages/http-client/
COPY packages/jikan/package.json     ./packages/jikan/
COPY packages/types/package.json     ./packages/types/

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/packages/anilist/node_modules     ./packages/anilist/node_modules
COPY --from=build /app/packages/db/node_modules          ./packages/db/node_modules
COPY --from=build /app/packages/http-client/node_modules ./packages/http-client/node_modules
COPY --from=build /app/packages/jikan/node_modules       ./packages/jikan/node_modules
COPY --from=build /app/packages/types/node_modules       ./packages/types/node_modules

# Compiled JS + Prisma schema/migrations.
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/db/prisma ./packages/db/prisma
COPY --from=build /app/packages/anilist/dist   ./packages/anilist/dist
COPY --from=build /app/packages/http-client/dist ./packages/http-client/dist
COPY --from=build /app/packages/jikan/dist     ./packages/jikan/dist
COPY --from=build /app/packages/types/dist     ./packages/types/dist

EXPOSE 3001

# Apply pending migrations on boot, then start the API.
CMD ["sh", "-c", "pnpm --filter @miru/db exec prisma migrate deploy && node apps/api/dist/main.js"]
