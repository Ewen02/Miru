# Miru — Monorepo Setup Guide

> Plateforme anime — Explorer, Organiser, Partager.
> Ce fichier guide le setup complet du monorepo. Place-le à la racine du projet.

## Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Next.js 15 (App Router, RSC, Suspense)
- **Backend**: NestJS (REST)
- **DB**: PostgreSQL + Prisma
- **Auth**: BetterAuth
- **UI**: Tailwind CSS v4 + design system custom (package `@miru/ui`)
- **Language**: TypeScript strict partout

## Architecture cible

```
miru/
├── apps/
│   ├── web/                 → Next.js 15
│   └── api/                 → NestJS
├── packages/
│   ├── db/                  → Prisma schema + client + seed
│   ├── ui/                  → Design system (composants + tokens)
│   ├── types/               → Types partagés (DTO, enums, interfaces)
│   ├── anilist/             → Client wrapper API AniList (GraphQL)
│   └── config/              → Configs partagées (tsconfig, eslint)
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .gitignore
```

## Étape 1 — Init racine

```bash
mkdir miru && cd miru
pnpm init
```

### `package.json` (racine)

```json
{
  "name": "miru",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "db:generate": "turbo db:generate",
    "db:push": "turbo db:push",
    "db:seed": "turbo db:seed",
    "clean": "turbo clean"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "pnpm@9.15.0"
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

### `.gitignore`

```
node_modules
dist
.next
.turbo
.env
.env.local
*.tsbuildinfo
```

## Étape 2 — Package `@miru/config`

Configs TypeScript partagées.

```bash
mkdir -p packages/config
```

### `packages/config/package.json`

```json
{
  "name": "@miru/config",
  "private": true,
  "files": ["tsconfig.base.json", "tsconfig.next.json", "tsconfig.nest.json"]
}
```

### `packages/config/tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist"]
}
```

### `packages/config/tsconfig.next.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "noEmit": true,
    "plugins": [{ "name": "next" }]
  }
}
```

### `packages/config/tsconfig.nest.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "declaration": false,
    "outDir": "./dist"
  }
}
```

## Étape 3 — Package `@miru/types`

Types partagés entre apps.

```bash
mkdir -p packages/types/src
```

### `packages/types/package.json`

```json
{
  "name": "@miru/types",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

### `packages/types/tsconfig.json`

```json
{
  "extends": "@miru/config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

### `packages/types/src/index.ts`

```ts
// Enums
export enum AnimeStatus {
  AIRING = "AIRING",
  FINISHED = "FINISHED",
  ANNOUNCED = "ANNOUNCED",
  HIATUS = "HIATUS",
}

export enum AnimeFormat {
  TV = "TV",
  MOVIE = "MOVIE",
  OVA = "OVA",
  ONA = "ONA",
  SPECIAL = "SPECIAL",
}

export enum WatchStatus {
  WATCHING = "WATCHING",
  COMPLETED = "COMPLETED",
  PLANNED = "PLANNED",
  DROPPED = "DROPPED",
  ON_HOLD = "ON_HOLD",
}

export enum CharacterRole {
  MAIN = "MAIN",
  SUPPORTING = "SUPPORTING",
  ANTAGONIST = "ANTAGONIST",
}

// Shared interfaces (used across apps, distinct from Prisma models)
export interface AnimeCard {
  id: string;
  title: string;
  titleJp: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  status: AnimeStatus;
  format: AnimeFormat;
  year: number | null;
  studioName: string | null;
  averageRating: number | null;
  genres: string[];
}

export interface EpisodeItem {
  id: string;
  number: number;
  title: string | null;
  duration: number | null;
  airedAt: Date | null;
}

export interface CharacterCard {
  id: string;
  name: string;
  nameJp: string | null;
  imageUrl: string | null;
  role: CharacterRole;
}

export interface UserAnimeEntry {
  animeId: string;
  status: WatchStatus;
  currentEpisode: number;
  rating: number | null;
  isFavorite: boolean;
}
```

## Étape 4 — Package `@miru/db`

Prisma schema + client.

```bash
mkdir -p packages/db/prisma
```

### `packages/db/package.json`

```json
{
  "name": "@miru/db",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6"
  },
  "devDependencies": {
    "prisma": "^6",
    "tsx": "^4",
    "typescript": "^5"
  }
}
```

### `packages/db/src/index.ts`

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
```

