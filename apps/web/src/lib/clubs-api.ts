"use client";

import type { ClubDetailDto } from "@miru/types";
import { API_URL } from "./env";

type Result = ClubDetailDto | { error: string };

async function post(path: string, body?: unknown): Promise<Result> {
  const res = await fetch(new URL(path, API_URL), {
    method: "POST",
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) return { error: "Connecte-toi d'abord." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<ClubDetailDto>;
}

export async function createClub(input: { name: string; description?: string }) {
  return post("/clubs", input);
}
export async function joinClub(slug: string) {
  return post(`/clubs/${slug}/join`);
}
export async function leaveClub(slug: string) {
  return post(`/clubs/${slug}/leave`);
}
export async function postToClub(slug: string, body: string) {
  return post(`/clubs/${slug}/posts`, { body });
}
