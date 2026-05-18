import { cn } from "../../../utils/cn";

interface EpisodeRowProps {
  number: number;
  title: string | null;
  duration: number | null;
  url: string | null;
  /** Fallback recherche plateforme (ex: "Attack on Titan episode 7"). */
  searchQuery?: string | null;
  /** Placeholder pour Phase 2 (watchlist). */
  watched?: boolean;
  current?: boolean;
  className?: string;
}

function crunchyrollSearchUrl(query: string): string {
  return `https://www.crunchyroll.com/search?q=${encodeURIComponent(query)}`;
}

function CheckIcon({ size = 10 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function EpisodeRow({
  number,
  title,
  duration,
  url,
  searchQuery,
  watched = false,
  current = false,
  className,
}: EpisodeRowProps) {
  const paddedNumber = String(number).padStart(2, "0");
  const fallbackSearch = searchQuery ? crunchyrollSearchUrl(searchQuery) : null;
  const href = url ?? fallbackSearch;

  const body = (
    <article
      className={cn(
        "flex cursor-pointer items-center gap-3.5 rounded-lg border-l-2 px-4 py-2.5",
        "transition-colors duration-150",
        current ? "bg-accent-subtle" : "border-l-transparent hover:bg-bg-elevated",
        className,
      )}
      style={current ? { borderLeftColor: "var(--color-accent)" } : undefined}
    >
      <div className="flex min-w-7 items-center justify-center">
        {watched ? (
          <div className="flex size-4.5 items-center justify-center rounded-full border border-border bg-bg-elevated text-text-tertiary">
            <CheckIcon size={10} />
          </div>
        ) : (
          <span
            className={cn("font-mono text-xs", current ? "font-semibold" : "text-text-tertiary")}
            style={current ? { color: "var(--color-accent)" } : undefined}
          >
            {paddedNumber}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate font-body text-[13.5px]",
            watched ? "text-text-tertiary" : "text-text-primary",
            current && "font-medium",
          )}
        >
          {title ?? `Épisode ${number}`}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3.5">
        {duration != null && (
          <span className="font-mono text-[11px] text-text-tertiary">{duration} min</span>
        )}
        {current && (
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: "var(--color-accent)",
              boxShadow: "0 0 8px var(--color-accent)",
            }}
          />
        )}
      </div>
    </article>
  );

  if (!href) return body;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      {body}
    </a>
  );
}
