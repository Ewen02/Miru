import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { UserLifetime } from "@miru/types";
import { API_URL } from "./env";

/**
 * Server-side fetch of the current user's lifetime stats. Returns null for
 * anonymous visitors (the page redirects to /login when this is null).
 *
 * Wrapped in React.cache() — lifetime stats are referenced by the homepage
 * "Pour toi" eyebrow and the dedicated stats page; same-render dedup
 * collapses repeated calls into one.
 */
export const fetchUserLifetimeStats = cache(async (): Promise<UserLifetime | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return null;

  const url = new URL("/users/me/lifetime-stats", API_URL);
  const res = await fetch(url, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<UserLifetime>;
});
