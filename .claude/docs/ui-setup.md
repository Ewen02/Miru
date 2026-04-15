# @miru/ui — Design System Setup Guide

> Design system de Miru. Ce fichier guide le setup complet du package UI.
> Place-le dans `packages/ui/CLAUDE.md`.

## Philosophie

- **Le contenu est le design.** Les visuels anime portent l'identité, le système est un cadre neutre.
- **Adaptive theming.** Pas de couleur d'accent fixe — la teinte est extraite du cover art de chaque anime.
- **Opacité > couleurs multiples.** Un seul blanc modulé en opacité sur fond sombre.
- **Pas de composants shadcn tels quels.** Tout est custom ou lourdement modifié.
- **Dark-only au MVP.** Un seul thème, bien exécuté.

## Init du package

```bash
mkdir -p packages/ui/src/{components,tokens,hooks,utils}
```

### `packages/ui/package.json`

```json
{
  "name": "@miru/ui",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "sideEffects": false,
  "scripts": {
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "typescript": "^5",
    "react": "^19",
    "react-dom": "^19",
    "@types/react": "^19"
  }
}
```

### `packages/ui/tsconfig.json`

```json
{
  "extends": "@miru/config/tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

## Design Tokens

### `packages/ui/src/tokens/colors.ts`

```ts
/**
 * Miru Color System
 *
 * Base: noir profond + blancs en opacité
 * Accent: dynamique, extrait du cover art anime
 * Pas de palette fixe brand — le contenu colore l'interface.
 */

export const colors = {
  // Backgrounds — du plus profond au plus élevé
  bg: {
    base: "#08080c", // fond principal
    surface: "#111118", // cards, containers
    elevated: "#1a1a24", // hover states, menus
    overlay: "rgba(8, 8, 12, 0.8)", // modals backdrop
  },

  // Borders
  border: {
    default: "#1e1e2a",
    subtle: "#16161f",
    focus: "rgba(255, 255, 255, 0.15)",
  },

  // Text — opacités du blanc, PAS des gris différents
  text: {
    primary: "rgba(255, 255, 255, 0.95)",
    secondary: "rgba(255, 255, 255, 0.55)",
    tertiary: "rgba(255, 255, 255, 0.32)",
    inverse: "#08080c",
  },

  // Semantic
  status: {
    success: "#3ecf8e",
    warning: "#f5a623",
    error: "#ef4444",
    info: "#60a5fa",
  },

  // Accent — valeurs par défaut (override par adaptive theming)
  accent: {
    default: "#c8a2ff",
    muted: "rgba(200, 162, 255, 0.12)",
    subtle: "rgba(200, 162, 255, 0.06)",
  },
} as const;

/**
 * Adaptive color CSS custom properties.
 * Ces variables sont overridées dynamiquement par page anime.
 *
 * Usage dans les composants :
 *   backgroundColor: "var(--accent)"
 *   backgroundColor: "var(--accent-muted)"
 */
export const adaptiveColorVars = {
  "--accent": colors.accent.default,
  "--accent-muted": colors.accent.muted,
  "--accent-subtle": colors.accent.subtle,
} as const;
```

### `packages/ui/src/tokens/typography.ts`

```ts
/**
 * Miru Typography System
 *
 * 3 familles, 3 rôles :
 * - Clash Display  → titres, noms d'anime, headings (personnalité)
 * - General Sans   → body, UI, descriptions (lisibilité)
 * - JetBrains Mono → données, metadata, chiffres (technique)
 */

export const fontFamily = {
  display: "'Clash Display', sans-serif",
  body: "'General Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

/**
 * Font imports — à inclure dans le layout racine.
 *
 * Clash Display + General Sans → Fontshare (gratuit, pas de Google Fonts)
 * JetBrains Mono → Google Fonts
 */
export const fontImports = [
  "https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600&display=swap",
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
] as const;

/**
 * Type scale — fluid avec clamp.
 * Chaque niveau a une taille, un weight, un line-height et une font-family assignés.
 */
export const typeScale = {
  // Headings — Clash Display
  hero: {
    fontFamily: fontFamily.display,
    fontSize: "clamp(2.5rem, 5vw, 3.5rem)", // 40-56px
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
  },
  h1: {
    fontFamily: fontFamily.display,
    fontSize: "clamp(1.75rem, 3vw, 2.25rem)", // 28-36px
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.015em",
  },
  h2: {
    fontFamily: fontFamily.display,
    fontSize: "clamp(1.25rem, 2vw, 1.5rem)", // 20-24px
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontFamily: fontFamily.display,
    fontSize: "1.125rem", // 18px
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "0",
  },

  // Body — General Sans
  body: {
    fontFamily: fontFamily.body,
    fontSize: "0.9375rem", // 15px
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: "0",
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: "0.8125rem", // 13px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "0",
  },

  // Labels — General Sans medium
  label: {
    fontFamily: fontFamily.body,
    fontSize: "0.8125rem", // 13px
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: "0",
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontSize: "0.625rem", // 10px
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
  },

  // Mono — JetBrains Mono
  meta: {
    fontFamily: fontFamily.mono,
    fontSize: "0.6875rem", // 11px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "0",
  },
  data: {
    fontFamily: fontFamily.mono,
    fontSize: "0.8125rem", // 13px
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: "0",
  },
} as const;
```

### `packages/ui/src/tokens/spacing.ts`

```ts
/**
 * Miru Spacing & Layout Tokens
 *
 * Principes :
 * 1. Respiration entre sections (56px+), densité dans les sections
 * 2. Hiérarchie par taille, pas par décoration
 * 3. Border-radius cohérent par niveau
 */

export const spacing = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
} as const;

