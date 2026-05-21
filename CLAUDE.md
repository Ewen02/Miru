# Miru

Plateforme anime — Explorer, Organiser, Partager.

## Stack

- **Monorepo** : Turborepo + pnpm workspaces
- **Frontend** : Next.js 16 (App Router, RSC, next-intl v4 FR/EN) — note : breaking changes vs Next 15, lire `apps/web/AGENTS.md`
- **Backend** : NestJS 11 (architecture hexagonale, voir [apps/api/CLAUDE.md](apps/api/CLAUDE.md))
- **DB** : PostgreSQL + Prisma 6
- **Auth** : BetterAuth (+ 2FA TOTP, email verification, password reset, sessions)
- **Mail** : Resend (transactional)
- **Billing** : Stripe (abonnement Sympathisant — donation-style, pas de feature gating)
- **Push** : Web Push VAPID + service worker
- **Observabilité** : Sentry (api + web), Pino, healthchecks, page `/status` live
- **UI** : Tailwind v4 + design system custom `@miru/ui` (voir [packages/ui/CLAUDE.md](packages/ui/CLAUDE.md))
- **TypeScript** strict partout

## Layout

```
apps/{web,api}
packages/{config,types,db,ui,anilist,jikan,http-client}
```

Imports inter-packages via `@miru/*`. Barrel exports dans chaque `src/index.ts`.

## Conventions

- **Fichiers** : kebab-case
- **Classes/types** : PascalCase avec suffixe explicite (`AnimeEntity`, `GetAnimeDetailUseCase`, `PrismaAnimeRepository`)
- **Constantes / tokens DI** : SCREAMING_SNAKE, déclarés via `Symbol(...)`
- **Pas de `default export`** sauf pages/layouts Next.js
- **Pas de `console.log`** — utiliser `Logger` NestJS côté api
- **Pas de `any` implicite** ; les `any` explicites doivent être justifiés (frontières Prisma/AniList)
- **i18n** : nouvelles strings user-facing → ajouter aux dictionnaires `apps/web/messages/{fr,en}.json` et consommer via `useTranslations()` / `getTranslations()`

## Commandes

- `/commit` — commit conventionnel scopé (api|web|ui|db|types|anilist|config|repo)
- `/pr` — PR GitHub avec template
- `/check` — `pnpm turbo type-check build`
- `/format` — Prettier write sur tout le monorepo (`/format check` pour vérifier)
- `/dev` — dev server background (web :3000, api :3001)
- `/new-module <nom>` — scaffold module hexagonal api
- `/new-usecase <module> <action>` — ajoute un use case
- `/new-ui <nom>` — composant design system
- `/sync-db` — format + validate + generate Prisma (pas de `db push` sans confirmation)

## Subagents

- `hex-architect` — audite les règles hexagonales après toute modif de `apps/api/src/`
- `ui-stylist` — audite un composant contre les règles design system
- `prisma-schema` — propose des évolutions de `packages/db/prisma/schema.prisma` alignées au domaine

## Règles de collaboration

- Suivre mot-à-mot les CLAUDE.md des zones (`apps/api/`, `packages/ui/`). Pas de réinterprétation.
- Jamais d'import depuis `domain/` vers `infrastructure/` ou `@nestjs/*`.
- Avant de commit : `/check`. Avant de PR : relire le diff et tester manuellement si UI.

## Roadmap

Plan produit complet sur 6 phases : [ROADMAP.md](ROADMAP.md).
**État actuel : Phases 1, 2, 3, 5, 6 toutes livrées.** Reste à trancher la Phase 4 (scraping Crunchyroll/ADN) + opérations de déploiement réel.

## Archives

Les guides de setup initial (longs, one-shot) sont dans [.claude/docs/](.claude/docs/) :

- `monorepo-setup.md` — scaffold complet du repo (déjà exécuté)
- `ui-setup.md` — init du package `@miru/ui`
- `deploy.md` — Railway (API + Postgres) + Vercel (web) + smoke test prod + Sentry config

## Env

Variables dans `.env` (template complet : `.env.example`). Groupes :

- **Requis** : `DATABASE_URL`, `BETTER_AUTH_SECRET`
- **URLs** : `WEB_ORIGIN`, `API_BASE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`
- **Cron** : `ENABLE_SCHEDULER` (default `false` en dev)
- **Mail** : `RESEND_API_KEY`, `MAIL_FROM`
- **Stripe** : `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- **Push** : `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- **Sentry** : `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` (+ traces/profiles sample rates)

Tous les services externes sont **optionnels en dev** : si la clé est vide, la feature dégrade proprement (push toggle disabled, mails loggés, billing désactivé…).
