"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@miru/ui";
import { CommandPalette } from "./command-palette";
import { AvatarMenu } from "./avatar-menu";
import { DiscoverDropdown } from "./discover-dropdown";
import { useHeaderDetail } from "./header-context";

interface AppHeaderClientProps {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  } | null;
  unreadCount: number;
  logo: ReactNode;
}

/** Map pathname → which top-level tab to highlight. */
function resolveActiveTab(pathname: string | null): "catalogue" | "watchlist" | null {
  if (!pathname) return null;
  if (pathname === "/" || pathname.startsWith("/anime")) return "catalogue";
  if (pathname.startsWith("/watchlist")) return "watchlist";
  return null;
}

/** Pages that render their own full-screen layout (no app header). */
const NO_HEADER_PREFIXES = ["/login", "/register"];

export function AppHeaderClient({ user, unreadCount, logo }: AppHeaderClientProps) {
  const pathname = usePathname();
  const activeTab = resolveActiveTab(pathname);
  const detail = useHeaderDetail();
  const isDetailRoute = pathname?.startsWith("/anime/") ?? false;
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    // Compact (border + blur) kicks in early; the detail context swap happens
    // once the user has scrolled past the hero (~heroBannerH + cover gap ≈ 480px).
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      setPastHero(y > 380);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname && NO_HEADER_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  const tabs: Array<{ key: "catalogue" | "watchlist"; label: string; href: string }> = [
    { key: "catalogue", label: "Catalogue", href: "/" },
  ];
  if (user) {
    tabs.push({ key: "watchlist", label: "Watchlist", href: "/watchlist" });
  }

  const showDetailContext = isDetailRoute && pastHero && detail != null;
  const detailAccentStyle = showDetailContext && detail?.accentHex
    ? ({ "--color-accent": detail.accentHex } as React.CSSProperties)
    : undefined;

  return (
    <>
      <header
        style={detailAccentStyle}
        className={cn(
          "sticky top-0 z-40 h-14 transition-all duration-200",
          scrolled
            ? "border-b border-border bg-bg-overlay backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-full max-w-300 items-center gap-7 px-7">
          {logo}

          {showDetailContext ? (
            <div className="flex min-w-0 flex-1 items-center gap-3 transition-opacity duration-200">
              {detail!.coverUrl && (
                <div className="relative h-7 w-5 shrink-0 overflow-hidden rounded-xs border border-border-subtle">
                  <Image
                    src={detail!.coverUrl}
                    alt=""
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                </div>
              )}
              <p className="truncate font-display text-sm font-semibold text-text-primary">
                {detail!.title}
              </p>
              {detail!.rating != null && (
                <span className="font-mono text-xs text-text-tertiary">
                  <span style={{ color: "var(--color-accent)" }}>★</span>{" "}
                  {detail!.rating.toFixed(1)}
                </span>
              )}
            </div>
          ) : (
            <nav className="flex flex-1 items-center gap-1" aria-label="Sections">
              {tabs.map((t) => {
                const isActive = activeTab === t.key;
                return (
                  <Link
                    key={t.key}
                    href={t.href}
                    className={cn(
                      "relative rounded-md px-3.5 py-2 font-body text-sm font-medium transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                      isActive
                        ? "text-text-primary"
                        : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {t.label}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute right-3.5 -bottom-3 left-3.5 h-0.5 rounded-sm bg-text-primary"
                      />
                    )}
                  </Link>
                );
              })}
              <DiscoverDropdown />
            </nav>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Rechercher"
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-md border border-border bg-bg-surface px-2.5",
                "font-body text-xs text-text-tertiary transition-colors duration-200",
                "hover:border-border hover:bg-bg-elevated hover:text-text-secondary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              )}
            >
              <SearchIcon />
              <span className="hidden sm:inline">Rechercher</span>
              <kbd className="hidden font-mono text-[10px] tracking-wider text-text-quaternary sm:inline">
                ⌘K
              </kbd>
            </button>

            {user && (
              <Link
                href="/notifications"
                aria-label={
                  unreadCount > 0
                    ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                    : "Notifications"
                }
                className={cn(
                  "relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg-surface text-text-secondary",
                  "transition-colors duration-200 hover:border-border hover:bg-bg-elevated hover:text-text-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                )}
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span
                    aria-hidden
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-sm px-1 font-mono text-[9px] font-semibold"
                    style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <AvatarMenu user={user} />
            ) : (
              <Link
                href="/login"
                className={cn(
                  "inline-flex h-8 items-center rounded-md px-3 font-body text-sm font-medium",
                  "text-text-secondary transition-colors duration-200 hover:text-text-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                )}
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
