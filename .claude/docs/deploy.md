# Deploy Miru

Production deployment guide. The recommended split is **Railway for the API
+ Postgres** and **Vercel for the web**, but any host that runs a Docker
image + a Next.js app + a Postgres works the same.

## 1. Provision the database

Railway → New Project → Postgres. Copy the **internal** `DATABASE_URL`
(reach the DB from the API container, no public exposure needed).

## 2. Deploy the API

1. Railway → New Service → from this repo.
2. Service settings → **Dockerfile path** = `apps/api/Dockerfile`.
3. Set environment variables (see [.env.example](../../.env.example)) at minimum:
   - `DATABASE_URL` (the one you just copied)
   - `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)
   - `WEB_ORIGIN` — the public web URL, e.g. `https://miru.app`
   - `API_BASE_URL` — the public API URL, e.g. `https://api.miru.app`
   - `RESEND_API_KEY` + `MAIL_FROM` if you want real emails
   - `SENTRY_DSN` if you use Sentry
   - `ENABLE_SCHEDULER=true` to turn on the crons
4. Deploy. The `Dockerfile` runs `prisma migrate deploy` before booting, so
   migrations apply on every release. No manual step.
5. Verify `GET /healthz` returns 200.

### Sub-domain

In Railway service settings, generate a public domain. Point a CNAME from
your DNS (e.g. `api.miru.app`) to the Railway-generated host.

## 3. Deploy the web

1. Vercel → Import this repo → root.
2. Build command: `pnpm turbo build --filter web...`
3. Output directory: `apps/web/.next`
4. Install command: `pnpm install --frozen-lockfile`
5. Environment variables:
   - `NEXT_PUBLIC_API_URL=https://api.miru.app`
   - `NEXT_PUBLIC_SITE_URL=https://miru.app`
   - `NEXT_PUBLIC_SENTRY_DSN` if applicable
6. Deploy. Add the `miru.app` domain in Project Settings → Domains.

## 4. Smoke test

- [ ] `https://miru.app/` shows the landing page (anonymous).
- [ ] Register → email lands in your inbox (Resend dashboard shows it).
- [ ] Click the verify link → redirects to `/verify-email` with success.
- [ ] Log in, add an anime to watchlist → row in DB.
- [ ] Sitemap reachable at `/sitemap.xml`, includes anime/genre pages.
- [ ] `/anime/[any-slug]/opengraph-image` returns a 1200×630 PNG.

## 5. Operational notes

- **Cron schedule** — when `ENABLE_SCHEDULER=true`, the API runs:
  - Hourly trending sync from AniList
  - Hourly episode enrich (Jikan)
  - Hourly episode-aired notifications
  - 5-min welcome notifications for new sign-ups
  - Sunday 20:00 weekly recap
  All idempotent — a restart mid-cron is safe.

- **Rate limits** — global Nest throttler at 120 req/min/IP, Better Auth
  routes additionally capped at 30/min via its built-in `rateLimit`.

- **Logs** — pino structured JSON in prod. Set `LOG_LEVEL=warn` to silence
  access logs once the app is stable.

- **Backup** — Railway Postgres has daily backups for 7 days on the Pro
  plan. For longer retention, schedule a nightly `pg_dump` → S3.

## Rollback

Each Railway deploy is a tagged image. Promoting the previous build is
one click in the Deployments tab. Migrations are not auto-reverted — keep
them additive and run a manual `prisma migrate resolve --rolled-back` if
something destructive ships by accident.

## 6. Observabilité (Sentry + /status)

### Sentry — capture des erreurs

API et web sont câblés sur Sentry mais le DSN est vide en dev. Pour activer
en prod :

1. **Créer un projet Sentry** (un pour API Node.js, un pour Next.js).
2. **Récupérer les deux DSN** :
   - `SENTRY_DSN` côté API (Railway)
   - `NEXT_PUBLIC_SENTRY_DSN` côté web (Vercel)
3. **Source maps** — l'upload est automatique côté web via
   `withSentryConfig` dans `next.config.ts`. Il faut fournir :
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
   - `SENTRY_AUTH_TOKEN` (Settings → Account → Auth Tokens, scope
     `project:releases`)
   Sans ces 3 variables, Sentry est wrappé mais ne uploade pas les maps.
4. **Sampling** — `SENTRY_TRACES_SAMPLE_RATE` et
   `SENTRY_PROFILES_SAMPLE_RATE` à 0.1 (10%) par défaut.
   `NEXT_PUBLIC_SENTRY_REPLAYS_RATE` à 0 par défaut (replays activés
   uniquement sur erreur). Mettre à 0.05 pour 5% de replays full session
   si le quota le permet.

### Page /status

Sondes live contre `/health`, `/health/ready` et AniList GraphQL toutes
les 30 secondes (ISR). Pas de stockage d'historique d'incidents — c'est
intentionnel, le service `/status` est un smoke check, pas un Statuspage.
Pour de l'historique, brancher [Better Stack Uptime](https://betterstack.com/uptime)
ou [UptimeRobot](https://uptimerobot.com/) en parallèle.
