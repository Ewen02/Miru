import { Injectable, Logger } from "@nestjs/common";
import { ScraperClient, ScraperHttpError, type ScrapedEpisodeLink } from "@miru/scraper";
import { EpisodeLinkPort } from "../../domain/ports/episode-link.port";

const ADN_BASE = "https://animationdigitalnetwork.com";
const USER_AGENT =
  "MiruBot/0.5 (+https://miru.app; contact@miru.app) — anime metadata cache";

/**
 * ADN (Animation Digital Network) adapter. ADN exposes a clearer URL
 * structure than CR (`/video/<slug>/<episode-id>`), which makes scraping
 * simpler. Same fail-soft contract: any structural change → empty array,
 * never throw to the caller.
 */
@Injectable()
export class ADNScraperAdapter implements EpisodeLinkPort {
  readonly source = "ADN_SCRAPE" as const;
  private readonly logger = new Logger(ADNScraperAdapter.name);
  private readonly client = new ScraperClient({
    userAgent: USER_AGENT,
    minIntervalMs: 1500,
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
      this.logger.warn(`ADN scrape failed for "${query}": ${(err as Error).message}`);
      return [];
    }
  }

  private async findSeriesUrl(query: string): Promise<string | null> {
    const searchUrl = `${ADN_BASE}/search?q=${encodeURIComponent(query)}`;
    const { $ } = await this.client.fetchHtml(searchUrl);
    const firstSeriesHref = $('a[href*="/video/"]').first().attr("href");
    if (!firstSeriesHref) return null;
    // Take the /video/<slug>/ portion — strip the episode segment if present.
    const seriesPath = firstSeriesHref.replace(/\/\d+(?:\/[^/]*)?$/, "");
    return seriesPath.startsWith("http") ? seriesPath : `${ADN_BASE}${seriesPath}`;
  }

  private async scrapeEpisodes(seriesUrl: string): Promise<ScrapedEpisodeLink[]> {
    const { $ } = await this.client.fetchHtml(seriesUrl);
    const links: ScrapedEpisodeLink[] = [];

    $('a[href*="/video/"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href");
      if (!href) return;
      // ADN episode URLs end with a numeric id; series URLs do not.
      const epIdMatch = href.match(/\/video\/[^/]+\/(\d+)/);
      if (!epIdMatch) return;
      // Episode number is shown in the card title (e.g. "Épisode 12").
      const cardText = $el.text();
      const numberMatch = cardText.match(/(?:Épisode|Episode|EP\.?)\s*(\d+)/i);
      if (!numberMatch) return;
      const episodeNumber = Number(numberMatch[1]);
      if (!Number.isInteger(episodeNumber) || episodeNumber < 1) return;
      const url = href.startsWith("http") ? href : `${ADN_BASE}${href}`;
      const title = cardText.replace(/\s+/g, " ").trim() || null;
      links.push({ episodeNumber, url, title, thumbnail: null });
    });

    const byNumber = new Map<number, ScrapedEpisodeLink>();
    for (const link of links) {
      if (!byNumber.has(link.episodeNumber)) byNumber.set(link.episodeNumber, link);
    }
    return Array.from(byNumber.values()).sort((a, b) => a.episodeNumber - b.episodeNumber);
  }
}
