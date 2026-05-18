import { MemoCache, ThrottledRetryClient } from "@miru/http-client";
import {
  ANIME_DETAIL_QUERY,
  ANIME_SEARCH_QUERY,
  SEASON_QUERY,
  TRENDING_QUERY,
} from "./queries.js";
import { AniListAnimeSchema, type AniListAnime } from "./types.js";

const ANILIST_API = "https://graphql.anilist.co";
// AniList rate-limit: 90 req/min = ~667ms min per req. 750ms garde une marge.
const ANILIST_THROTTLE_MS = 750;
const TRENDING_CACHE_TTL_MS = 60 * 60 * 1000;
const DETAIL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// When AniList trips the circuit breaker, hold off any new request for this
// long before retrying. AniList outages historically last hours, so 5 minutes
// is a good balance between recovering quickly and not hammering them.
const UNAVAILABLE_COOLDOWN_MS = 5 * 60 * 1000;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Thrown when AniList responds with 403 "temporarily disabled" or any other
 * outage signal. Catching this in the sync use cases lets them abort the
 * batch rather than retry per-anime.
 */
export class AniListUnavailableError extends Error {
  readonly retryAfterMs: number;
  constructor(message: string, retryAfterMs = UNAVAILABLE_COOLDOWN_MS) {
    super(message);
    this.name = "AniListUnavailableError";
    this.retryAfterMs = retryAfterMs;
  }
}

function isUnavailableMessage(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("temporarily disabled") || m.includes("stability issues");
}

export class AniListClient extends ThrottledRetryClient {
  private readonly trendingCache = new MemoCache<AniListAnime[]>(TRENDING_CACHE_TTL_MS);
  private readonly detailCache = new MemoCache<AniListAnime>(DETAIL_CACHE_TTL_MS);
  /** Timestamp (ms epoch) after which we may retry AniList. 0 = no breaker. */
  private circuitOpenUntil = 0;

  constructor() {
    super({ throttleMs: ANILIST_THROTTLE_MS });
  }

  async getTrending(page = 1, perPage = 20): Promise<AniListAnime[]> {
    return this.trendingCache.getOrSet(`${page}:${perPage}`, async () => {
      const data = await this.graphql<{ Page: { media: unknown[] } }>(TRENDING_QUERY, {
        page,
        perPage,
      });
      return this.parseMany(data.Page.media);
    });
  }

  async getBySeason(
    season: "WINTER" | "SPRING" | "SUMMER" | "FALL",
    seasonYear: number,
    page = 1,
    perPage = 50,
  ): Promise<AniListAnime[]> {
    const data = await this.graphql<{ Page: { media: unknown[] } }>(SEASON_QUERY, {
      season,
      seasonYear,
      page,
      perPage,
    });
    return this.parseMany(data.Page.media);
  }

  async search(query: string, page = 1, perPage = 20): Promise<AniListAnime[]> {
    const data = await this.graphql<{ Page: { media: unknown[] } }>(ANIME_SEARCH_QUERY, {
      query,
      page,
      perPage,
    });
    return this.parseMany(data.Page.media);
  }

  async getById(id: number): Promise<AniListAnime> {
    return this.detailCache.getOrSet(String(id), async () => {
      const data = await this.graphql<{ Media: unknown }>(ANIME_DETAIL_QUERY, { id });
      return AniListAnimeSchema.parse(data.Media);
    });
  }

  private parseMany(list: unknown[]): AniListAnime[] {
    const valid: AniListAnime[] = [];
    for (const raw of list) {
      const parsed = AniListAnimeSchema.safeParse(raw);
      if (parsed.success) valid.push(parsed.data);
      else console.warn(`[AniList] skipping invalid entry: ${parsed.error.message}`);
    }
    return valid;
  }

  private async graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    // Short-circuit if we know AniList is down. The throttle wait would
    // otherwise burn a second per blocked anime in a batch.
    if (this.circuitOpenUntil > Date.now()) {
      throw new AniListUnavailableError(
        "AniList circuit breaker is open after a recent outage signal",
        this.circuitOpenUntil - Date.now(),
      );
    }

    const res = await this.request(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 401) throw new Error("AniList HTTP 401: invalid credentials");

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 403 && isUnavailableMessage(body)) {
        this.tripCircuit();
        throw new AniListUnavailableError(`AniList HTTP 403: ${body}`);
      }
      throw new Error(`AniList HTTP ${res.status}: ${body}`);
    }

    const payload = (await res.json()) as GraphQLResponse<T>;
    if (payload.errors?.length) {
      const messages = payload.errors.map((e) => e.message).join("; ");
      if (isUnavailableMessage(messages)) {
        this.tripCircuit();
        throw new AniListUnavailableError(`AniList GraphQL outage: ${messages}`);
      }
      throw new Error(`AniList GraphQL error: ${messages}`);
    }
    if (!payload.data) throw new Error("AniList returned no data");
    return payload.data;
  }

  private tripCircuit() {
    this.circuitOpenUntil = Date.now() + UNAVAILABLE_COOLDOWN_MS;
  }
}
