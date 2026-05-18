import Link from "next/link";
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

export function SeasonSwitcher({ seasons, className }: SeasonSwitcherProps) {
  if (seasons.length <= 1) return null;

  return (
    <div className={cn("mt-6 flex flex-col gap-2 px-5", className)}>
      <span className="font-body text-[9px] font-medium uppercase tracking-[0.2em] text-text-tertiary">
        Saison
      </span>
      <div className="flex gap-1.5 overflow-x-auto">
        {seasons.map((s, idx) => {
          const baseClass =
            "inline-flex items-center rounded-md border px-3.5 py-1.5 font-body text-xs whitespace-nowrap transition-colors duration-150";
          const currentClass = "font-semibold";
          const otherClass =
            "border-border bg-transparent text-text-secondary font-medium hover:bg-bg-elevated hover:text-text-primary";

          if (s.current) {
            return (
              <span
                key={`${s.label}-${idx}`}
                aria-current="page"
                className={cn(baseClass, currentClass)}
                style={{
                  backgroundColor: "var(--color-accent-muted)",
                  color: "var(--color-accent)",
                  borderColor: "color-mix(in srgb, var(--color-accent) 33%, transparent)",
                }}
              >
                {s.label}
              </span>
            );
          }
          if (!s.slug) {
            return (
              <span key={`${s.label}-${idx}`} className={cn(baseClass, otherClass, "opacity-60")}>
                {s.label}
              </span>
            );
          }
          return (
            <Link
              key={`${s.label}-${idx}`}
              href={`/anime/${s.slug}`}
              className={cn(baseClass, otherClass)}
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
