"use client";

import { API_URL } from "./env";

export async function followUser(userId: string): Promise<{ ok: true } | { error: string }> {
  const res = await fetch(new URL(`/social/follow/${userId}`, API_URL), {
    method: "POST",
    credentials: "include",
  });
  if (res.status === 401) return { error: "Connecte-toi pour suivre." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return { ok: true };
}

export async function unfollowUser(userId: string): Promise<{ ok: true } | { error: string }> {
  const res = await fetch(new URL(`/social/follow/${userId}`, API_URL), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return { ok: true };
}
