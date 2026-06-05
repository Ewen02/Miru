import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { API_URL } from "./env";

export interface BillingStatus {
  isPro: boolean;
  proSince: string | null;
}

/**
 * Server-side check whether the current user is a sympathisant. Returns the
 * inactive default for anonymous visitors instead of throwing.
 *
 * Wrapped in React.cache() so AppHeader + page-level callers share the
 * same fetch per render (RSC-A10).
 */
export const fetchBillingStatus = cache(async (): Promise<BillingStatus> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return { isPro: false, proSince: null };

  const res = await fetch(new URL("/billing/status", API_URL), {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return { isPro: false, proSince: null };
  return res.json() as Promise<BillingStatus>;
});
