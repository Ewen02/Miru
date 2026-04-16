import { ThrottledRetryClient } from "@miru/http-client";
import { JikanEpisodeSchema, type JikanEpisode } from "./types.js";

const JIKAN_API = "https://api.jikan.moe/v4";
// Jikan doc: 3 req/s, 60 req/min. 600ms (~1.6 req/s) garde une marge.
const JIKAN_THROTTLE_MS = 600;

export class JikanClient extends ThrottledRetryClient {
  constructor() {
    super({ throttleMs: JIKAN_THROTTLE_MS });
  }

  async fetchEpisodes(malId: number): Promise<JikanEpisode[]> {
    const all: JikanEpisode[] = [];
    let page = 1;

    while (true) {
      const url = new URL(`${JIKAN_API}/anime/${malId}/episodes`);
      url.searchParams.set("page", String(page));

      const res = await this.request(url);
      if (!res.ok) throw new Error(`Jikan HTTP ${res.status}: ${await res.text()}`);

      const payload = (await res.json()) as {
        data: unknown[];
        pagination?: { has_next_page?: boolean };
      };
      if (!Array.isArray(payload.data)) {
        throw new Error(`Jikan unexpected payload: ${JSON.stringify(payload)}`);
      }

      for (const raw of payload.data) {
        const parsed = JikanEpisodeSchema.safeParse(raw);
        if (parsed.success) all.push(parsed.data);
        else console.warn(`[Jikan] skipping invalid episode: ${parsed.error.message}`);
      }

      if (!payload.pagination?.has_next_page) break;
      page += 1;
    }

    return all;
  }
}
