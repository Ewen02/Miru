# Déploiement Miru

Vercel pour le web, Railway pour l'API et Postgres.

## Variables d'environnement par environnement

| Variable | API | Web | Notes |
|---|---|---|---|
| `DATABASE_URL` | ✓ | — | Postgres connection string. En prod ajouter `?sslmode=require&connection_limit=10&pool_timeout=20` (Railway fournit `DATABASE_URL` brut, complète-la). |
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

# Seed du catalogue de badges (idempotent — re-jouable à chaque release)
DATABASE_URL="postgresql://...railway..." pnpm --filter @miru/db db:seed
```

> Les **tables** sont créées automatiquement : le container lance
> `prisma migrate deploy` au boot (applique les fichiers de `prisma/migrations/`).
> Le **seed des badges** n'est PAS auto — lance `db:seed` une fois (idempotent).

Puis activer `ENABLE_SCHEDULER=true` côté Railway pour que les crons prennent le relais.

## Postgres tuning (Railway)

Enable in Railway → Postgres add-on → "Custom Postgres Settings":

```
log_min_duration_statement = 500     # log queries slower than 500ms to Railway logs
shared_preload_libraries   = pg_stat_statements
```

Then activate the extension once:

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

This complements the in-app slow-query listener (`PrismaService` reports
≥500ms as breadcrumbs and ≥2s as Sentry messages). The two layers catch
different things: Prisma sees the ORM-level call, Postgres sees the raw
SQL plan.

## Sentry

Créer deux projets Sentry distincts : `miru-api` (platform: nestjs) et `miru-web` (platform: nextjs). Récupérer les DSN, les coller dans les variables ci-dessus. Pour l'upload de source maps web, créer un token `SENTRY_AUTH_TOKEN` dans Sentry Settings → Auth Tokens avec les scopes `project:write` + `release:read`.

## Disaster recovery runbook

When something goes wrong with the prod DB, follow these steps in order.
**Stop and assess before destructive actions.**

### Symptom triage

| Symptom                                  | Likely cause                                | First action                              |
| ---------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| `/health/ready` flapping 503             | Connection pool exhaustion or pg restart    | Check `/health/db` for pool stats          |
| Slow queries spike on Sentry             | Missing index or N+1                        | EXPLAIN ANALYZE the slowest query          |
| Backups failing 2+ days                  | R2 credentials rotated, Railway URL changed | Check `backup-nightly` workflow logs       |
| Data corruption / accidental destructive | Bad migration, manual SQL gone wrong        | **Don't deploy.** Restore from R2 backup   |
| Railway region outage                    | Provider incident                           | Wait — promoting a standby is not worth it |

### Restore from nightly R2 backup

1. **Provision a fresh Postgres** in Railway (don't restore over the live one — keep evidence).
2. **Run the restore script** from a trusted laptop with the age key:

   ```bash
   export BACKUP_R2_BUCKET=miru-backups
   export BACKUP_R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
   export AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=...
   export AGE_IDENTITY_FILE=~/.age/miru.key
   export TARGET_DATABASE_URL="postgres://...new-prod-db..."
   export I_KNOW_WHAT_IM_DOING=1  # only set when sure
   ./scripts/backup/restore.sh latest
   ```

3. **Validate** with smoke queries: `psql $TARGET_DATABASE_URL -c '\dt'`,
   check row counts on User/Anime/WatchlistEntry.
4. **Point Railway service** at the new DB (update `DATABASE_URL` env var).
5. **Restart** the API service.
6. **Confirm** `/health/db` returns expected size and table counts.

### Rollback a bad migration

1. **Don't ship more code** while investigating.
2. If the migration is reversible (additive only), revert the schema and
   create a new migration that undoes it. `prisma migrate deploy` is
   append-only; never `--reset` in prod.
3. If irreversible (DROP COLUMN, type change), restore from the last
   nightly backup using the runbook above. Accept the data loss between
   the backup and the bad deploy.

### Recovery time targets

- **RPO** ≤ 24 h (nightly backup cadence)
- **RTO** ≤ 30 min for a 100 MB DB on Railway Pro (`pg_restore --jobs=4`)

The Sunday `backup-restore-test` workflow drills this every week.

## Observability checklist post-launch

- [ ] `/health` répond 200 depuis l'externe
- [ ] `/health/ready` répond 200 quand DB OK
- [ ] Sentry reçoit l'événement test : `curl -X POST https://api.miru.app/animes/_unknown/reviews` (404 → rien) puis générer une vraie 500 (ex: lancer un syscall en panne)
- [ ] Vercel Logs montrent les requêtes Next sans cookie sensible
- [ ] Railway Logs montrent les requêtes API au format JSON, sans cookie Better Auth visible
- [ ] Cron Railway tourne : un anime fraîchement créé a son `syncedAt` qui bouge
