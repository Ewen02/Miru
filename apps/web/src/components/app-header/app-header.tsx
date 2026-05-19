import Link from "next/link";
import { Logo } from "@miru/ui";
import { getServerSession } from "@/lib/server-auth";
import { fetchNotifications } from "@/lib/server-notifications";
import { AppHeaderClient } from "./app-header.client";

/**
 * Persistent global header. Server-rendered shell that reads the session
 * once and hands the interactive bits (scroll detection, ⌘K, avatar menu)
 * to the client variant.
 *
 * The active tab is resolved client-side from the URL — no per-page prop
 * needed. Pages like /login or /register skip the header entirely via a
 * pathname check in the client.
 */
export async function AppHeader() {
  const session = await getServerSession();
  const notifications = session
    ? await fetchNotifications().catch(() => null)
    : null;

  return (
    <AppHeaderClient
      user={session?.user ?? null}
      unreadCount={notifications?.unreadCount ?? 0}
      logo={
        <Link
          href="/"
          aria-label="Accueil Miru"
          className="shrink-0 rounded-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <Logo size={20} />
        </Link>
      }
    />
  );
}
