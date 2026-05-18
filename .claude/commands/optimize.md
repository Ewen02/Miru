---
description: Audit d'optimisation (best practices, clean code, refacto, perf) sur api|web|ui|db|deps|dx
argument-hint: [api|web|ui|db|deps|dx] (optionnel — sans argument, audit complet)
---

Lance un audit profond d'optimisation sur le monorepo Miru. Trouve des opportunités concrètes de refacto, identifie le dead code, les violations de conventions, et les problèmes de perf.

## Différence avec `/check`

- `/check` = correctness (type-check + build).
- `/optimize` = qualité : best practices, clean code, refacto, perf, conventions projet.

## Mode d'emploi

- Sans argument (`$ARGUMENTS` vide) : audit les **6 domaines en parallèle**.
- Avec argument : focus sur le domaine demandé. Domaines valides : `api`, `web`, `ui`, `db`, `deps`, `dx`.
- Argument invalide → message d'erreur listant les domaines valides, puis stop.

## Périmètre

- **Phase audit = strictement read-only.** Aucun `Edit`/`Write`/`Bash` mutant.
- **Phase quick-wins (post-audit)** : la seule où tu peux éditer, et uniquement après confirmation explicite de l'utilisateur sur les findings d'effort `S`.

## Orchestration

1. Lis d'abord les CLAUDE.md de référence (racine, `apps/api/`, `packages/ui/`) — ils définissent ce qui est conforme.
2. Lance les sous-audits **en parallèle** dans un seul message (multiples appels Agent) :
   - `api` → délègue à **hex-architect** en mode complémentaire (instruction explicite : "ignore les boundaries hexagonales déjà couvertes par ton audit habituel ; focus uniquement sur les checks listés ci-dessous").
   - `ui` → délègue à **ui-stylist** en mode complémentaire (instruction : "ignore les tokens design system ; focus sur les checks listés ci-dessous").
   - `web`, `db`, `deps`, `dx` → un agent **Explore** par domaine, avec le brief des checks correspondants.
3. Agrège les rapports retournés en un seul rapport structuré (format ci-dessous).
4. Si au moins un finding a `Effort: S`, déclenche la phase quick-wins.

## Domaines & checks

### `api` — délégué à `hex-architect`

Path scanné : `apps/api/src/`. Brief obligatoire au subagent : "Ignore les règles d'architecture hexagonale (boundaries, naming, layering) — c'est déjà ton audit habituel. Pour cette mission `/optimize`, focus uniquement sur :"

- Use cases / services > 200 lignes ou > 5 dépendances injectées au constructeur.
- Requêtes Prisma dans une boucle (N+1 typique : `for (...) await repo.findById(...)`).
- `findMany` sans `select` ni `take` (sur-fetch).
- Logique métier dupliquée entre use cases (à extraire en domain service ou méthode partagée).
- Écritures multi-étapes hors `prisma.$transaction(...)`.
- DTOs ou mappers déclarés mais jamais utilisés.
- Méthodes publiques d'adapter / repository jamais appelées (dead code).
- `console.log` oubliés (doit être `Logger` NestJS) et `any` non justifiés en commentaire.

### `web` — Explore générique

Path scanné : `apps/web/src/`. Checks :

- `"use client"` posé sur un composant sans `useState` / `useEffect` / handler — devrait rester Server Component.
- `fetch()` sans politique `cache` ou `next: { revalidate }` explicite (Next 16).
- Imports lourds non sub-pathés (ex. `import _ from 'lodash'` au lieu de `import get from 'lodash/get'`).
- `loading.tsx` ou `error.tsx` manquants sur les routes dynamiques critiques.
- Server Actions qui mutent sans `revalidatePath` ou `revalidateTag` derrière.
- `<Image>` au-dessus du fold sans `priority`, ou sans `sizes` quand `fill` est utilisé.
- Fetchers / appels API dupliqués entre pages — devraient vivre dans `apps/web/src/lib/`.
- `default export` ailleurs que dans `page.tsx` / `layout.tsx` / `error.tsx` / `loading.tsx`.

### `ui` — délégué à `ui-stylist`

Path scanné : `packages/ui/src/components/`. Brief obligatoire : "Ignore les tokens design system (fonts, colors, radius, spacing, hard rules) — c'est ton audit habituel. Pour cette mission `/optimize`, focus uniquement sur :"

- Composants exportés via barrel mais jamais importés ailleurs (dead exports).
- Variants CVA déclarées et jamais utilisées.
- Props identiques répétées dans 3+ composants — à factoriser en interface partagée.
- Niveau atomic incorrect (atom qui importe une molecule/organism, etc. — sens de dépendance inversé).
- `forwardRef` manquant sur primitives interactives qui en ont besoin (input, button, select).

