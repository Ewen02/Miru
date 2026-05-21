import "server-only";
import { cookies } from "next/headers";
import type { UserPreferencesDto } from "@miru/types";
import { API_URL } from "./env";

/**
 * Defaults that the UI shows before the user has any persisted row.
 * Must stay in sync with apps/api .../user-repository.port#DEFAULT_USER_PREFERENCES.
 */
export const DEFAULT_PREFERENCES: UserPreferencesDto = {
  emailNewEpisodes: true,
  emailWeeklyRecap: true,
  emailReviewReply: false,
  emailNewFollower: false,
  inAppEpisodeAired: true,
  inAppRecommendation: true,
  inAppMention: true,
  quietFromHour: null,
  quietToHour: null,
};

export async function fetchUserPreferences(): Promise<UserPreferencesDto> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return DEFAULT_PREFERENCES;

  const res = await fetch(new URL("/users/me/preferences", API_URL), {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return DEFAULT_PREFERENCES;
  return (await res.json()) as UserPreferencesDto;
}
