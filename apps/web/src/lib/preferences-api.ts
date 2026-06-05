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

export async function deleteAccount(): Promise<
  { ok: true; deletedAt: string } | { error: string }
> {
  const res = await fetch(new URL("/users/me", API_URL), {
    method: "DELETE",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ confirm: "DELETE" }),
  });
  if (res.status === 401) return { error: "auth-required" };
  if (!res.ok) return { error: `http-${res.status}` };
  const body = (await res.json()) as { deletedAt: string };
  return { ok: true, deletedAt: body.deletedAt };
}

export async function restoreAccount(): Promise<
  { ok: true; restored: boolean } | { error: string }
> {
  const res = await fetch(new URL("/users/me/restore", API_URL), {
    method: "POST",
    credentials: "include",
  });
  if (res.status === 401) return { error: "auth-required" };
  if (!res.ok) return { error: `http-${res.status}` };
  const body = (await res.json()) as { restored: boolean };
  return { ok: true, restored: body.restored };
}
