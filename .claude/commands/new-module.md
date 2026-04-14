---
description: Scaffolder un module hexagonal complet dans apps/api/src/modules/
argument-hint: <nom-module> (ex: watchlist, review, user)
---

Crée un nouveau module hexagonal dans `apps/api/src/modules/$ARGUMENTS/`.

## Prérequis

- Lis [apps/api/CLAUDE.md](apps/api/CLAUDE.md) avant tout — c'est la source de vérité.
- Le nom du module est : **$ARGUMENTS** (PascalCase pour les classes, kebab-case pour les fichiers).

## Structure à générer

Copie le pattern exact du module `anime` existant ([apps/api/src/modules/anime/](apps/api/src/modules/anime/)). Remplace `Anime`/`anime` par le nom reçu.

```
apps/api/src/modules/{name}/
├── domain/
│   ├── entities/{name}.entity.ts           (Entity étendant @shared/domain/entity.base)
│   ├── ports/{name}-repository.port.ts     (interface RepositoryPort + filtres)
│   └── exceptions/{name}.exceptions.ts     (NotFoundException spécialisée)
├── application/
│   ├── tokens.ts                           (Symbol injection token)
│   ├── use-cases/get-{name}-detail.use-case.ts
│   ├── dtos/{name}.dto.ts                  (class-validator)
│   └── mappers/{name}.mapper.ts
├── infrastructure/
│   ├── persistence/prisma-{name}.repository.ts
│   └── http/{name}.controller.ts
└── {name}.module.ts                        (wiring NestJS avec provide/useClass)
```

## Règles

1. **Domain** : n'importe que `@miru/types` et `@shared/domain/*`. Jamais `@nestjs/*` ni Prisma.
2. **Use case** : utilise `@Inject(TOKEN)` pour récupérer le port.
3. **Module** : enregistre le binding `{ provide: XXX_REPOSITORY, useClass: PrismaXxxRepository }`.
4. **app.module.ts** : ajoute le nouveau module dans `imports`.
5. **schema.prisma** : si le module a besoin d'un modèle Prisma, **demande** à l'utilisateur avant d'éditer le schema — ne scaffolde pas de modèle arbitraire.
6. Après scaffold : lance `/check` pour vérifier que ça compile.

## Ce que tu NE fais PAS

- N'invente pas de use cases non demandés : crée juste `get-{name}-detail` comme template minimal. Les autres seront ajoutés via `/new-usecase`.
- N'ajoute pas de tests à ce stade.
- N'édite pas le schema Prisma sans validation explicite.
