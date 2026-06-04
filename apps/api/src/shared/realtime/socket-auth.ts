import type { Socket } from "socket.io";
import { auth } from "@auth/auth";

/**
 * Resolves the authenticated user id from a Socket.IO handshake by replaying
 * the connection's Cookie header through Better Auth — the same mechanism the
 * HTTP AuthRequiredGuard uses. Returns null for anonymous / invalid sessions.
 *
 * Lives in shared/ so every gateway (DM, watch party) authenticates uniformly.
 */
export async function userIdFromSocket(client: Socket): Promise<string | null> {
  const cookie = client.handshake.headers.cookie;
  if (!cookie) return null;
  try {
    const session = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
