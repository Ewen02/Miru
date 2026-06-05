import { cache } from "react";
import { API_URL } from "./env";
import type {
  ActivityEventDto,
  AnimeCard,
  AnimeDetail,
  CalendarWeek,
  CharacterDetail,
  GenreCard,
  GenreDetail,
  StudioDetail,
  UserProfile,
  VoiceActorDetail,
} from "@miru/types";

/**
 * API client — Next 16 caching conventions.
 *
 *  - `cache: "force-cache"` is required: default is no-cache in Next 16.
 *  - `next.revalidate` is the persistent (cross-request) cache lifetime.
 *  - `next.tags` enables targeted invalidation via `revalidateTag()`.
 *  - `React.cache()` deduplicates calls inside the *same* React render so
 *    `generateMetadata` + page body sharing a fetch only hit the API once.
 *
 * Tag taxonomy:
 *  - `anime`        — every anime endpoint (broad invalidation)
 *  - `anime:<slug>` — a specific anime (narrow invalidation)
 *  - `catalog`      — listing endpoints
 *  - `trending`     — homepage trending feed
 *  - `calendar`     — airing calendar
 *  - `genre`/`studio`/`character`/`voice-actor`/`user` — entity scoped
 */

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export type CatalogSort = "RATING" | "POPULARITY" | "RECENCY" | "EPISODE_COUNT";

export interface CatalogFilters {
  search?: string;
  status?: string;
  format?: string;
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  episodesMin?: number;
  episodesMax?: number;
  genres?: string[];
  streamingPlatforms?: string[];
  sort?: CatalogSort;
  page?: number;
  pageSize?: number;
}

export async function fetchAnimeCatalog(
  filters: CatalogFilters = {},
): Promise<Paginated<AnimeCard>> {
  const url = new URL("/animes", API_URL);
  if (filters.search) url.searchParams.set("search", filters.search);
  if (filters.status) url.searchParams.set("status", filters.status);
  if (filters.format) url.searchParams.set("format", filters.format);
  if (filters.year != null) url.searchParams.set("year", String(filters.year));
  if (filters.yearFrom != null) url.searchParams.set("yearFrom", String(filters.yearFrom));
  if (filters.yearTo != null) url.searchParams.set("yearTo", String(filters.yearTo));
  if (filters.episodesMin != null)
    url.searchParams.set("episodesMin", String(filters.episodesMin));
  if (filters.episodesMax != null)
    url.searchParams.set("episodesMax", String(filters.episodesMax));
  if (filters.genres?.length) {
    for (const g of filters.genres) url.searchParams.append("genres", g);
  }
  if (filters.streamingPlatforms?.length) {
    for (const p of filters.streamingPlatforms)
      url.searchParams.append("streamingPlatforms", p);
  }
  if (filters.sort) url.searchParams.set("sort", filters.sort);
  if (filters.page) url.searchParams.set("page", String(filters.page));
  if (filters.pageSize) url.searchParams.set("pageSize", String(filters.pageSize));

  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 60, tags: ["anime", "catalog"] },
  });
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<Paginated<AnimeCard>>;
}

/**
 * Wrapped in `cache()` so generateMetadata + the page body share one fetch
 * per render. WEBPERF-01.
 */
export const fetchAnimeDetail = cache(async (slug: string): Promise<AnimeDetail | null> => {
  const url = new URL(`/animes/${encodeURIComponent(slug)}`, API_URL);
  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 60, tags: ["anime", `anime:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<AnimeDetail>;
});

export interface AnimeAccentPreview {
  slug: string;
  title: string;
  accentHex: string | null;
}

/** Deduped with fetchAnimeDetail when both fire in the same render. WEBPERF-03. */
export const fetchAnimeAccent = cache(
  async (slug: string): Promise<AnimeAccentPreview | null> => {
    const url = new URL(`/animes/${encodeURIComponent(slug)}/accent`, API_URL);
    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 60, tags: ["anime", `anime:${slug}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Miru API ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<AnimeAccentPreview>;
  },
);

export const fetchGenres = cache(async (): Promise<GenreCard[]> => {
  const url = new URL("/genres", API_URL);
  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 3600, tags: ["genre", "catalog"] },
  });
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<GenreCard[]>;
});

/** Global activity feed (trending) — public, no auth. */
export const fetchTrendingFeed = cache(
  async (limit = 30): Promise<ActivityEventDto[]> => {
    const url = new URL("/social/trending", API_URL);
    url.searchParams.set("limit", String(limit));
    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 60, tags: ["trending"] },
    });
    if (!res.ok) {
      throw new Error(`Miru API ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<ActivityEventDto[]>;
  },
);

export async function fetchCalendarWeek(from: Date, to: Date): Promise<CalendarWeek> {
  const url = new URL("/calendar", API_URL);
  url.searchParams.set("from", from.toISOString());
  url.searchParams.set("to", to.toISOString());
  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 300, tags: ["calendar"] },
  });
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<CalendarWeek>;
}

export const fetchUserProfile = cache(
  async (handle: string): Promise<UserProfile | null> => {
    const url = new URL(`/users/${encodeURIComponent(handle)}`, API_URL);
    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 30, tags: ["user", `user:${handle}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Miru API ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<UserProfile>;
  },
);

export const fetchVoiceActorDetail = cache(
  async (id: string): Promise<VoiceActorDetail | null> => {
    const url = new URL(`/voice-actors/${encodeURIComponent(id)}`, API_URL);
    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 600, tags: ["voice-actor", `voice-actor:${id}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Miru API ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<VoiceActorDetail>;
  },
);

export const fetchCharacterDetail = cache(
  async (id: string): Promise<CharacterDetail | null> => {
    const url = new URL(`/characters/${encodeURIComponent(id)}`, API_URL);
    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: 600, tags: ["character", `character:${id}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Miru API ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<CharacterDetail>;
  },
);

export async function fetchStudioDetail(
  slug: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<StudioDetail | null> {
  const url = new URL(`/studios/${encodeURIComponent(slug)}`, API_URL);
  if (options.page) url.searchParams.set("page", String(options.page));
  if (options.pageSize) url.searchParams.set("pageSize", String(options.pageSize));
  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 300, tags: ["studio", `studio:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<StudioDetail>;
}

export async function fetchGenreDetail(
  slug: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<GenreDetail | null> {
  const url = new URL(`/genres/${encodeURIComponent(slug)}`, API_URL);
  if (options.page) url.searchParams.set("page", String(options.page));
  if (options.pageSize) url.searchParams.set("pageSize", String(options.pageSize));
  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 60, tags: ["genre", `genre:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<GenreDetail>;
}