### `db` — Explore

Paths scannés : `packages/db/prisma/schema.prisma` + tous les `*.repository.ts` dans `apps/api/src/modules/*/infrastructure/persistence/`. Checks :

- FK fréquemment requêtées (apparaissent dans des `where:` de repositories) sans `@@index`.
- Champs `String` qui devraient être un `enum` Prisma (valeurs finies, codées en dur dans le code).
- Relations sans `onDelete` explicite (risque d'orphelins ou de cascade non voulue).
- Modèles déclarés dans `schema.prisma` non référencés par aucun repository.
- Migrations non encore appliquées en attente dans `packages/db/prisma/migrations/`.
- Champs nullables sans raison métier claire.

### `deps` — Explore

Paths scannés : tous les `package.json` du monorepo. Checks :

- Versions divergentes du même package entre workspaces (ex. `react@19.0.0` ici, `react@19.1.0` là).
- Dépendances déclarées dans `package.json` mais jamais importées dans le code.
- Packages avec major obsolète (>1 version derrière la stable courante).
- `@types/*` orphelins (lib runtime supprimée mais types restés).
- Packages en `dependencies` qui devraient être `devDependencies` (build tools, types, test runners).
- Imports barrel qui empêchent le tree-shaking (`import * as X from '...'`).

### `dx` — Explore

Paths scannés : racine, `turbo.json`, `tsconfig*.json`, `.eslintrc*`, `.prettierrc*`, scripts de tous les `package.json`. Checks :

- `tsconfig.json` qui n'`extends` pas `packages/config`.
- Configs ESLint / Prettier divergentes entre packages.
- Tâches Turbo sans `outputs` déclarés (cache désactivé silencieusement).
- Scripts npm dupliqués entre apps/packages avec des noms incohérents.
- Module non trivial sans `CLAUDE.md` ni `AGENTS.md`.

## Format du rapport final

Une fois tous les sous-rapports reçus, agrège-les ainsi (en français) :

```markdown
# /optimize {domain|all} — YYYY-MM-DD

## Synthèse : N findings — C critical · H high · S cosmetic

### CRITICAL (impact L — bloquant prod)
#### [domaine] Titre court
- **Fichier** : [`apps/api/.../x.use-case.ts:42`](apps/api/.../x.use-case.ts#L42)
- **Constat** : description courte (1 ligne).
- **Pourquoi** : raison concrète (perf mesurable, lisibilité, violation conv projet…).
- **Proposé** :
  ```ts
  // code refactoré concret, valide TypeScript
  ```
- **Effort** : S | M | L

### HIGH (impact M — amélioration mesurable)
…

### COSMETIC (impact S — propreté code)
…

## Plan d'action priorisé

### Quick wins (< 1h chacun) — éligibles à `/optimize` auto-fix
1. …

### Effort moyen (1–4h)
1. …

### Gros refactos (4h+)
1. …
```

## Phase quick-wins (après affichage du rapport)

Si **au moins un finding a `Effort: S`** :

1. Récapitule en bloc les fixes éligibles (file:line + résumé du diff prévu).
2. Demande à l'utilisateur via `AskUserQuestion` s'il veut les appliquer (Tous / Aucun / Sélection).
3. Si "Tous" ou "Sélection" : applique uniquement les fixes confirmés via `Edit`. Un `Edit` par finding, pas de batch implicite.
4. Après application : lance `/check` pour vérifier que rien n'est cassé.
5. Si `/check` échoue, affiche les erreurs et n'essaie **pas** de corriger automatiquement — laisse l'utilisateur décider.

S'il n'y a aucun finding `S`, termine après le rapport.

## Règles strictes

- Les findings doivent reposer sur du **vrai code lu**, jamais sur des suppositions.
- `file:line` cliquable obligatoire pour chaque finding (format markdown `[path:line](path#Lline)`).
- Ne flag **pas** ce qui est conforme aux CLAUDE.md — flag uniquement les **violations**.
- Pas de fix proposé sans code concret (interdit : "envisager de refactorer", "considérer X").
- Groupe les findings similaires (ex. "5 services sans `select` Prisma" = 1 finding listant les 5 fichiers, pas 5 entrées).
- Trie par impact (Critical → High → Cosmetic), pas par domaine.
- Si un domaine ne retourne aucun finding, indique-le explicitement dans la synthèse (`api: ✓ rien à signaler`).
- Sortie **en français**.
