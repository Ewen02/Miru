import { API_URL } from "./env";
import type { WatchStatus, WatchlistEntry } from "@miru/types";


/**
 * Client-side mutation helpers. They rely on credentials: include so the
 * Better Auth cookie is sent cross-origin. Server-side reads live in
 * server-watchlist-api.ts because they need next/headers.
 */
export const watchlistApi = {
  async add(animeId: string, status?: WatchStatus): Promise<WatchlistEntry> {
    const res = await fetch(`${API_URL}/watchlist`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, status }),
    });
    if (!res.ok) throw new Error(`watchlist.add ${res.status}`);
    return res.json() as Promise<WatchlistEntry>;
  },

  async update(
    animeId: string,
    patch: Partial<Pick<WatchlistEntry, "status" | "currentEpisode" | "rating" | "isFavorite">>,
  ): Promise<WatchlistEntry> {
    const res = await fetch(`${API_URL}/watchlist/${encodeURIComponent(animeId)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`watchlist.update ${res.status}`);
    return res.json() as Promise<WatchlistEntry>;
  },

  async remove(animeId: string): Promise<void> {
    const res = await fetch(`${API_URL}/watchlist/${encodeURIComponent(animeId)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok && res.status !== 204) throw new Error(`watchlist.remove ${res.status}`);
  },
};
