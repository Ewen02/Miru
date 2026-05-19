import { API_URL } from "./env";
import "server-only";
import type { ReviewItem } from "@miru/types";


export async function fetchAnimeReviews(animeId: string): Promise<ReviewItem[]> {
  const url = new URL(`/animes/${encodeURIComponent(animeId)}/reviews`, API_URL);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<ReviewItem[]>;
}
