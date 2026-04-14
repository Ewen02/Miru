import { GraphQLClient } from "graphql-request";
import { ANIME_DETAIL_QUERY, ANIME_SEARCH_QUERY, TRENDING_QUERY } from "./queries";
import type { AniListAnime } from "./types";

const ANILIST_API = "https://graphql.anilist.co";

export class AniListClient {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(ANILIST_API, {
      headers: { "Content-Type": "application/json" },
    });
  }

  async getTrending(page = 1, perPage = 20): Promise<AniListAnime[]> {
    const data = await this.client.request<any>(TRENDING_QUERY, { page, perPage });
    return data.Page.media;
  }

  async search(query: string, page = 1, perPage = 20): Promise<AniListAnime[]> {
    const data = await this.client.request<any>(ANIME_SEARCH_QUERY, { query, page, perPage });
    return data.Page.media;
  }

  async getById(id: number): Promise<AniListAnime> {
    const data = await this.client.request<any>(ANIME_DETAIL_QUERY, { id });
    return data.Media;
  }
}
