# Déploiement Miru

Vercel pour le web, Railway pour l'API et Postgres.

## Variables d'environnement par environnement

| Variable | API | Web | Notes |
|---|---|---|---|
| `DATABASE_URL` | ✓ | — | Postgres connection string (Railway fournit `DATABASE_URL` auto sur son add-on). |
| `BETTER_AUTH_SECRET` | ✓ | — | 32+ chars random. `openssl rand -base64 32`. |
| `WEB_ORIGIN` | ✓ | — | URL publique du web (`https://miru.app`). Sert le CORS + trustedOrigins Better Auth. |
| `API_BASE_URL` | ✓ | — | URL publique de l'API. Sert le `baseURL` Better Auth (callbacks, redirects). |
| `NEXT_PUBLIC_API_URL` | — | ✓ | URL publique de l'API. Inliné dans le bundle browser. |
| `NEXT_PUBLIC_SITE_URL` | — | ✓ | URL publique du web pour OG + sitemap. |
| `ENABLE_SCHEDULER` | ✓ | — | `"true"` sur **un seul** dyno Railway pour éviter de doubler les crons. |
| `SENTRY_DSN` | ✓ | ✓ (server) | DSN du projet api côté API, DSN du projet web côté web (server runtime). |
| `NEXT_PUBLIC_SENTRY_DSN` | — | ✓ | Même DSN web mais exposé au browser. |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | — | ✓ (CI) | Pour l'upload des source maps. Vercel les passe au build via env. |
| `SENTRY_RELEASE` | ✓ | ✓ | Optionnel. Git SHA fourni par la CI. |
| `LOG_LEVEL` | ✓ | — | `"info"` en prod, `"warn"` pour silencer les access logs. |

## Railway — API + Postgres

1. **Créer un nouveau projet** Railway, ajouter le service Postgres.
2. **Connecter le repo GitHub**, choisir le dossier `apps/api/` mais Railway lit le `Dockerfile` à la racine via le contexte monorepo.
3. **Settings → Build** : `Dockerfile Path = apps/api/Dockerfile`, `Build Context = .` (la racine, pas `apps/api`).
4. **Variables** : copier celles de la colonne API ci-dessus depuis `.env.example`. Railway expose déjà `DATABASE_URL`.
5. **Healthcheck Path** : `/health/ready` (HTTP 503 ⇒ retire l'instance de la rotation).
6. **Deploy**. Au boot, le container fait `prisma migrate deploy` puis lance Nest.

## Vercel — Web

1. **Importer le repo**, dossier `apps/web/`.
2. **Framework preset** : Next.js (détecté auto).
3. **Build & Output** :
   - `Root Directory` = `apps/web`
   - `Build Command` = `cd ../.. && pnpm turbo build --filter=web`
   - `Install Command` = `cd ../.. && pnpm install --frozen-lockfile`
4. **Variables** : colonne Web ci-dessus.
5. **Domain** : configurer le custom domain, mettre à jour `NEXT_PUBLIC_SITE_URL` + `WEB_ORIGIN` côté API.

## Première sync prod

Après le premier déploiement Railway, la DB est vide. Lancer le seed une fois depuis ta machine :

```bash
# Pointer vers la DB Railway temporairement
DATABASE_URL="postgresql://...railway..." pnpm --filter api seed:seasons
```

Puis activer `ENABLE_SCHEDULER=true` côté Railway pour que les crons prennent le relais.

## Sentry

Créer deux projets Sentry distincts : `miru-api` (platform: nestjs) et `miru-web` (platform: nextjs). Récupérer les DSN, les coller dans les variables ci-dessus. Pour l'upload de source maps web, créer un token `SENTRY_AUTH_TOKEN` dans Sentry Settings → Auth Tokens avec les scopes `project:write` + `release:read`.

## Observability checklist post-launch

- [ ] `/health` répond 200 depuis l'externe
- [ ] `/health/ready` répond 200 quand DB OK
- [ ] Sentry reçoit l'événement test : `curl -X POST https://api.miru.app/animes/_unknown/reviews` (404 → rien) puis générer une vraie 500 (ex: lancer un syscall en panne)
- [ ] Vercel Logs montrent les requêtes Next sans cookie sensible
- [ ] Railway Logs montrent les requêtes API au format JSON, sans cookie Better Auth visible
- [ ] Cron Railway tourne : un anime fraîchement créé a son `syncedAt` qui bouge
