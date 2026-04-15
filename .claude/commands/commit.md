---
description: Créer un commit atomique avec message Conventional Commits scopé monorepo
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

Crée un commit atomique pour les changements en cours.

## Contexte automatique

!`git status --short`

!`git diff --stat`

!`git log --oneline -10`

## Instructions

1. Analyse le diff ci-dessus.
2. Regroupe les changements par scope (un seul scope par commit — si plusieurs scopes, arrête-toi et demande à découper).
3. Choisis le scope parmi :
   - `api` (changes dans `apps/api/`)
   - `web` (changes dans `apps/web/`)
   - `ui` (changes dans `packages/ui/`)
   - `db` (changes dans `packages/db/`)
   - `types` (changes dans `packages/types/`)
   - `anilist` (changes dans `packages/anilist/`)
   - `config` (changes dans `packages/config/`)
   - `repo` (racine : turbo.json, pnpm-workspace, CLAUDE.md, .claude/)
4. Choisis le type : `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`.
5. Format : `type(scope): description courte impérative` (≤72 chars, pas de point final).
6. **Ne mentionne JAMAIS Claude, Claude Code, ou un assistant IA** dans le message (titre ou body). Pas de `Co-Authored-By: Claude`, pas de "generated with Claude Code", rien.
7. Pour les changements UI dans `packages/ui/` : **respecter la règle atomic design** — vérifier que les nouveaux composants sont bien placés dans `atoms/`, `molecules/`, `organisms/` ou `templates/` selon leur niveau. Si un composant est au mauvais niveau, le signaler avant de commit. Voir [packages/ui/CLAUDE.md](../../packages/ui/CLAUDE.md) pour les règles.
8. N'inclus **JAMAIS** `.env` ni fichiers sensibles. `git add` fichier par fichier, pas `-A`.
9. Avant le commit, propose le message à l'utilisateur et attends confirmation si le scope est ambigu.

Arguments éventuels : $ARGUMENTS (peuvent contenir une instruction comme "wip", "split en 2", etc.)
