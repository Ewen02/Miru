"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../../utils/cn";

export interface SeasonItem {
  label: string;
  slug: string | null;
  current?: boolean;
}

interface SeasonSwitcherProps {
  seasons: SeasonItem[];
  className?: string;
}

/**
 * Segmented control with a sliding accent underline beneath the active season.
 * The underline measures the active item's offset/width on mount and on
 * resize, then animates between seasons.
 */
export function SeasonSwitcher({ seasons, className }: SeasonSwitcherProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const activeIndex = Math.max(0, seasons.findIndex((s) => s.current));

  useLayoutEffect(() => {
    function measure() {
      const track = trackRef.current;
      const target = itemRefs.current[activeIndex];
      if (!track || !target) return;
      const trackRect = track.getBoundingClientRect();
      const itemRect = target.getBoundingClientRect();
      setIndicator({
        left: itemRect.left - trackRect.left,
        width: itemRect.width,
      });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex, seasons.length]);

  if (seasons.length <= 1) return null;

  return (
    <div className={cn("mt-6 flex flex-col gap-2 px-5", className)}>
      <span className="font-body text-[9px] font-medium uppercase tracking-[0.2em] text-text-tertiary">
        Saison
      </span>
      <div
        ref={trackRef}
        role="tablist"
        className="relative inline-flex w-fit gap-1 overflow-x-auto rounded-md border border-border bg-bg-surface p-1"
      >
        {seasons.map((s, idx) => {
          const baseClass = cn(
            "relative z-10 inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs whitespace-nowrap",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
          );
          const activeClass = "font-semibold text-text-primary";
          const otherClass =
            "text-text-secondary font-medium hover:text-text-primary";

          const setRef = (el: HTMLElement | null) => {
            itemRefs.current[idx] = el;
          };

          if (s.current) {
            return (
              <span
                key={`${s.label}-${idx}`}
                ref={setRef}
                role="tab"
                aria-selected
                className={cn(baseClass, activeClass)}
                style={{ color: "var(--color-accent)" }}
              >
                {s.label}
              </span>
            );
          }
          if (!s.slug) {
            return (
              <span
                key={`${s.label}-${idx}`}
                ref={setRef}
                role="tab"
                aria-selected={false}
                className={cn(baseClass, otherClass, "opacity-60")}
              >
                {s.label}
              </span>
            );
          }
          return (
            <Link
              key={`${s.label}-${idx}`}
              ref={setRef as React.Ref<HTMLAnchorElement>}
              href={`/anime/${s.slug}`}
              role="tab"
              aria-selected={false}
              className={cn(baseClass, otherClass)}
            >
              {s.label}
            </Link>
          );
        })}

        {/* Sliding accent underline. */}
        {indicator && (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0.5 z-0 h-0.5 rounded-sm transition-all duration-300 ease-out"
            style={{
              left: indicator.left,
              width: indicator.width,
              backgroundColor: "var(--color-accent)",
            }}
          />
        )}
      </div>
    </div>
  );
}
