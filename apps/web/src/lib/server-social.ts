import "server-only";
import { cookies } from "next/headers";
import type { ActivityEventDto, FollowStatsDto } from "@miru/types";
import { API_URL } from "./env";

async function cookieHeader(): Promise<string | null> {
  const store = await cookies();
  const header = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return header || null;
}

/**
 * Activity feed for the authenticated user (their follows + themselves).
 * Returns null when unauthenticated so the page can redirect to /login.
 */
export async function fetchActivityFeed(limit = 30): Promise<ActivityEventDto[] | null> {
  const header = await cookieHeader();
  if (!header) return null;

  const url = new URL("/social/feed", API_URL);
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url, { headers: { cookie: header }, cache: "no-store" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<ActivityEventDto[]>;
}

/** Follow stats for a profile, including whether the viewer follows them. */
export async function fetchFollowStats(userId: string): Promise<FollowStatsDto> {
  const header = await cookieHeader();
  const res = await fetch(new URL(`/social/follow-stats/${userId}`, API_URL), {
    headers: header ? { cookie: header } : {},
    cache: "no-store",
  });
  if (!res.ok) return { followers: 0, following: 0, isFollowing: false };
  return res.json() as Promise<FollowStatsDto>;
}
