# Miru

Plateforme anime — Explorer, Organiser, Partager.

## Stack

- **Monorepo** : Turborepo + pnpm workspaces
- **Frontend** : Next.js 16 (App Router, RSC) — note : breaking changes vs Next 15, lire `apps/web/AGENTS.md`
- **Backend** : NestJS 11 (architecture hexagonale, voir [apps/api/CLAUDE.md](apps/api/CLAUDE.md))
- **DB** : PostgreSQL + Prisma 6
- **Auth** : BetterAuth (non câblé au MVP)
- **UI** : Tailwind v4 + design system custom `@miru/ui` (voir [packages/ui/CLAUDE.md](packages/ui/CLAUDE.md))
- **TypeScript** strict partout

## Layout

```
apps/{web,api}
packages/{config,types,db,ui,anilist}
```

Imports inter-packages via `@miru/*`. Barrel exports dans chaque `src/index.ts`.

## Conventions

- **Fichiers** : kebab-case
- **Classes/types** : PascalCase avec suffixe explicite (`AnimeEntity`, `GetAnimeDetailUseCase`, `PrismaAnimeRepository`)
- **Constantes / tokens DI** : SCREAMING_SNAKE, déclarés via `Symbol(...)`
- **Pas de `default export`** sauf pages/layouts Next.js
- **Pas de `console.log`** — utiliser `Logger` NestJS côté api
- **Pas de `any` implicite** ; les `any` explicites doivent être justifiés (frontières Prisma/AniList)

## Commandes

- `/commit` — commit conventionnel scopé (api|web|ui|db|types|anilist|config|repo)
- `/pr` — PR GitHub avec template
- `/check` — `pnpm turbo type-check build`
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

## Archives

Les guides de setup initial (longs, one-shot) sont dans [.claude/docs/](.claude/docs/) :
- `monorepo-setup.md` — scaffold complet du repo (déjà exécuté)
- `ui-setup.md` — init du package `@miru/ui`

## Env

Variables dans `.env` (template : `.env.example`) : `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_API_URL`.
