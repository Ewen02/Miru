import "server-only";
import { cookies } from "next/headers";
import type { ClubDetailDto, ClubSummaryDto } from "@miru/types";
import { API_URL } from "./env";

async function cookieHeader(): Promise<string | null> {
  const store = await cookies();
  const header = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return header || null;
}

/** Public clubs list; forwards the session cookie so isMember is accurate. */
export async function fetchClubs(): Promise<ClubSummaryDto[]> {
  const header = await cookieHeader();
  const res = await fetch(new URL("/clubs", API_URL), {
    headers: header ? { cookie: header } : {},
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json() as Promise<ClubSummaryDto[]>;
}

/** Public club detail + wall. Null when missing. */
export async function fetchClub(slug: string): Promise<ClubDetailDto | null> {
  const header = await cookieHeader();
  const res = await fetch(new URL(`/clubs/${slug}`, API_URL), {
    headers: header ? { cookie: header } : {},
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<ClubDetailDto>;
}
