import "server-only";
import type { ForumThreadDetailDto, ForumThreadSummaryDto } from "@miru/types";
import { API_URL } from "./env";

/** Public list of forum threads, optionally filtered by category. */
export async function fetchForumThreads(category?: string): Promise<ForumThreadSummaryDto[]> {
  const url = new URL("/forum/threads", API_URL);
  if (category) url.searchParams.set("category", category);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json() as Promise<ForumThreadSummaryDto[]>;
}

/** Public thread detail (thread + posts in order). Null when missing. */
export async function fetchForumThread(id: string): Promise<ForumThreadDetailDto | null> {
  const res = await fetch(new URL(`/forum/threads/${id}`, API_URL), { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<ForumThreadDetailDto>;
}
