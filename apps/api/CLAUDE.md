# Miru API — Architecture Monolithe Hexagonale

> Backend NestJS en architecture hexagonale (Ports & Adapters).
> Place ce fichier dans `apps/api/CLAUDE.md`.

## Philosophie

- **Monolithe modulaire** : un seul déployable, mais découpé en modules métier autonomes.
- **Hexagonal** : le domaine est au centre, protégé de l'infrastructure. Aucune dépendance vers l'extérieur.
- **Ports & Adapters** : le domaine expose des ports (interfaces). L'infra fournit les adapters (implémentations).
- **Use Cases explicites** : chaque action métier est un use case isolé, testable, injecté.
- **Le framework est un détail** : NestJS est un adapter. On pourrait le remplacer sans toucher au domaine.

## Architecture globale

```
apps/api/src/
├── modules/                     → Modules métier (bounded contexts)
│   ├── anime/
│   │   ├── domain/              → Cœur métier, ZÉRO dépendance externe
│   │   │   ├── entities/        → Entités et Value Objects
│   │   │   ├── ports/           → Interfaces (in & out)
│   │   │   └── exceptions/      → Exceptions domaine
│   │   ├── application/         → Orchestration, use cases
│   │   │   ├── use-cases/       → 1 fichier = 1 use case
│   │   │   ├── dtos/            → DTOs d'entrée/sortie (validation)
│   │   │   └── mappers/         → Entity ↔ DTO mapping
│   │   ├── infrastructure/      → Adapters (implémentations)
│   │   │   ├── persistence/     → Repository Prisma
│   │   │   ├── http/            → Controllers NestJS
│   │   │   └── external/        → Clients API tiers (AniList)
│   │   └── anime.module.ts      → Module NestJS (wiring)
│   ├── user/
│   ├── watchlist/
│   ├── review/
│   └── sync/                    → Module d'import AniList
├── shared/                      → Code partagé cross-modules
│   ├── domain/                  → Base classes, interfaces communes
│   │   ├── entity.base.ts
│   │   ├── value-object.base.ts
│   │   ├── repository.port.ts
│   │   └── use-case.base.ts
│   ├── infrastructure/          → Adapters partagés
│   │   ├── prisma/
│   │   │   └── prisma.service.ts
│   │   ├── guards/
│   │   ├── filters/
│   │   │   └── domain-exception.filter.ts
│   │   ├── interceptors/
│   │   └── pipes/
│   └── utils/
├── app.module.ts                → Module racine, importe tous les modules
└── main.ts                      → Bootstrap NestJS
```

## Les 3 couches — Règles strictes

### 1. Domain (centre)

Le domaine **ne connaît rien** de l'extérieur. Pas de decorators NestJS, pas de Prisma, pas de HTTP. Uniquement du TypeScript pur.

**Imports autorisés :** `@miru/types` uniquement.
**Imports interdits :** `@nestjs/*`, `@prisma/*`, `class-validator`, `class-transformer`, toute lib infra.

### 2. Application (orchestration)

**Imports autorisés :** `domain/`, `@miru/types`, `class-validator`, `class-transformer`.
**Imports interdits :** `@prisma/*`, controllers, tout adapter concret.

### 3. Infrastructure (adapters)

**Imports autorisés :** tout. C'est la couche externe.

## Règle de dépendance

```
Infrastructure → Application → Domain
```

Jamais de flèche dans l'autre sens. Le domaine ne sait pas que Prisma existe. L'application ne sait pas que les controllers existent.

## Communication inter-modules

Via **exports NestJS** (injection de ports), jamais par import direct d'un use case d'un autre module.
Pour les side effects cross-modules, utiliser `EventEmitter2`.

## Conventions de naming

| Type         | Convention                  | Exemple                         |
| ------------ | --------------------------- | ------------------------------- |
| Entity       | `PascalCase` + `Entity`     | `AnimeEntity`                   |
| Value Object | `PascalCase` + `VO`         | `RatingVO`                      |
| Port         | `PascalCase` + `Port`       | `AnimeRepositoryPort`           |
| Use Case     | `PascalCase` + `UseCase`    | `GetAnimeCatalogUseCase`        |
| Repository   | `Prisma` + `PascalCase`     | `PrismaAnimeRepository`         |
| Controller   | `PascalCase` + `Controller` | `AnimeController`               |
| DTO          | `PascalCase` + `Dto`        | `AnimeCatalogQueryDto`          |
| Token        | `SCREAMING_SNAKE`           | `ANIME_REPOSITORY`              |
| Exception    | `PascalCase` + `Exception`  | `AnimeNotFoundException`        |
| Fichiers     | `kebab-case`                | `get-anime-catalog.use-case.ts` |

## Modules du projet

| Module      | Responsabilité                            | Ports sortants                 |
| ----------- | ----------------------------------------- | ------------------------------ |
| `anime`     | CRUD anime, catalogue, recherche, fiches  | AnimeRepositoryPort            |
| `user`      | Auth, profil, préférences                 | UserRepositoryPort             |
| `watchlist` | Statuts, progression, favoris             | WatchlistRepositoryPort        |
| `review`    | Notes, reviews, modération                | ReviewRepositoryPort           |
| `sync`      | Import AniList, sync data, enrichissement | AnimeSyncPort, AnimeRepository |
| `character` | Personnages, VA, liens anime              | CharacterRepositoryPort        |
| `platform`  | Plateformes de streaming, liens           | PlatformRepositoryPort         |

Seul `anime` est scaffoldé pour l'instant comme template de référence. Les autres suivront le même pattern.

## Tests

Les use cases se testent en **mockant les ports** (pas besoin de DB). C'est l'avantage principal de l'hexagonal.
