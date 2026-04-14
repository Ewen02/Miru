---
description: Lancer type-check et build sur tout le monorepo
allowed-tools: Bash(pnpm turbo:*), Bash(pnpm install:*)
---

Vérifie que tout le monorepo compile et type-check.

## Instructions

1. Lance `pnpm turbo type-check build` en une seule commande.
2. Si un package échoue, identifie lequel via le préfixe `<package>:build:` dans les logs.
3. Pour chaque erreur TypeScript, donne :
   - Le fichier (avec lien markdown `path:line`)
   - La cause probable
   - La correction suggérée
4. Ne tente pas de corriger automatiquement — laisse l'utilisateur décider.
5. Si le build est vert, affiche juste `✓ type-check + build OK` et termine.

Arguments : $ARGUMENTS (ex: `--filter=api` pour ne checker qu'un seul package).
