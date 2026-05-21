import { API_URL } from "./env";
import "server-only";
import { cookies } from "next/headers";
import type { AnimeCard } from "@miru/types";

/**
 * Personalized recommendations for the authenticated user. Returns null when
 * unauthenticated so the page can redirect to /login.
 */
export async function fetchRecommendations(limit = 24): Promise<AnimeCard[] | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return null;

  const url = new URL("/animes/recommendations/me", API_URL);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<AnimeCard[]>;
}
