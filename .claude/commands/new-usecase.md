---
description: Ajouter un use case dans un module hexagonal existant
argument-hint: <module> <action> (ex: anime search, watchlist add-entry)
---

Arguments : **$ARGUMENTS** (attendu: `<module> <action-kebab>`).

## Instructions

1. Parse `$ARGUMENTS` → `{module}` et `{action}`. Si le format est invalide, demande.
2. Vérifie que `apps/api/src/modules/{module}/` existe. Sinon, suggère `/new-module {module}` d'abord.
3. Crée :
   - `apps/api/src/modules/{module}/application/use-cases/{action}.use-case.ts` — classe `{Action}UseCase implements UseCase<TInput, TOutput>`, `@Injectable()`, injection du port via `@Inject(TOKEN)`.
   - Si l'action a besoin d'un DTO d'entrée HTTP : `apps/api/src/modules/{module}/application/dtos/{action}.dto.ts`.
4. Enregistre le use case dans `{module}.module.ts` (`providers: [...]`).
5. Ajoute la route dans le controller existant si c'est une lecture/écriture HTTP (`@Get`, `@Post`, etc.).
6. Le use case doit :
   - Lever une `DomainException` spécifique si échec métier (jamais `HttpException` direct)
   - Retourner une `AnimeEntity`/domain object — le mapping vers DTO de sortie se fait dans le controller via `{Module}Mapper`
7. Lance `/check` à la fin.

## Ne fais PAS

- N'injecte pas d'adapter concret (`PrismaXxxRepository`) — toujours le port via token.
- N'ajoute pas de logique métier dans le controller.
- N'ajoute pas de logging `console.log`.
