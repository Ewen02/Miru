import { cache } from "react";
import { cookies } from "next/headers";
import { API_URL } from "./env";

export interface ServerSession {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  };
}

/**
 * Reads the Better Auth session from the API using the incoming cookies.
 * Returns null when the visitor is anonymous. Always called inside RSC
 * or route handlers, never in middleware (use middleware's own cookies()).
 *
 * Wrapped in React.cache(): AppHeader, every page, and any layout that
 * asks for the session in the same render share a single API round-trip.
 * Without this, the session is re-fetched per RSC tree node.
 */
export const getServerSession = cache(async (): Promise<ServerSession | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  if (!cookieHeader) return null;

  const res = await fetch(`${API_URL}/api/auth/get-session`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as ServerSession | null;
  return data ?? null;
});
