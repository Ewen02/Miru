import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { NotificationsListDto } from "@miru/types";
import { API_URL } from "./env";

async function buildHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return cookieHeader ? { cookie: cookieHeader } : {};
}

/**
 * Notifications for the bell badge. Wrapped in React.cache() so AppHeader
 * (which renders on every authenticated page) shares one fetch with the
 * /notifications page body when both fire in the same render.
 *
 * `cache: "no-store"` is required because the payload is session-scoped;
 * dedup happens at the React level only.
 */
export const fetchNotifications = cache(async (): Promise<NotificationsListDto | null> => {
  const headers = await buildHeaders();
  if (!headers.cookie) return null;

  const url = new URL("/notifications", API_URL);
  const res = await fetch(url, { headers, cache: "no-store" });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<NotificationsListDto>;
});
