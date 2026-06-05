import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { ListDetailDto, ListSummaryDto } from "@miru/types";
import { API_URL } from "./env";

export type ListSort = "popular" | "recent";

async function buildHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return cookieHeader ? { cookie: cookieHeader } : {};
}

export const fetchLists = cache(
  async (
    filter: "mine" | "liked" | "public",
    sort?: ListSort,
  ): Promise<ListSummaryDto[]> => {
    const url = new URL("/lists", API_URL);
    url.searchParams.set("filter", filter);
    if (sort) url.searchParams.set("sort", sort);
    const res = await fetch(url, {
      headers: await buildHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Miru API ${res.status}: ${await res.text()}`);
    }
    return res.json() as Promise<ListSummaryDto[]>;
  },
);

/**
 * Trending public lists — anonymous-friendly. Cached aggressively because
 * the underlying ranking only changes when likeCount moves, and even then
 * a couple of minutes of staleness is fine for a discovery surface.
 */
export const fetchTrendingLists = cache(async (): Promise<ListSummaryDto[]> => {
  const url = new URL("/lists/trending", API_URL);
  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: 120, tags: ["lists", "lists:trending"] },
  });
  if (!res.ok) return [];
  return res.json() as Promise<ListSummaryDto[]>;
});

export const fetchListDetail = cache(async (id: string): Promise<ListDetailDto | null> => {
  const url = new URL(`/lists/${encodeURIComponent(id)}`, API_URL);
  const res = await fetch(url, {
    headers: await buildHeaders(),
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<ListDetailDto>;
});
