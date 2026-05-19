import "server-only";
import { cookies } from "next/headers";
import type { NotificationsListDto } from "@miru/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function buildHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return cookieHeader ? { cookie: cookieHeader } : {};
}

export async function fetchNotifications(): Promise<NotificationsListDto | null> {
  const headers = await buildHeaders();
  if (!headers.cookie) return null;

  const url = new URL("/notifications", API_URL);
  const res = await fetch(url, {
    headers,
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<NotificationsListDto>;
}
