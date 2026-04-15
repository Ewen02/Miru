/**
 * Nettoie un synopsis venant d'une source tierce (AniList, MAL, …).
 * - Retire les balises HTML (les <br> deviennent des retours à la ligne).
 * - Décode les entités HTML de base.
 * - Retire les méta-lignes éditoriales ("(Source: X)", "Note: …").
 * - Normalise les espaces/retours à la ligne.
 */
export function cleanSynopsis(raw: string | null): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  const withBreaks = trimmed.replace(/<br\s*\/?>/gi, "\n");
  const stripped = withBreaks.replace(/<[^>]+>/g, "");
  const decoded = stripped
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  const lines = decoded.split("\n").map((line) => line.trim());
  const filtered = lines.filter((line) => {
    if (/^\(sources?:/i.test(line)) return false;
    if (/^sources?:/i.test(line)) return false;
    if (/^notes?:/i.test(line)) return false;
    return true;
  });

  const collapsed = filtered
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return collapsed === "" ? null : collapsed;
}
