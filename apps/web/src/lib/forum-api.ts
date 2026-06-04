"use client";

import type { ForumCategory, ForumThreadDetailDto } from "@miru/types";
import { API_URL } from "./env";

export async function createThread(input: {
  title: string;
  category: ForumCategory;
  body: string;
}): Promise<ForumThreadDetailDto | { error: string }> {
  const res = await fetch(new URL("/forum/threads", API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (res.status === 401) return { error: "Connecte-toi pour créer un sujet." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<ForumThreadDetailDto>;
}

export async function addForumPost(
  threadId: string,
  body: string,
): Promise<ForumThreadDetailDto | { error: string }> {
  const res = await fetch(new URL(`/forum/threads/${threadId}/posts`, API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (res.status === 401) return { error: "Connecte-toi pour répondre." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<ForumThreadDetailDto>;
}
