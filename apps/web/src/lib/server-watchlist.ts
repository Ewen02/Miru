import { API_URL } from "./env";
import "server-only";
import { cookies } from "next/headers";
import type { WatchStatus, WatchlistItem } from "@miru/types";


/**
 * Server-side fetch of the current user's watchlist. Forwards the incoming
 * cookies to the API so Better Auth can resolve the session. Returns an
 * empty list for anonymous visitors or expired sessions.
 */
export async function fetchUserWatchlist(status?: WatchStatus): Promise<WatchlistItem[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return [];

  const url = new URL("/users/me/watchlist", API_URL);
  if (status) url.searchParams.set("status", status);

  const res = await fetch(url, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (res.status === 401) return [];
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<WatchlistItem[]>;
}
