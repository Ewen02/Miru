"use client";

import { API_URL } from "./env";

export async function updateBio(
  bio: string,
): Promise<{ bio: string | null } | { error: string }> {
  const res = await fetch(new URL("/users/me/bio", API_URL), {
    method: "PATCH",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ bio }),
  });
  if (res.status === 401) return { error: "auth-required" };
  if (!res.ok) return { error: `http-${res.status}` };
  return (await res.json()) as { bio: string | null };
}
