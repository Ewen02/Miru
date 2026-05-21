import "server-only";
import { cookies } from "next/headers";
import { API_URL } from "./env";

export interface MeDto {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  twoFactorEnabled: boolean;
}

export async function fetchMe(): Promise<MeDto | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (!cookieHeader) return null;

  const res = await fetch(`${API_URL}/users/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<MeDto>;
}
