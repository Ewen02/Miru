"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@miru/ui";

interface NavRoute {
  href: string;
  label: string;
  description: string;
}

/**
 * Catalogue discovery routes — ways to browse the anime library itself.
 */
const DISCOVER_ROUTES: NavRoute[] = [
  {
    href: "/calendar",
    label: "Calendrier",
    description: "Les épisodes qui sortent cette semaine.",
  },
  {
    href: "/top",
    label: "Top 100",
    description: "Les anime les mieux notés du catalogue.",
  },
  {
    href: `/seasons/${new Date().getFullYear()}`,
    label: "Saisons",
    description: "Tous les titres de l'année, filtrables par format.",
  },
];

/**
 * Community routes — where people meet, talk, and play together. Kept distinct
 * from catalogue discovery so the social surface is findable on its own.
 */
const COMMUNITY_ROUTES: NavRoute[] = [
  {
    href: "/trending",
    label: "Tendances",
    description: "L'activité de la communauté en direct.",
  },
  {
    href: "/forum",
    label: "Forum",
    description: "Discussions de la communauté par catégorie.",
  },
  {
    href: "/clubs",
    label: "Clubs",
    description: "Rejoins des clubs de fans.",
  },
  {
    href: "/polls",
    label: "Sondages",
    description: "Vote sur les sondages de la communauté.",
  },
  {
    href: "/editorial",
    label: "Éditorial",
    description: "Articles et analyses de la rédaction.",
  },
  {
    href: "/party",
    label: "Watch party",
    description: "Regarde en synchro avec tes amis.",
  },
];

/**
 * Generic header dropdown. Highlights itself when the current path matches one
 * of its routes. Adding a route: append to the relevant ROUTES array.
 */
function NavDropdown({ label, routes }: { label: string; routes: NavRoute[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = routes.some((r) => pathname?.startsWith(r.href));

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "relative inline-flex h-10 items-center gap-1 rounded-md px-3.5 font-body text-sm font-medium transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
          isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
        )}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
        {isActive && (
          <span
            aria-hidden
            className="absolute right-3.5 -bottom-2 left-3.5 h-0.5 rounded-sm bg-text-primary"
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-1 w-72 overflow-hidden rounded-xl border border-border bg-bg-surface p-1"
        >
          {routes.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              role="menuitem"
              className="flex flex-col rounded-md px-3 py-2.5 transition-colors duration-150 hover:bg-bg-elevated"
            >
              <span className="font-body text-sm font-semibold text-text-primary">{r.label}</span>
              <span className="font-body text-xs text-text-tertiary">{r.description}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DiscoverDropdown() {
  return <NavDropdown label="Découvrir" routes={DISCOVER_ROUTES} />;
}

export function CommunityDropdown() {
  return <NavDropdown label="Communauté" routes={COMMUNITY_ROUTES} />;
}
