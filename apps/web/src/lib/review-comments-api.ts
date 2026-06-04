"use client";

import type { ReviewDetailDto } from "@miru/types";
import { API_URL } from "./env";

export async function addReviewComment(
  reviewId: string,
  body: string,
): Promise<ReviewDetailDto | { error: string }> {
  const res = await fetch(new URL(`/reviews/${reviewId}/comments`, API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (res.status === 401) return { error: "Connecte-toi pour commenter." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<ReviewDetailDto>;
}
