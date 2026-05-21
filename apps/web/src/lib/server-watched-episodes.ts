import "server-only";
import { cookies } from "next/headers";
import { API_URL } from "./env";

export interface WatchedEpisodeDto {
  episodeId: string;
  episodeNumber: number;
  watchedAt: string;
}

export async function fetchWatchedEpisodes(animeId: string): Promise<WatchedEpisodeDto[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return [];

  const url = new URL(
    `/watchlist/anime/${encodeURIComponent(animeId)}/episodes`,
    API_URL,
  );
  const res = await fetch(url, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (res.status === 401) return [];
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<WatchedEpisodeDto[]>;
}
