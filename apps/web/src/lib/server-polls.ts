import "server-only";
import { cookies } from "next/headers";
import type { PollDto } from "@miru/types";
import { API_URL } from "./env";

/**
 * Lists community polls. Public, but forwards the session cookie when present
 * so the response includes the viewer's own vote per poll.
 */
export async function fetchPolls(limit = 30): Promise<PollDto[]> {
  const store = await cookies();
  const header = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const url = new URL("/polls", API_URL);
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url, {
    headers: header ? { cookie: header } : {},
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json() as Promise<PollDto[]>;
}
