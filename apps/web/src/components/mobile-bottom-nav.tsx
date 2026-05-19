"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@miru/ui";

/**
 * Persistent bottom navigation shown on small viewports. The desktop
 * AppHeader still renders above it — they coexist because the breakpoints
 * don't overlap (this bar is `md:hidden`).
 *
 * Hidden on auth pages and narrative content (editorial, year-in-review)
 * where chrome would distract.
 */
const HIDE_ON: string[] = ["/login", "/register", "/onboard", "/year-in-review", "/maintenance"];

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Catalogue",
    icon: <HomeIcon />,
    match: (p) => p === "/" || p.startsWith("/anime") || p.startsWith("/genre") || p.startsWith("/seasons") || p.startsWith("/top"),
  },
  {
    href: "/calendar",
    label: "Calendrier",
    icon: <CalendarIcon />,
    match: (p) => p.startsWith("/calendar"),
  },
  {
    href: "/watchlist",
    label: "Watchlist",
    icon: <ListIcon />,
    match: (p) => p.startsWith("/watchlist"),
  },
  {
    href: "/notifications",
    label: "Inbox",
    icon: <BellIcon />,
    match: (p) => p.startsWith("/notifications"),
  },
  {
    href: "/profile",
    label: "Profil",
    icon: <UserIcon />,
    match: (p) => p.startsWith("/profile") || p.startsWith("/u/") || p.startsWith("/settings"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-bg-overlay backdrop-blur-xl md:hidden"
    >
      <ul className="m-0 grid grid-cols-5 p-0">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                )}
                style={{
                  color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                }}
              >
                {item.icon}
                <span className="font-mono text-[9px] uppercase tracking-wider">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}
