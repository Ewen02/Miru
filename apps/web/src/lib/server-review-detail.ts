import "server-only";
import type { ReviewDetailDto } from "@miru/types";
import { API_URL } from "./env";

/** Public review detail (review + flat comments). Returns null when missing. */
export async function fetchReviewDetail(id: string): Promise<ReviewDetailDto | null> {
  const res = await fetch(new URL(`/reviews/${id}`, API_URL), {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<ReviewDetailDto>;
}
