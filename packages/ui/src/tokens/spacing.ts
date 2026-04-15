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
