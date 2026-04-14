---
description: Créer un composant dans packages/ui/src/components/
argument-hint: <nom-kebab-case> (ex: anime-card, episode-row)
---

Nom du composant : **$ARGUMENTS** (kebab-case pour fichier, PascalCase pour classe React).

## Prérequis

Lis [packages/ui/CLAUDE.md](packages/ui/CLAUDE.md) en entier avant de scaffolder — surtout les sections "Patterns de composant" et "Règles de design à respecter".

## Structure

```
packages/ui/src/components/{name}/
├── {name}.tsx          (composant React — props interface inline si simple, fichier dédié si complexe)
├── {name}.types.ts     (OPTIONNEL — seulement si props > 5 ou types exportés)
└── index.ts            (re-export du composant)
```

## Template

```tsx
// packages/ui/src/components/{name}/{name}.tsx
import { cn } from "../../utils/cn";

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

## Ensuite

1. Ajoute le re-export dans `packages/ui/src/index.ts` (décommenter la section "Components").
2. Invoque le subagent `ui-stylist` pour revoir le composant.
3. Si besoin d'une démo, ajoute une route dans `apps/web/src/app/` — pas de Storybook au MVP.