> Le schema Prisma sera créé dans une étape dédiée (`packages/db/prisma/schema.prisma`).

## Étape 5 — Package `@miru/anilist`

Client API AniList (GraphQL).

```bash
mkdir -p packages/anilist/src
```

### `packages/anilist/package.json`

```json
{
  "name": "@miru/anilist",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "graphql-request": "^7"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

### `packages/anilist/src/index.ts`

```ts
export { AniListClient } from "./client";
export type { AniListAnime, AniListCharacter } from "./types";
```

### `packages/anilist/src/client.ts`

```ts
import { GraphQLClient } from "graphql-request";
import { ANIME_DETAIL_QUERY, ANIME_SEARCH_QUERY, TRENDING_QUERY } from "./queries";
import type { AniListAnime } from "./types";

const ANILIST_API = "https://graphql.anilist.co";

export class AniListClient {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(ANILIST_API, {
      headers: { "Content-Type": "application/json" },
    });
  }

  async getTrending(page = 1, perPage = 20): Promise<AniListAnime[]> {
    const data = await this.client.request<any>(TRENDING_QUERY, { page, perPage });
    return data.Page.media;
  }

  async search(query: string, page = 1, perPage = 20): Promise<AniListAnime[]> {
    const data = await this.client.request<any>(ANIME_SEARCH_QUERY, { query, page, perPage });
    return data.Page.media;
  }

  async getById(id: number): Promise<AniListAnime> {
    const data = await this.client.request<any>(ANIME_DETAIL_QUERY, { id });
    return data.Media;
  }
}
```

### `packages/anilist/src/queries.ts`

Placeholder — les queries GraphQL complètes seront ajoutées lors de l'étape data sync.

```ts
export const MEDIA_FRAGMENT = `
  fragment MediaFragment on Media {
    id
    title { romaji english native }
    description
    coverImage { large extraLarge color }
    bannerImage
    format
    status
    season
    seasonYear
    episodes
    duration
    genres
    averageScore
    studios(isMain: true) { nodes { name } }
    characters(sort: ROLE, perPage: 25) {
      edges {
        role
        node { id name { full native } image { large } }
        voiceActors(language: JAPANESE) { name { full } }
      }
    }
    streamingEpisodes { title thumbnail url site }
  }
`;

export const TRENDING_QUERY = `
  query Trending($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: TRENDING_DESC, type: ANIME) { ...MediaFragment }
    }
  }
  ${MEDIA_FRAGMENT}
`;

export const ANIME_SEARCH_QUERY = `
  query Search($query: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(search: $query, type: ANIME) { ...MediaFragment }
    }
  }
  ${MEDIA_FRAGMENT}
`;

export const ANIME_DETAIL_QUERY = `
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) { ...MediaFragment }
  }
  ${MEDIA_FRAGMENT}
`;
```

### `packages/anilist/src/types.ts`

```ts
export interface AniListAnime {
  id: number;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  coverImage: {
    large: string | null;
    extraLarge: string | null;
    color: string | null;
  };
  bannerImage: string | null;
  format: string | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  genres: string[];
  averageScore: number | null;
  studios: { nodes: { name: string }[] };
  characters: {
    edges: AniListCharacterEdge[];
  };
  streamingEpisodes: {
    title: string;
    thumbnail: string | null;
    url: string;
    site: string;
  }[];
}

