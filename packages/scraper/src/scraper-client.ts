import { load, type CheerioAPI } from "cheerio";
import { ThrottledRetryClient } from "@miru/http-client";

export interface ScraperClientOptions {
  /** Identifies us to the upstream so they can contact us. Required. */
  userAgent: string;
  /** Min interval between requests, ms. Default 1000. */
  minIntervalMs?: number;
  /** Per-request timeout, ms. Default 10_000. */
  timeoutMs?: number;
  /** Max retries on transient errors (5xx + 429). Default 2. */
  maxRetries?: number;
}

export interface FetchHtmlResult {
  /** Parsed Cheerio document. */
  $: CheerioAPI;
  /** Final URL after redirects — useful when the upstream renormalizes slugs. */
  finalUrl: string;
  /** Raw status code. */
  status: number;
}

/**
 * Thin wrapper around fetch + cheerio + retry + rate-limit. One instance
 * per upstream host so each platform gets its own throttle.
 *
 * Designed to be inert when no requests are sent: nothing schedules on
 * construction, the throttler only fires on `fetchHtml`.
 */
export class ScraperClient extends ThrottledRetryClient {
  private readonly userAgent: string;
  private readonly timeoutMs: number;

  constructor(options: ScraperClientOptions) {
    if (!options.userAgent || options.userAgent.length < 10) {
      throw new Error("ScraperClient: userAgent is required (and should identify Miru).");
    }
    super({
      throttleMs: options.minIntervalMs ?? 1000,
      maxRetries: options.maxRetries ?? 2,
    });
    this.userAgent = options.userAgent;
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  async fetchHtml(url: string): Promise<FetchHtmlResult> {
    const res = await this.request(url, {
      headers: {
        "user-agent": this.userAgent,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
        "accept-language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!res.ok) {
      throw new ScraperHttpError(res.status, res.statusText, url);
    }

    const html = await res.text();
    return {
      $: load(html),
      finalUrl: res.url,
      status: res.status,
    };
  }
}

export class ScraperHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string,
  ) {
    super(`Scraper ${status} ${statusText} on ${url}`);
    this.name = "ScraperHttpError";
  }
}
