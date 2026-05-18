"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../../atoms/logo";
import { cn } from "../../../utils/cn";

interface AnimeContext {
  slug: string;
  title: string;
  rating: number | null;
  coverUrl: string | null;
  resumeLabel?: string;
  onResume?: () => void;
}

interface StickyHeaderProps {
  animeContext?: AnimeContext;
  compressThreshold?: number;
  className?: string;
}

function PlayIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function SearchIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function StickyHeader({
  animeContext,
  compressThreshold = 240,
  className,
}: StickyHeaderProps) {
  const [compressed, setCompressed] = useState(false);

  useEffect(() => {
    const handleScroll = () => setCompressed(window.scrollY > compressThreshold);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [compressThreshold]);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 px-5 transition-all duration-300",
        compressed
          ? "border-b border-border bg-bg-overlay backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent",
        className,
      )}
    >
      <div className="flex h-13 items-center gap-4">
        <Link
          href="/"
          aria-label="Accueil Miru"
          className="shrink-0 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <Logo size={20} />
        </Link>

        {animeContext && (
          <div
            className={cn(
              "ml-3 flex min-w-0 flex-1 items-center gap-3 transition-all duration-300",
              compressed
                ? "pointer-events-auto translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2.5 opacity-0",
            )}
          >
            <Link
              href={`/anime/${animeContext.slug}`}
              className="relative h-9 w-7 shrink-0 overflow-hidden rounded-sm bg-bg-elevated"
            >
              {animeContext.coverUrl && (
                <Image
                  src={animeContext.coverUrl}
                  alt=""
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-[13px] font-semibold text-text-primary">
                {animeContext.title}
              </div>
              {animeContext.rating != null && (
                <div className="font-mono text-[10px] text-text-tertiary">
                  ★ {animeContext.rating.toFixed(1)}
                </div>
              )}
            </div>
            {animeContext.resumeLabel && (
              <button
                type="button"
                onClick={animeContext.onResume}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 font-body text-[11px] font-medium text-white"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                <PlayIcon size={10} />
                {animeContext.resumeLabel}
              </button>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex flex-1 justify-center transition-opacity duration-200",
            compressed && animeContext
              ? "pointer-events-none opacity-0"
              : "pointer-events-auto opacity-100",
          )}
        >
          <div className="flex min-w-50 items-center gap-2 rounded-md border border-border bg-bg-surface px-3 py-1.5 font-body text-xs text-text-tertiary">
            <SearchIcon size={12} />
            Rechercher un anime…
          </div>
        </div>

        <div
          aria-label="Profil"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-body text-[11px] font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, var(--color-accent) 0%, #3a1212 100%)",
          }}
        >
          ?
        </div>
      </div>
    </div>
  );
}
