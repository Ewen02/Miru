import type {
  AnimeCard,
  AnimeDetail,
  CharacterCard,
  GenreCard,
} from "@miru/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

export async function fetchAnimeCharacters(slug: string): Promise<CharacterCard[]> {
  const url = new URL(`/animes/${encodeURIComponent(slug)}/characters`, API_URL);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<CharacterCard[]>;
}

export async function fetchGenres(): Promise<GenreCard[]> {
  const url = new URL("/genres", API_URL);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<GenreCard[]>;
}
