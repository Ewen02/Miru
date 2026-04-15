import { cn } from "../../../utils/cn";

interface AnimeHeroProps {
  title: string;
  titleJp: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  rating: number | null;
  year: number | null;
  format: string;
  status: string;
  studioName: string | null;
  className?: string;
}

export function AnimeHero({
  title,
  titleJp,
  coverUrl,
  bannerUrl,
  rating,
  year,
  format,
  status,
  studioName,
  className,
}: AnimeHeroProps) {
  return (
    <header className={cn("relative w-full", className)}>
      <div className="relative h-80 w-full overflow-hidden bg-bg-elevated sm:h-100">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt=""
            loading="eager"
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-b from-bg-base/40 via-bg-base/60 to-bg-base" />
      </div>

      <div className="relative mx-auto -mt-32 flex max-w-300 flex-col gap-6 px-6 sm:flex-row sm:items-end">
        <div className="relative aspect-3/4 w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-bg-surface sm:w-48">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 pb-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wide text-text-tertiary">
            <span>{format}</span>
            <span aria-hidden>·</span>
            <span>{status}</span>
            {year != null && (
              <>
                <span aria-hidden>·</span>
                <span>{year}</span>
              </>
            )}
            {studioName && (
              <>
                <span aria-hidden>·</span>
                <span className="text-text-secondary">{studioName}</span>
              </>
            )}
          </div>

          <h1 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
            {title}
          </h1>
          {titleJp && (
            <p className="font-body text-sm text-text-tertiary">{titleJp}</p>
          )}

          {rating != null && (
            <div className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-bg-surface px-2.5 py-1 font-mono text-sm text-text-secondary">
              <span className="text-accent">★</span>
              <span>{rating.toFixed(1)}</span>
              <span className="text-text-tertiary">/ 10</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
