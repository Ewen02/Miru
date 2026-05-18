import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "../../../utils/cn";

interface HorizontalSliderProps {
  eyebrow?: string;
  title: string;
  count?: number | null;
  action?: {
    label: string;
    href: string;
  };
  children: ReactNode;
  className?: string;
}

/**
 * Editorial section wrapper for the home page: a section header (eyebrow +
 * Display title + count + optional "Voir tout →" link) followed by a
 * horizontally-scrolling row of cards.
 *
 * The row uses native scroll-snap; cards inside set their own width via
 * `flex: 0 0 <px>`. Snap is x-mandatory at the start of each card.
 */
export function HorizontalSlider({
  eyebrow,
  title,
  count,
  action,
  children,
  className,
}: HorizontalSliderProps) {
  return (
    <section className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-end justify-between gap-4 px-7">
        <div className="flex flex-col gap-2">
          {eyebrow && (
            <span className="font-mono text-[10px] font-medium tracking-[0.22em] text-text-tertiary uppercase">
              {eyebrow}
            </span>
          )}
          <h2 className="m-0 inline-flex items-baseline gap-2.5 font-display text-xl font-semibold tracking-tight text-text-primary">
            {title}
            {count != null && (
              <span className="font-mono text-xs font-normal text-text-tertiary">
                {String(count).padStart(2, "0")}
              </span>
            )}
          </h2>
        </div>
        {action && (
          <Link
            href={action.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-body text-[13px] text-text-secondary",
              "transition-colors duration-200 hover:text-text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded-sm",
            )}
          >
            {action.label}
            <ChevronRightIcon />
          </Link>
        )}
      </div>

      {/*
        scroll-snap-x-mandatory + scrollbar-none keeps the row clean and
        snappy without the browser scrollbar polluting the design.
      */}
      <div
        className={cn(
          "flex gap-4 overflow-x-auto px-7 pb-1",
          "snap-x snap-mandatory",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {children}
      </div>
    </section>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
