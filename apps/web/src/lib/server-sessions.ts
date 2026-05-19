import { API_URL } from "./env";
import "server-only";
import { cookies } from "next/headers";
import type { UserActiveSessionDto } from "@miru/types";


export async function fetchUserSessions(): Promise<UserActiveSessionDto[] | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return null;

  const res = await fetch(`${API_URL}/users/me/sessions`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<UserActiveSessionDto[]>;
}
