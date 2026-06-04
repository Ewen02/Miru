import "server-only";
import { cookies } from "next/headers";
import type { UserAchievementsDto } from "@miru/types";
import { API_URL } from "./env";

/**
 * The authenticated user's achievements (unlocked + the full catalog so the
 * page can show locked ones too). Returns null when unauthenticated.
 */
export async function fetchUserAchievements(): Promise<UserAchievementsDto | null> {
  const store = await cookies();
  const header = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!header) return null;

  const res = await fetch(new URL("/achievements/me", API_URL), {
    headers: { cookie: header },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<UserAchievementsDto>;
}
