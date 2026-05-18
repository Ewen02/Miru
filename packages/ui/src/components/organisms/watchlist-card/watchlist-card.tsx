import Image from "next/image";
import Link from "next/link";
import { cn } from "../../../utils/cn";

interface WatchlistCardProps {
  slug: string;
  title: string;
  coverUrl: string | null;
  episodesWatched: number;
  episodesTotal: number | null;
  /** Optional user-given rating (1-10) shown under the title. */
  rating?: number | null;
  /** Top-right status badge — defaults to episode count when status=WATCHING. */
  badge?: string | null;
  className?: string;
}

/**
 * Watchlist card: 3:4 cover with a top-right status badge and a progress
 * bar at the bottom. Below the cover sits the title and, when present,
 * the user's rating in accent. The whole card is a single anchor link
 * to the anime detail.
 */
export function WatchlistCard({
  slug,
  title,
  coverUrl,
  episodesWatched,
  episodesTotal,
  rating,
  badge,
  className,
}: WatchlistCardProps) {
  const pct =
    episodesTotal && episodesTotal > 0
      ? Math.min(100, (episodesWatched / episodesTotal) * 100)
      : 0;
  const computedBadge =
    badge ?? (episodesTotal ? `ÉP. ${episodesWatched}/${episodesTotal}` : null);

  return (
    <Link
      href={`/anime/${slug}`}
      className={cn(
        "group block rounded-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
    >
      <div className="relative mb-2.5 aspect-[3/4] overflow-hidden rounded-lg border border-border bg-bg-elevated">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-bg-elevated to-bg-surface" />
        )}

        {/* Top-right status badge */}
        {computedBadge && (
          <span className="absolute top-2 right-2 rounded-md bg-bg-base/75 px-2 py-1 font-mono text-[10px] tracking-wider text-text-primary backdrop-blur-sm">
            {computedBadge}
          </span>
        )}

        {/* Progress bar */}
        {pct > 0 && (
          <div className="absolute inset-x-2 bottom-2">
            <div className="h-[3px] overflow-hidden rounded-sm bg-bg-base/60">
              <div
                className="h-full rounded-sm transition-[width] duration-300"
                style={{ width: `${pct}%`, backgroundColor: "var(--color-accent)" }}
              />
            </div>
          </div>
        )}
      </div>

      <h3 className="mb-1 line-clamp-2 font-display text-sm font-semibold leading-snug text-text-primary">
        {title}
      </h3>
      {rating != null ? (
        <p className="font-mono text-[11px] text-text-secondary">
          <span style={{ color: "var(--color-accent)" }}>★</span> {rating.toFixed(1)}
        </p>
      ) : (
        <p className="font-mono text-[10px] tracking-wider text-text-tertiary uppercase">
          Pas encore noté
        </p>
      )}
    </Link>
  );
}
