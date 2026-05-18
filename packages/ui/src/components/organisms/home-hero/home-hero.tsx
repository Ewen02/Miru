"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../../ui/button";
import { cn } from "../../../utils/cn";

export interface HomeHeroSlide {
  slug: string;
  title: string;
  pitch: string;
  bannerUrl: string | null;
  coverUrl: string | null;
  accentHex: string | null;
  rating: number | null;
  year: number | null;
  format: string;
  studio: string | null;
  rank?: number;
}

interface HomeHeroProps {
  slides: HomeHeroSlide[];
  /** Auto-advance interval. Set to 0 to disable. */
  intervalMs?: number;
  /** Show the "+ Watchlist" CTA. Hidden for anonymous visitors. */
  showWatchlistCta?: boolean;
  className?: string;
}

const DEFAULT_INTERVAL_MS = 7000;

/**
 * Full-bleed editorial banner for the home page. Single slide is rendered
 * statically; multiple slides become an auto-advancing carousel with manual
 * dot controls on the right edge.
 *
 * The accent CSS variable is scoped to the inner content so each slide can
 * tint its rating and primary CTA with its own anime accent without leaking
 * the colour to the rest of the page.
 */
export function HomeHero({
  slides,
  intervalMs = DEFAULT_INTERVAL_MS,
  showWatchlistCta = false,
  className,
}: HomeHeroProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const total = slides.length;
  const safeIntervalMs = total > 1 ? intervalMs : 0;

  useEffect(() => {
    if (safeIntervalMs <= 0 || paused) return;
    const handle = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, safeIntervalMs);
    return () => window.clearInterval(handle);
  }, [safeIntervalMs, paused, total]);

  if (total === 0) return null;

  const current = slides[index];
  const accent = current.accentHex ?? "#c8a2ff";

  return (
    <section
      ref={wrapperRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Tendance"
      className={cn("relative h-[520px] w-full overflow-hidden bg-bg-base", className)}
      style={{ "--accent-override": accent } as React.CSSProperties}
    >
      {/* Banner layers — each slide cross-fades. */}
      {slides.map((slide, i) => (
        <div
          key={slide.slug}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          {slide.bannerUrl ? (
            <Image
              src={slide.bannerUrl}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(ellipse at 70% 30%, ${slide.accentHex ?? "#c8a2ff"}30 0%, transparent 55%), linear-gradient(160deg, ${slide.accentHex ?? "#c8a2ff"}20 0%, #08080c 80%)`,
              }}
            />
          )}
          {/* Side fade for legibility. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,8,12,0.92) 0%, rgba(8,8,12,0.6) 30%, transparent 60%)",
            }}
          />
          {/* Bottom fade to base. */}
          <div
            className="absolute inset-x-0 bottom-0 h-[260px]"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(8,8,12,0.6) 35%, var(--color-bg-base) 100%)",
            }}
          />
        </div>
      ))}

      {/* Content (re-renders per slide change for the title). */}
      <div className="relative z-10 flex h-full flex-col justify-end gap-5 px-14 pb-16 max-w-[720px]">
        <p className="font-mono text-[11px] tracking-[0.22em] text-white/60 uppercase">
          Tendance{current.rank != null ? ` #${current.rank}` : ""}
          {current.studio && <span> · {current.studio}</span>}
        </p>
        <h1 className="m-0 font-display text-[64px] font-semibold leading-[0.98] tracking-[-0.025em] text-text-primary">
          {current.title}
        </h1>
        <p className="m-0 max-w-[560px] font-body text-base leading-relaxed text-white/75 text-pretty">
          {current.pitch}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" style={{ backgroundColor: accent, color: "#08080c" }}>
            <Link href={`/anime/${current.slug}`}>Voir la fiche</Link>
          </Button>
          {showWatchlistCta && (
            <Button asChild size="lg" variant="outline">
              <Link href={`/anime/${current.slug}`}>+ Watchlist</Link>
            </Button>
          )}
          <span className="mx-2 h-6 w-px bg-border" aria-hidden />
          <span className="font-mono text-[13px] text-white/70">
            {current.rating != null && (
              <>
                <span style={{ color: accent }}>★</span> {current.rating.toFixed(1)} ·{" "}
              </>
            )}
            {current.year && <>{current.year} · </>}
            {current.format}
          </span>
        </div>
      </div>

      {/* Manual indicator dots (right edge). */}
      {total > 1 && (
        <div className="absolute right-14 bottom-16 z-10 flex flex-col gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.slug}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Aller au slide ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "rounded-sm transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                i === index ? "h-6 w-1 bg-text-primary" : "h-1 w-1 bg-white/25 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
