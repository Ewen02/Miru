import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { OnboardingSnapshotDto } from "@miru/types";
import { API_URL } from "./env";

/**
 * "Where is the user in their journey?" — used by the home page to decide
 * which new-user nudge banners to render. Returns null for anonymous
 * visitors so the caller can skip the rendering entirely.
 *
 * Wrapped in React.cache() so the home page and the AppHeader (if it ever
 * grows a session-aware banner) share one fetch per render.
 */
export const fetchOnboardingSnapshot = cache(
  async (): Promise<OnboardingSnapshotDto | null> => {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    if (!cookieHeader) return null;

    const res = await fetch(new URL("/users/me/onboarding/snapshot", API_URL), {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    return (await res.json()) as OnboardingSnapshotDto;
  },
);
