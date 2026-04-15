import { ANIME_DETAIL_QUERY, ANIME_SEARCH_QUERY, TRENDING_QUERY } from "./queries.js";
import type { AniListAnime } from "./types.js";

const ANILIST_API = "https://graphql.anilist.co";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export class AniListClient {
  async getTrending(page = 1, perPage = 20): Promise<AniListAnime[]> {
    const data = await this.request<{ Page: { media: AniListAnime[] } }>(TRENDING_QUERY, {
      page,
      perPage,
    });
    return data.Page.media;
  }

  async search(query: string, page = 1, perPage = 20): Promise<AniListAnime[]> {
    const data = await this.request<{ Page: { media: AniListAnime[] } }>(ANIME_SEARCH_QUERY, {
      query,
      page,
      perPage,
    });
    return data.Page.media;
  }

  async getById(id: number): Promise<AniListAnime> {
    const data = await this.request<{ Media: AniListAnime }>(ANIME_DETAIL_QUERY, { id });
    return data.Media;
  }

  private async request<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new Error(`AniList HTTP ${res.status}: ${await res.text()}`);
    }
    const payload = (await res.json()) as GraphQLResponse<T>;
    if (payload.errors?.length) {
      throw new Error(`AniList GraphQL error: ${payload.errors.map((e) => e.message).join("; ")}`);
    }
    if (!payload.data) {
      throw new Error("AniList returned no data");
    }
    return payload.data;
  }
}
