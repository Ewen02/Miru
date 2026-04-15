import { cn } from "../../../utils/cn";

interface AnimeCardProps {
  title: string;
  coverUrl: string | null;
  studioName: string | null;
  year: number | null;
  rating: number | null;
  className?: string;
}

export function AnimeCard({
  title,
  coverUrl,
  studioName,
  year,
  rating,
  className,
}: AnimeCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-bg-surface",
        "transition-transform duration-200 ease-out hover:-translate-y-1",
        className,
      )}
    >
      <div className="aspect-[3/4] overflow-hidden bg-bg-elevated">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        {rating != null && (
          <div className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-0.5 font-mono text-xs text-text-secondary backdrop-blur-sm">
            ★ {rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="truncate font-display text-sm font-semibold text-text-primary">
          {title}
        </h3>
        <p className="mt-1 font-body text-xs text-text-tertiary">
          {[studioName, year].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
    </article>
  );
}
