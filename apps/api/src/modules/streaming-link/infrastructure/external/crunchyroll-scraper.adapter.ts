import { Injectable, Logger } from "@nestjs/common";
import { ScraperClient, ScraperHttpError, type ScrapedEpisodeLink } from "@miru/scraper";
import { EpisodeLinkPort } from "../../domain/ports/episode-link.port";

const CRUNCHYROLL_BASE = "https://www.crunchyroll.com";
const USER_AGENT =
  "MiruBot/0.5 (+https://miru.app; contact@miru.app) — anime metadata cache";

/**
 * Crunchyroll adapter — scrapes the public series page to extract episode
 * URLs. Selectors are based on the structure observed in Q1 2026 and WILL
 * break when Crunchyroll redesigns; the adapter's job is to fail soft
 * (empty array) so the rest of the pipeline keeps working.
 *
 * Series discovery strategy: title-based search via /search/, then take
 * the first /series/ result. Slug-fuzzy matching is intentional — perfect
 * accuracy isn't worth the complexity since users can always click the
 * AniList-provided per-series link.
 */
@Injectable()
export class CrunchyrollScraperAdapter implements EpisodeLinkPort {
  readonly source = "CRUNCHYROLL_SCRAPE" as const;
  private readonly logger = new Logger(CrunchyrollScraperAdapter.name);
  private readonly client = new ScraperClient({
    userAgent: USER_AGENT,
    minIntervalMs: 2000,
    timeoutMs: 12_000,
    maxRetries: 1,
  });

  async fetchEpisodeLinks(hints: {
    anilistId: number | null;
    malId: number | null;
    titleEn: string | null;
    titleRomaji: string | null;
  }): Promise<ScrapedEpisodeLink[]> {
    const query = hints.titleEn ?? hints.titleRomaji;
    if (!query) return [];

    try {
      const seriesUrl = await this.findSeriesUrl(query);
      if (!seriesUrl) return [];
      return await this.scrapeEpisodes(seriesUrl);
    } catch (err) {
      if (err instanceof ScraperHttpError && err.status === 404) return [];
      this.logger.warn(`Crunchyroll scrape failed for "${query}": ${(err as Error).message}`);
      return [];
    }
  }

  private async findSeriesUrl(query: string): Promise<string | null> {
    const searchUrl = `${CRUNCHYROLL_BASE}/search?q=${encodeURIComponent(query)}`;
    const { $ } = await this.client.fetchHtml(searchUrl);
    const firstSeriesHref = $('a[href*="/series/"]').first().attr("href");
    if (!firstSeriesHref) return null;
    return firstSeriesHref.startsWith("http")
      ? firstSeriesHref
      : `${CRUNCHYROLL_BASE}${firstSeriesHref}`;
  }

  private async scrapeEpisodes(seriesUrl: string): Promise<ScrapedEpisodeLink[]> {
    const { $ } = await this.client.fetchHtml(seriesUrl);
    const links: ScrapedEpisodeLink[] = [];

    $('a[href*="/watch/"]').each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      const title =
        $(el).attr("title") ??
        ($(el).find("[data-testid='episode-title']").text().trim() || null);
      // Episode number is usually in a sibling [data-testid='episode-number-label']
      const numberText = $(el).find("[data-testid='episode-number']").text();
      const match = numberText.match(/\d+/);
      if (!match) return;
      const episodeNumber = Number(match[0]);
      if (!Number.isInteger(episodeNumber) || episodeNumber < 1) return;
      const url = href.startsWith("http") ? href : `${CRUNCHYROLL_BASE}${href}`;
      links.push({ episodeNumber, url, title, thumbnail: null });
    });

    // Dedupe by episode number — multiple anchors per ep are common.
    const byNumber = new Map<number, ScrapedEpisodeLink>();
    for (const link of links) {
      if (!byNumber.has(link.episodeNumber)) byNumber.set(link.episodeNumber, link);
    }
    return Array.from(byNumber.values()).sort((a, b) => a.episodeNumber - b.episodeNumber);
  }
}
