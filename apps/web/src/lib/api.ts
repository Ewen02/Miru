import { API_URL } from "./env";
import type {
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


interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export interface CatalogFilters {
  search?: string;
  status?: string;
  format?: string;
  year?: number;
  genres?: string[];
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
  if (filters.genres?.length) {
    for (const g of filters.genres) url.searchParams.append("genres", g);
  }
  if (filters.page) url.searchParams.set("page", String(filters.page));
  if (filters.pageSize) url.searchParams.set("pageSize", String(filters.pageSize));

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<Paginated<AnimeCard>>;
}

export async function fetchAnimeDetail(slug: string): Promise<AnimeDetail | null> {
  const url = new URL(`/animes/${encodeURIComponent(slug)}`, API_URL);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<AnimeDetail>;
}

export interface AnimeAccentPreview {
  slug: string;
  title: string;
  accentHex: string | null;
}

export async function fetchAnimeAccent(slug: string): Promise<AnimeAccentPreview | null> {
  const url = new URL(`/animes/${encodeURIComponent(slug)}/accent`, API_URL);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<AnimeAccentPreview>;
}

export async function fetchGenres(): Promise<GenreCard[]> {
  const url = new URL("/genres", API_URL);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<GenreCard[]>;
}

export async function fetchCalendarWeek(from: Date, to: Date): Promise<CalendarWeek> {
  const url = new URL("/calendar", API_URL);
  url.searchParams.set("from", from.toISOString());
  url.searchParams.set("to", to.toISOString());
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<CalendarWeek>;
}

export async function fetchUserProfile(handle: string): Promise<UserProfile | null> {
  const url = new URL(`/users/${encodeURIComponent(handle)}`, API_URL);
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<UserProfile>;
}

export async function fetchVoiceActorDetail(id: string): Promise<VoiceActorDetail | null> {
  const url = new URL(`/voice-actors/${encodeURIComponent(id)}`, API_URL);
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<VoiceActorDetail>;
}

export async function fetchCharacterDetail(id: string): Promise<CharacterDetail | null> {
  const url = new URL(`/characters/${encodeURIComponent(id)}`, API_URL);
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<CharacterDetail>;
}

export async function fetchStudioDetail(
  slug: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<StudioDetail | null> {
  const url = new URL(`/studios/${encodeURIComponent(slug)}`, API_URL);
  if (options.page) url.searchParams.set("page", String(options.page));
  if (options.pageSize) url.searchParams.set("pageSize", String(options.pageSize));
  const res = await fetch(url, { next: { revalidate: 300 } });
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
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<GenreDetail>;
}