export const radius = {
  sm: "6px", // tags, pills, petits éléments
  md: "10px", // inputs, boutons
  lg: "12px", // cards
  xl: "14px", // containers, modals
  full: "9999px", // avatars uniquement
} as const;

export const layout = {
  maxWidth: "1200px",
  contentMaxWidth: "720px",
  sidebarWidth: "280px",
  headerHeight: "64px",
  bottomBarHeight: "56px",
} as const;
```

### `packages/ui/src/tokens/index.ts`

```ts
export { colors, adaptiveColorVars } from "./colors";
export { fontFamily, fontImports, typeScale } from "./typography";
export { spacing, radius, layout } from "./spacing";
```

## Tailwind CSS v4 Config

Dans `apps/web`, le fichier `app.css` principal configure Tailwind avec les tokens Miru.

### `apps/web/src/app/globals.css`

```css
@import "tailwindcss";

/*
 * Miru Design Tokens — CSS Custom Properties
 * Source of truth pour tout le theming.
 */

@theme {
  /* Backgrounds */
  --color-bg-base: #08080c;
  --color-bg-surface: #111118;
  --color-bg-elevated: #1a1a24;

  /* Borders */
  --color-border: #1e1e2a;
  --color-border-subtle: #16161f;

  /* Text — opacités */
  --color-text-primary: rgba(255, 255, 255, 0.95);
  --color-text-secondary: rgba(255, 255, 255, 0.55);
  --color-text-tertiary: rgba(255, 255, 255, 0.32);

  /* Accent — dynamique, overridé par anime */
  --color-accent: #c8a2ff;
  --color-accent-muted: rgba(200, 162, 255, 0.12);
  --color-accent-subtle: rgba(200, 162, 255, 0.06);

  /* Status */
  --color-success: #3ecf8e;
  --color-warning: #f5a623;
  --color-error: #ef4444;

  /* Font families */
  --font-display: "Clash Display", sans-serif;
  --font-body: "General Sans", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 14px;
}
```

Usage Tailwind dans les composants :

```tsx
// Exemples de classes Tailwind avec les tokens
<div className="bg-bg-base text-text-primary" />
<div className="bg-bg-surface border border-border rounded-lg" />
<h1 className="font-display text-3xl font-bold tracking-tight" />
<p className="font-body text-text-secondary" />
<span className="font-mono text-xs text-text-tertiary" />
<button className="bg-accent-muted text-accent rounded-md" />
```

## Hooks utilitaires

### `packages/ui/src/hooks/use-adaptive-color.ts`

```ts
"use client";

import { useEffect, useState } from "react";

/**
 * Extrait la couleur dominante d'une image (cover art anime).
 * Utilisé pour le adaptive theming — chaque fiche anime teinte l'interface.
 *
 * @param imageUrl - URL du cover art
 * @param fallback - Couleur fallback si extraction échoue
 * @returns { color, muted, subtle, isLoading }
 */
export function useAdaptiveColor(imageUrl: string | null, fallback = "#c8a2ff") {
  const [color, setColor] = useState(fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);

        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let i = 0; i < data.length; i += 4) {
          // Ignorer les pixels trop sombres ou trop clairs
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 30 && brightness < 220) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          setColor(`rgb(${r}, ${g}, ${b})`);
        }
      } catch {
        // CORS or canvas error — use fallback
      } finally {
        setIsLoading(false);
      }
    };

    img.onerror = () => setIsLoading(false);
  }, [imageUrl, fallback]);

  return {
    color,
    muted: color.replace("rgb", "rgba").replace(")", ", 0.12)"),
    subtle: color.replace("rgb", "rgba").replace(")", ", 0.06)"),
    gradient: `linear-gradient(135deg, ${color} 0%, transparent 60%)`,
    isLoading,
  };
}
```

### `packages/ui/src/hooks/index.ts`

```ts
export { useAdaptiveColor } from "./use-adaptive-color";
```

## Composants de base

Structure de chaque composant :

```
src/components/
  anime-card/
    anime-card.tsx        → composant
    anime-card.types.ts   → props interface (si complexe)
    index.ts              → re-export
