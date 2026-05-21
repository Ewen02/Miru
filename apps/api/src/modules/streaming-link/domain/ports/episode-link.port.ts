import type { ScrapedEpisodeLink } from "@miru/scraper";

/**
 * Out port — one implementation per upstream platform (Crunchyroll, ADN).
 * The adapter resolves a Miru anime to its platform-specific slug, then
 * returns one ScrapedEpisodeLink per episode.
 *
 * Inputs that don't match (no slug found, removed series) return [] —
 * never throw. Network errors bubble up so the cron can log them.
 */
export interface EpisodeLinkPort {
  /** Human-readable source id, matches EpisodeLinkSource enum values. */
  readonly source: "CRUNCHYROLL_SCRAPE" | "ADN_SCRAPE";
  /**
   * Look up an anime on the platform and scrape its episode list.
   * @param hints — known external identifiers / titles that help the
   *  adapter find the right page.
   */
  fetchEpisodeLinks(hints: {
    anilistId: number | null;
    malId: number | null;
    titleEn: string | null;
    titleRomaji: string | null;
  }): Promise<ScrapedEpisodeLink[]>;
}
