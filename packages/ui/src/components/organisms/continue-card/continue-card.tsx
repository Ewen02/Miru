import Image from "next/image";
import Link from "next/link";
import { cn } from "../../../utils/cn";

interface ContinueCardProps {
  slug: string;
  title: string;
  coverUrl: string | null;
  episodesWatched: number;
  episodesTotal: number | null;
  /** Optional human-readable label like "Ép. 6 mercredi" or "Reprendre". */
  nextLabel?: string | null;
  className?: string;
}

/**
 * Slider card for "Continue à regarder". 16:10 thumbnail with a play
 * overlay + progress bar baked on the cover. Title sits below, with a
 * monospace progress line.
 *
 * Width is fixed at 224px so the slider can snap-x cleanly.
 */
export function ContinueCard({
  slug,
  title,
  coverUrl,
  episodesWatched,
  episodesTotal,
  nextLabel,
  className,
}: ContinueCardProps) {
  const pct =
    episodesTotal && episodesTotal > 0
      ? Math.min(100, (episodesWatched / episodesTotal) * 100)
      : 0;

  return (
    <Link
      href={`/anime/${slug}`}
      className={cn(
        "group block w-56 shrink-0 snap-start rounded-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
    >
      <div className="relative mb-2.5 aspect-[16/10] overflow-hidden rounded-lg border border-border bg-bg-elevated">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="224px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-bg-elevated to-bg-surface" />
        )}

        {/* Dim overlay on hover to make the play icon pop. */}
        <div className="absolute inset-0 bg-bg-base/30 transition-opacity duration-200 group-hover:bg-bg-base/50" />

        {/* Play overlay (always visible, brighter on hover). */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-white/20",
              "bg-bg-base/70 pl-0.5 text-white backdrop-blur-sm transition-transform duration-200",
              "group-hover:scale-110",
            )}
            aria-hidden
          >
            <PlayIcon />
          </div>
        </div>

        {/* Progress bar — only when there is progress. */}
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

      <p className="mb-1 line-clamp-2 font-display text-sm font-semibold leading-snug text-text-primary">
        {title}
      </p>
      <p className="font-mono text-[11px] text-text-secondary">
        <span>ÉP. {episodesWatched}</span>
        {episodesTotal != null && (
          <span className="text-text-tertiary">/{episodesTotal}</span>
        )}
        {nextLabel && (
          <>
            <span className="mx-2 text-text-quaternary">·</span>
            <span className="text-text-tertiary">{nextLabel}</span>
          </>
        )}
      </p>
    </Link>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5v14l12-7z" />
    </svg>
  );
}
