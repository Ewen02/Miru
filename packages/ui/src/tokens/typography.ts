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
