"use client";

import type { UserPreferencesDto } from "@miru/types";
import { API_URL } from "./env";

export type UserPreferencesPatch = Partial<UserPreferencesDto>;

export async function updatePreferences(
  patch: UserPreferencesPatch,
): Promise<UserPreferencesDto | { error: string }> {
  const res = await fetch(new URL("/users/me/preferences", API_URL), {
    method: "PATCH",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (res.status === 401) return { error: "auth-required" };
  if (!res.ok) return { error: `http-${res.status}` };
  return (await res.json()) as UserPreferencesDto;
}

export async function deleteAccount(): Promise<{ ok: true } | { error: string }> {
  const res = await fetch(new URL("/users/me", API_URL), {
    method: "DELETE",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ confirm: "DELETE" }),
  });
  if (res.status === 204) return { ok: true };
  if (res.status === 401) return { error: "auth-required" };
  return { error: `http-${res.status}` };
}
