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

## Atomic design — organisation des composants

`packages/ui/src/components/` suit la hiérarchie atomic design :

```
components/
├── atoms/          → éléments indivisibles (Text, Button, Badge, Icon, Input, Spinner)
├── molecules/      → combinaisons d'atoms (SearchInput, FilterChip, RatingDisplay, PlatformBadge)
├── organisms/      → sections composites avec sens métier (AnimeCard, AnimeHero, EpisodeRow, CharacterCard)
├── templates/      → layouts de page sans données (CatalogTemplate, AnimeDetailTemplate)
└── (pages)         → instanciées côté apps/web/ — JAMAIS dans @miru/ui
```

### Règle de dépendance

`atoms` → indépendants.
`molecules` → peuvent importer `atoms`.
`organisms` → peuvent importer `atoms` + `molecules`.
`templates` → peuvent importer tous les niveaux inférieurs.

Jamais de remontée inverse (un atom n'importe pas une molecule).

### Où placer un nouveau composant ?

- **Atom** : bouton, badge, input, icône — pas de composition interne, pas de sens métier.
- **Molecule** : un champ de recherche (input + icon), un chip (badge + bouton close), une star rating (5 icons + label).
- **Organism** : une card produit complète, un header d'app, une grille filtrable — porte du sens métier.
- **Template** : la mise en page vide d'une page — slots pour hero, grid, sidebar.

En cas de doute, commencer plus bas (atom/molecule) et promouvoir si ça grossit.

## Structure d'un composant

```
src/components/{niveau}/{name}/
├── {name}.tsx
├── {name}.types.ts   (si props > 5 ou types exportés)
└── index.ts
```

Exemple : `src/components/organisms/anime-card/anime-card.tsx`.

Pattern :

```tsx
import { cn } from "../../../utils/cn";

interface AnimeCardProps {
  title: string;
  coverUrl: string | null;
  className?: string;
}

export function AnimeCard({ title, coverUrl, className }: AnimeCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-bg-surface",
        "transition-transform duration-200 ease-out hover:-translate-y-1",
        className,
      )}
    >
      {/* ... */}
    </article>
  );
}
```

Exporter depuis le barrel de niveau : `src/components/organisms/index.ts` réexporte `AnimeCard`. Le barrel racine [src/index.ts](src/index.ts) fait `export * from "./components/organisms"`. Pas besoin d'éditer l'index racine pour chaque nouveau composant.

## Composants P0 (MVP) par niveau

**Atoms** : `Text`, `Button`, `Badge`, `Icon`, `Input`, `Spinner`
**Molecules** : `SearchInput`, `FilterChip`, `RatingDisplay`, `PlatformBadge`, `WatchlistButton`, `StatusSelector`
**Organisms** : `AnimeCard` ✓, `AnimeHero`, `EpisodeRow`, `CharacterCard`, `Toast`, `Shimmer`
**Templates** : `CatalogTemplate`, `AnimeDetailTemplate`

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
