---
description: Formater, valider et regénérer le client Prisma (pas de db push)
allowed-tools: Bash(pnpm --filter @miru/db:*), Bash(pnpm prisma:*)
---

Synchronise le schema Prisma.

## Étapes

1. `pnpm --filter @miru/db exec prisma format` — formatte `schema.prisma`.
2. `pnpm --filter @miru/db exec prisma validate` — valide la syntaxe et les relations.
3. `pnpm --filter @miru/db exec prisma generate` — regénère le client.
4. Si l'utilisateur passe `push` dans $ARGUMENTS, ajoute `pnpm --filter @miru/db exec prisma db push` APRÈS confirmation explicite (opération destructrice sur la DB).
5. Si `migrate` dans $ARGUMENTS, lance `prisma migrate dev --name <nom-demandé>` (demande le nom).

## Ne fais PAS

- Jamais `db push` ou `migrate` sans confirmation.
- Jamais `migrate reset` sans demander.
- Ne touche pas au schema lui-même — utilise l'agent `prisma-schema` si tu as besoin d'évolutions.

Arguments : $ARGUMENTS (ex: `push`, `migrate`).