```

### Composants P0 (MVP)

Liste des composants à implémenter pour le MVP, par priorité :

**Primitives (building blocks)**

- `Text` — wrapper typographique, props `variant` mappé au typeScale
- `Button` — primary, secondary, ghost. Sizes sm/md/lg
- `Badge` — genre tags, status pills
- `Icon` — wrapper pour lucide-react, taille cohérente

**Layout**

- `Container` — max-width + padding responsive
- `Stack` — flex vertical avec gap configurable
- `Grid` — CSS grid responsive, supporte asymétrie

**Anime-specific**

- `AnimeCard` — card catalogue avec cover, titre, studio, note. Hover expand
- `EpisodeRow` — ligne épisode compacte (numéro, titre, durée, progression)
- `CharacterCard` — portrait vertical, nom, rôle
- `PlatformBadge` — logo plateforme + lien
- `RatingDisplay` — note large + count reviews
- `WatchlistButton` — toggle avec animation pulse
- `StatusSelector` — pills de statut watchlist
- `AnimeHero` — hero section fiche anime (banner + overlay + titre)

**Feedback**

- `Toast` — notifications micro (ajout watchlist, etc.)
- `Shimmer` — placeholder loading qui reprend la forme du contenu

### Patterns de composant

Chaque composant suit ce pattern :

```tsx
// anime-card.tsx
import { type ComponentProps } from "react";
import { cn } from "../../utils/cn";

interface AnimeCardProps {
  title: string;
  coverUrl: string | null;
  studioName: string | null;
  year: number | null;
  rating: number | null;
  accentColor?: string;
  className?: string;
}

export function AnimeCard({
  title,
  coverUrl,
  studioName,
  year,
  rating,
  accentColor,
  className,
}: AnimeCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-bg-surface",
        "transition-transform duration-200 ease-out hover:-translate-y-1",
        className,
      )}
      style={
        accentColor
          ? ({
              "--card-accent": accentColor,
              boxShadow: "0 0 0 transparent",
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Cover */}
      <div className="aspect-[3/4] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-bg-elevated" />
        )}
        {rating && (
          <div className="absolute top-2 right-2 rounded-md bg-black/50 backdrop-blur-sm px-2 py-0.5 font-mono text-xs text-text-secondary">
            ★ {(rating / 10).toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-display text-sm font-semibold text-text-primary truncate">{title}</h3>
        <p className="font-body text-xs text-text-tertiary mt-1">
          {[studioName, year].filter(Boolean).join(" · ")}
        </p>
      </div>
    </article>
  );
}
```

## Utils

### `packages/ui/src/utils/cn.ts`

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

> Installer `clsx` et `tailwind-merge` comme dépendances du package ui.

## Barrel export

### `packages/ui/src/index.ts`

```ts
// Tokens
export * from "./tokens";

// Hooks
export * from "./hooks";

// Utils
export { cn } from "./utils/cn";

// Components — ajouter au fur et à mesure
// export { AnimeCard } from "./components/anime-card";
// export { EpisodeRow } from "./components/episode-row";
// etc.
```

## Règles de design à respecter

### Ce qu'on fait

- **Opacité pour la hiérarchie texte** : `text-text-primary`, `text-text-secondary`, `text-text-tertiary`
- **Transitions sur tout ce qui est interactif** : `transition-*` avec `duration-200` ou `duration-300`
- **Border radius cohérent** : `rounded-sm` (6px) pour tags, `rounded-md` (10px) pour boutons, `rounded-lg` (12px) pour cards, `rounded-xl` (14px) pour containers
- **Spacing par sections** : `gap-14` (56px) entre sections, `gap-3` à `gap-4` entre éléments internes
- **Images lazy-loaded** avec placeholder shimmer
- **Focus visible** : `focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none`

### Ce qu'on ne fait PAS

- ❌ Gradients violet-bleu en background
- ❌ Blobs flous décoratifs
- ❌ Ombres portées sur les cards (on utilise les borders subtiles)
- ❌ Mode clair (dark only au MVP)
- ❌ Icônes Lucide partout — icônes uniquement quand elles ajoutent du sens
- ❌ Composants shadcn non customisés
- ❌ `Inter`, `Roboto`, `Arial` — jamais
- ❌ `rounded-full` sauf sur les avatars
- ❌ Tailles de texte moyennes partout — contraste grand/petit

### Animations prioritaires

1. **View Transitions** : cover card → hero fiche anime (shared element)
2. **Scroll compression** : hero se réduit en header compact au scroll
3. **Hover cards** : scale subtil + reveal synopsis
4. **Watchlist toggle** : pulse + rotation icône
5. **Episode progression** : slide counter
