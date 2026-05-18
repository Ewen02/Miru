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

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export class AniListClient extends ThrottledRetryClient {
  private readonly trendingCache = new MemoCache<AniListAnime[]>(TRENDING_CACHE_TTL_MS);
  private readonly detailCache = new MemoCache<AniListAnime>(DETAIL_CACHE_TTL_MS);

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
    const res = await this.request(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 401) throw new Error("AniList HTTP 401: invalid credentials");
    if (!res.ok) throw new Error(`AniList HTTP ${res.status}: ${await res.text()}`);

    const payload = (await res.json()) as GraphQLResponse<T>;
    if (payload.errors?.length) {
      throw new Error(`AniList GraphQL error: ${payload.errors.map((e) => e.message).join("; ")}`);
    }
    if (!payload.data) throw new Error("AniList returned no data");
    return payload.data;
  }
}