export interface AniListCharacterEdge {
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
  node: {
    id: number;
    name: { full: string; native: string | null };
    image: { large: string | null };
  };
  voiceActors: { name: { full: string } }[];
}
```

## Étape 6 — Package `@miru/ui`

> Voir le fichier dédié `packages/ui/CLAUDE.md` pour le setup complet du design system.

## Étape 7 — App `web` (Next.js 15)

```bash
cd apps
pnpm create next-app web --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
```

### Ajuster `apps/web/package.json`

Ajouter les dépendances workspace :

```json
{
  "dependencies": {
    "@miru/ui": "workspace:*",
    "@miru/db": "workspace:*",
    "@miru/types": "workspace:*",
    "@miru/anilist": "workspace:*"
  }
}
```

### `apps/web/tsconfig.json`

```json
{
  "extends": "@miru/config/tsconfig.next.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Étape 8 — App `api` (NestJS)

```bash
cd apps
nest new api --package-manager pnpm --strict
```

### Ajuster `apps/api/package.json`

```json
{
  "dependencies": {
    "@miru/db": "workspace:*",
    "@miru/types": "workspace:*",
    "@miru/anilist": "workspace:*"
  }
}
```

### `apps/api/tsconfig.json`

```json
{
  "extends": "@miru/config/tsconfig.nest.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./"
  },
  "include": ["src/**/*"]
}
```

## Étape 9 — Installer et vérifier

```bash
# À la racine
pnpm install
pnpm turbo build
pnpm dev
```

## Variables d'environnement

### `.env` (racine, copié par les apps)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/miru"
BETTER_AUTH_SECRET="generate-a-secret"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Conventions

- **Imports internes** : toujours via `@miru/*` pour les packages workspace
- **Naming** : camelCase pour les variables/fonctions, PascalCase pour les composants/types, SCREAMING_SNAKE pour les constantes
- **Fichiers** : kebab-case pour tous les noms de fichiers
- **Exports** : barrel exports via `index.ts` dans chaque package
- **Pas de `default export`** sauf pour les pages/layouts Next.js

## Guides par zone

Claude Code charge automatiquement le CLAUDE.md le plus proche. Chaque zone a le sien :

- [apps/api/CLAUDE.md](apps/api/CLAUDE.md) — architecture hexagonale NestJS (ports & adapters, 3 couches)
- [packages/ui/CLAUDE.md](packages/ui/CLAUDE.md) — design system Miru (tokens, adaptive theming, conventions visuelles)

Avant d'écrire du code dans une zone, lis le CLAUDE.md correspondant.

## Commandes slash du projet

Disponibles via `/nom-de-commande` dans Claude Code (fichiers dans [.claude/commands/](.claude/commands/)) :

| Commande       | Rôle                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| `/commit`      | Créer un commit atomique avec message conventionnel (scope monorepo)     |
| `/pr`          | Ouvrir une PR sur GitHub avec résumé structuré                           |
| `/check`       | `pnpm turbo type-check build` + remonter les erreurs                     |
| `/dev`         | Lancer `pnpm dev` (web + api) en tâche de fond                           |
| `/new-module`  | Scaffolder un module hexagonal complet dans `apps/api/src/modules/`      |
| `/new-usecase` | Ajouter un use case + DTO + mapper + wiring dans un module existant      |
| `/new-ui`      | Créer un composant `@miru/ui` avec le pattern projet                     |
| `/sync-db`     | `prisma format && prisma validate && prisma generate` (pas de `db push`) |

## Subagents du projet

Disponibles dans [.claude/agents/](.claude/agents/) :

- **`hex-architect`** — Audite le respect des règles hexagonales (imports interdits, dépendances, naming). À invoquer après modification de `apps/api/src/modules/` ou `apps/api/src/shared/`.
- **`ui-stylist`** — Revoit un composant `@miru/ui` contre les règles du design system (opacité, radius, fonts, interdictions).
- **`prisma-schema`** — Propose des évolutions de `packages/db/prisma/schema.prisma` en cohérence avec les entities du domaine.

## Règles de collaboration avec Claude

- **Fidélité aux specs CLAUDE.md** : quand une spec existe dans un CLAUDE.md de zone, la suivre mot-à-mot. Ne pas réinventer.
- **Règle de dépendance hexagonale** : jamais d'import depuis `domain/` vers `infrastructure/` ou `@nestjs/*`. Voir [apps/api/CLAUDE.md](apps/api/CLAUDE.md).
- **Pas de `any` implicite** : TS strict partout. Les `any` doivent être explicites et commentés (surface Prisma/AniList uniquement).
- **Pas de `console.log`** en dehors de `main.ts` ou de scripts — utiliser le logger NestJS (`Logger`) ou une abstraction.
- **Tests** : use cases mockent les ports. Repositories se testent en intégration (avec une DB de test, plus tard).
- **Avant de commit** : lancer `/check`. Avant de PR : relire le diff et le tester manuellement si UI.
