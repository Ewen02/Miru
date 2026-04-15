---
description: Formate tout le monorepo avec Prettier (ou vérifie avec `check`)
allowed-tools: Bash(pnpm format:*), Bash(pnpm format), Bash(pnpm exec prettier:*)
---

Formate l'ensemble du monorepo avec Prettier.

## Instructions

1. Si `$ARGUMENTS` contient `check` : lance `pnpm format:check` (mode read-only, liste les fichiers non formatés, exit non-zero si divergence).
2. Sinon : lance `pnpm format` (corrige en place).
3. Affiche le résumé :
   - En mode `check` : nombre de fichiers divergents, liste des premiers si > 0.
   - En mode write : nombre de fichiers modifiés.
4. Si `check` échoue, indique la commande de fix : `Lance /format pour corriger`.

## Config

- Règles dans `.prettierrc` racine (double quotes, trailing commas, printWidth 100, semi).
- Exclusions dans `.prettierignore` (dist, .next, node_modules, migrations Prisma, lockfile).

Arguments : $ARGUMENTS (ex: `check` pour mode read-only).
