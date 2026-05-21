/**
 * Common shape returned by every platform scraper adapter. Stays narrow
 * on purpose — anything richer (cover URL, description) is already in
 * the AniList catalog.
 */
export interface ScrapedEpisodeLink {
  /** Episode number on the platform, 1-indexed. */
  episodeNumber: number;
  /** Deep link to the episode player or its dedicated page. */
  url: string;
  /** Free-form episode title as displayed on the platform. */
  title: string | null;
  /** Optional thumbnail (player frame). */
  thumbnail: string | null;
}
