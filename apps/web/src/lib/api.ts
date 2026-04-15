import type { AnimeCard, AnimeDetail } from "@miru/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export async function fetchAnimeCatalog(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paginated<AnimeCard>> {
  const url = new URL("/animes", API_URL);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

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
