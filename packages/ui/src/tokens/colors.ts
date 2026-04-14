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
    base: "#08080c",        // fond principal
    surface: "#111118",     // cards, containers
    elevated: "#1a1a24",    // hover states, menus
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
