import type { JikanEpisode, JikanEpisodesResponse } from "./types.js";

const JIKAN_API = "https://api.jikan.moe/v4";

/**
 * Limite Jikan documentée : 3 req/s et 60 req/min.
 * On garde 600ms entre requêtes (~1.6 req/s) pour rester confortable,
 * et on gère les 429 avec un retry basé sur Retry-After.
 */
const THROTTLE_MS = 600;
const MAX_RETRIES = 3;

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: URL): Promise<Response> {
  let attempt = 0;
  while (true) {
    const res = await fetch(url);
    if (res.status !== 429) return res;
    if (attempt >= MAX_RETRIES) return res;

    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs =
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2000 * (attempt + 1);
    await sleep(waitMs);
    attempt += 1;
  }
}

export class JikanClient {
  async fetchEpisodes(malId: number): Promise<JikanEpisode[]> {
    const all: JikanEpisode[] = [];
    let page = 1;

    while (true) {
      const url = new URL(`${JIKAN_API}/anime/${malId}/episodes`);
      url.searchParams.set("page", String(page));

      const res = await fetchWithRetry(url);
      if (!res.ok) {
        throw new Error(`Jikan HTTP ${res.status}: ${await res.text()}`);
      }
      const payload = (await res.json()) as JikanEpisodesResponse;
      if (!Array.isArray(payload.data)) {
        throw new Error(`Jikan unexpected payload: ${JSON.stringify(payload)}`);
      }
      all.push(...payload.data);

      if (!payload.pagination?.has_next_page) break;
      page += 1;
      await sleep(THROTTLE_MS);
    }

    return all;
  }
}
