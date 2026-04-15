import { cn } from "../../../utils/cn";

interface EpisodeRowProps {
  number: number;
  title: string | null;
  duration: number | null;
  airedAt: Date | string | null;
  thumbnail: string | null;
  url: string | null;
  className?: string;
}

function formatDate(value: Date | string | null): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EpisodeRow({
  number,
  title,
  duration,
  airedAt,
  thumbnail,
  url,
  className,
}: EpisodeRowProps) {
  const airedLabel = formatDate(airedAt);
  const paddedNumber = String(number).padStart(2, "0");

  return (
    <article
      className={cn(
        "group flex items-stretch gap-3 overflow-hidden rounded-lg border border-border-subtle bg-bg-surface",
        "transition-colors duration-200 hover:border-border",
        className,
      )}
    >
      <div className="relative aspect-video w-24 shrink-0 bg-bg-elevated sm:w-36">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={title ?? `Épisode ${number}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-tertiary">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-2">
        <div className="flex items-baseline gap-2">
          <span className="shrink-0 font-mono text-xs text-text-tertiary">
            {paddedNumber}
          </span>
          <h3 className="truncate font-body text-sm text-text-primary">
            {title ?? <span className="text-text-tertiary">Épisode {number}</span>}
          </h3>
        </div>
        <p className="font-mono text-xs text-text-tertiary">
          {[duration != null ? `${duration} min` : null, airedLabel]
            .filter(Boolean)
            .join(" · ") || "—"}
        </p>
      </div>

      <div className="flex shrink-0 items-center pr-3">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center rounded-md border border-border bg-bg-elevated px-3 py-1.5",
              "font-mono text-xs uppercase tracking-wide text-text-secondary",
              "transition-colors duration-200 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
            )}
          >
            Regarder
          </a>
        ) : (
          <button
            type="button"
            disabled
            className={cn(
              "inline-flex cursor-not-allowed items-center rounded-md border border-border-subtle bg-bg-surface px-3 py-1.5",
              "font-mono text-xs uppercase tracking-wide text-text-tertiary",
              "transition-colors duration-200",
            )}
          >
            Indisponible
          </button>
        )}
      </div>
    </article>
  );
}
