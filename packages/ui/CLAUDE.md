# @miru/ui — Design System

Design system de Miru. Le setup du package est archivé dans [.claude/docs/ui-setup.md](../../.claude/docs/ui-setup.md).

## Philosophie

- **Le contenu est le design.** Les visuels anime portent l'identité, le système est un cadre neutre.
- **Adaptive theming.** Pas de couleur d'accent fixe — la teinte est extraite du cover art.
- **Opacité > couleurs multiples.** Un seul blanc modulé en opacité sur fond sombre.
- **Pas de composants shadcn tels quels.** Tout est custom ou lourdement modifié.
- **Dark-only au MVP.**

## Tokens disponibles

Source : [src/tokens/](src/tokens/). Utiliser via les classes Tailwind générées depuis `apps/web/src/app/globals.css` (`@theme`).

### Couleurs

- **Backgrounds** : `bg-bg-base` (#08080c), `bg-bg-surface` (#111118), `bg-bg-elevated` (#1a1a24)
- **Borders** : `border-border` (#1e1e2a), `border-border-subtle` (#16161f)
- **Texte — opacités, pas des gris** :
  - `text-text-primary` (95%)
  - `text-text-secondary` (55%)
  - `text-text-tertiary` (32%)
- **Accent** : `text-accent`, `bg-accent-muted`, `bg-accent-subtle` — overridés dynamiquement par `useAdaptiveColor`
- **Status** : `success` (#3ecf8e), `warning` (#f5a623), `error` (#ef4444)

### Typographie

3 familles, 3 rôles :

- `font-display` → **Clash Display** — titres, noms d'anime
- `font-body` → **General Sans** — body, UI, descriptions
- `font-mono` → **JetBrains Mono** — données, metadata, chiffres

Fonts à charger dans `apps/web/src/app/layout.tsx` depuis Fontshare (Clash+General) et Google Fonts (JetBrains).

Type scale : voir [src/tokens/typography.ts](src/tokens/typography.ts) (`hero`, `h1`→`h3`, `body`, `bodySmall`, `label`, `sectionLabel`, `meta`, `data`).

### Radius

- `rounded-sm` (6px) — tags, pills
- `rounded-md` (10px) — inputs, buttons
- `rounded-lg` (12px) — cards
- `rounded-xl` (14px) — containers, modals
- `rounded-full` — **avatars uniquement**

### Spacing

Échelle : 0, 1 (4px), 2 (8px), 3, 4, 5, 6, 8, 10, 12, 14 (56px), 16. Respiration entre sections (`gap-14`+), densité dans les sections (`gap-3`–`gap-4`).

### Layout

- `maxWidth: 1200px`, `contentMaxWidth: 720px`
- `sidebarWidth: 280px`, `headerHeight: 64px`, `bottomBarHeight: 56px`

## Utilitaires

- `cn(...inputs)` — merge clsx + tailwind-merge ([src/utils/cn.ts](src/utils/cn.ts))
- `useAdaptiveColor(imageUrl)` — extrait la couleur dominante du cover art ([src/hooks/use-adaptive-color.ts](src/hooks/use-adaptive-color.ts))

## Structure d'un composant

```
src/components/{name}/
├── {name}.tsx
├── {name}.types.ts   (si props > 5 ou types exportés)
└── index.ts
```

Pattern :

```tsx
import { cn } from "../../utils/cn";

interface AnimeCardProps {
  title: string;
  coverUrl: string | null;
  className?: string;
}

export function AnimeCard({ title, coverUrl, className }: AnimeCardProps) {
  return (
    <article className={cn(
      "group relative overflow-hidden rounded-lg border border-border bg-bg-surface",
      "transition-transform duration-200 ease-out hover:-translate-y-1",
      className,
    )}>
      {/* ... */}
    </article>
  );
}
```

Ajouter le re-export dans [src/index.ts](src/index.ts).

## Composants P0 (MVP)

**Primitives** : `Text`, `Button`, `Badge`, `Icon`
**Layout** : `Container`, `Stack`, `Grid`
**Anime** : `AnimeCard`, `EpisodeRow`, `CharacterCard`, `PlatformBadge`, `RatingDisplay`, `WatchlistButton`, `StatusSelector`, `AnimeHero`
**Feedback** : `Toast`, `Shimmer`

## Règles dures

### On fait

- Opacité pour la hiérarchie texte (pas des gris différents)
- Transitions `duration-200`/`duration-300` sur tout ce qui est interactif
- Focus : `focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none`
- Images lazy-loaded avec placeholder shimmer

### On ne fait PAS

- Gradients violet-bleu décoratifs
- Blobs flous décoratifs
- Shadows sur les cards (borders subtiles à la place)
- Mode clair
- Icônes Lucide partout (seulement si elles ajoutent du sens)
- Composants shadcn non customisés
- `Inter` / `Roboto` / `Arial`
- `rounded-full` hors avatars
- `default export`

## Animations prioritaires

1. **View Transitions** cover card → hero fiche (shared element)
2. **Scroll compression** hero → header compact
3. **Hover cards** scale subtil + reveal synopsis
4. **Watchlist toggle** pulse + rotation icône
5. **Episode progression** slide counter

## Audit

Après création/modif d'un composant, invoquer le subagent `ui-stylist` pour vérifier la conformité aux règles ci-dessus.
