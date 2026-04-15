---
description: Créer un composant @miru/ui en respectant l'atomic design (atoms/molecules/organisms/templates)
argument-hint: <niveau> <nom-kebab-case> (ex: atom button, organism anime-hero)
---

Arguments attendus : **$ARGUMENTS** → `<niveau> <nom-kebab-case>`.

Si le niveau n'est pas donné, demande-le à l'utilisateur. Valeurs valides : `atom`, `molecule`, `organism`, `template`.

## Prérequis

Lis [packages/ui/CLAUDE.md](packages/ui/CLAUDE.md) en entier avant de scaffolder — surtout les sections "Atomic design", "Règles dures", et "Composants P0".

## Choisir le bon niveau

- **atom** : élément indivisible (Button, Badge, Icon, Input, Text). Pas de composition interne, pas de sens métier.
- **molecule** : combinaison d'atoms (SearchInput = input + icon, RatingDisplay = stars + label).
- **organism** : section composite avec sens métier (AnimeCard, AnimeHero, EpisodeRow, Toast).
- **template** : layout de page sans données, avec slots (CatalogTemplate, AnimeDetailTemplate).

En cas de doute, commencer plus bas (atom/molecule) et promouvoir si besoin.

## Structure

```
packages/ui/src/components/{niveau}s/{name}/
├── {name}.tsx          (composant React — props interface inline si simple)
├── {name}.types.ts     (OPTIONNEL — seulement si props > 5 ou types exportés)
└── index.ts            (re-export du composant)
```

Exemples de chemins :

- `packages/ui/src/components/atoms/button/button.tsx`
- `packages/ui/src/components/organisms/anime-hero/anime-hero.tsx`

## Template

```tsx
// packages/ui/src/components/{niveau}s/{name}/{name}.tsx
import { cn } from "../../../utils/cn";

interface {Name}Props {
  // ...
  className?: string;
}

export function {Name}({ className, ...props }: {Name}Props) {
  return (
    <div className={cn(
      "bg-bg-surface border border-border rounded-lg",
      className,
    )}>
      {/* ... */}
    </div>
  );
}
```

## Règles (voir `packages/ui/CLAUDE.md`)

- **Fonts** : `font-display` (titres), `font-body` (texte), `font-mono` (data). Jamais Inter/Roboto/Arial.
- **Texte** : `text-text-primary`, `text-text-secondary`, `text-text-tertiary` (opacités, pas des gris distincts).
- **Radius** : `rounded-sm` (tags), `rounded-md` (inputs/buttons), `rounded-lg` (cards), `rounded-xl` (containers). `rounded-full` uniquement pour avatars.
- **Transitions** : `transition-*` avec `duration-200` ou `duration-300` sur tout ce qui est interactif.
- **Focus** : `focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none`.
- **Interdits** : gradients violet-bleu décoratifs, blobs flous, ombres portées sur cards, mode clair.

## Règle de dépendance atomic

Un niveau ne peut importer QUE des niveaux inférieurs :

- `atoms` → indépendants
- `molecules` → `atoms`
- `organisms` → `atoms` + `molecules`
- `templates` → tous les niveaux inférieurs

Jamais l'inverse. Un atom n'importe JAMAIS une molecule.

## Ensuite

1. Ajoute le re-export dans `packages/ui/src/components/{niveau}s/index.ts` (le barrel racine `src/index.ts` fait `export * from` → pas à toucher).
2. Invoque le subagent `ui-stylist` pour revoir le composant.
3. Si besoin d'une démo, ajoute une route dans `apps/web/src/app/` — pas de Storybook au MVP.
