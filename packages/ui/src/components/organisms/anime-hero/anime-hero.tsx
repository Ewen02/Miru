import Image from "next/image";
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
  /** Optional number of reviews to display under the rating block. */
  reviewCount?: number | null;
  className?: string;
}

/**
 * Anime detail hero. Three-region layout once the cover overlaps:
 * - cover on the left (180×260 with a subtle border)
 * - title block in the middle (meta eyebrow, title, JP subtitle)
 * - rating block on the right (eyebrow + accented number + review count)
 *
 * The banner is 320px tall and fades into the page base; if no banner
 * image is available, a radial accent gradient stands in.
 */
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
  reviewCount,
  className,
}: AnimeHeroProps) {
  const metaParts = [format, status, year?.toString(), studioName].filter(Boolean) as string[];

  return (
    <header className={cn("relative w-full", className)}>
      {/* Banner — 320px, gradient fades into bg-base. */}
      <div className="relative h-80 w-full overflow-hidden bg-bg-elevated">
        {bannerUrl ? (
          <Image src={bannerUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, var(--color-accent-muted) 0%, transparent 55%), linear-gradient(160deg, var(--color-bg-elevated) 0%, var(--color-bg-base) 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-bg-base/30 to-bg-base" />
      </div>

      {/* Cover + title + rating, overlaps the banner by 100px. */}
      <div className="relative -mt-25 mx-auto flex w-full max-w-300 gap-7 px-7">
        {/* Cover */}
        <div className="relative h-65 w-45 shrink-0 overflow-hidden rounded-xl border-2 border-white/8 bg-bg-surface">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              priority
              sizes="180px"
              className="object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-accent) 0%, rgba(0,0,0,0.4) 100%)",
              }}
            />
          )}
        </div>

        {/* Title block */}
        <div className="flex min-w-0 flex-1 flex-col justify-end gap-2 pb-1 pt-29">
          {metaParts.length > 0 && (
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-text-tertiary">
              {metaParts.join(" · ")}
            </p>
          )}
          <h1 className="font-display text-[44px] font-semibold leading-none tracking-[-0.02em] text-text-primary">
            {title}
          </h1>
          {titleJp && <p className="font-body text-sm text-text-secondary">{titleJp}</p>}
        </div>

        {/* Rating block (right) — only when a rating is available. */}
        {rating != null && (
          <div className="hidden shrink-0 flex-col items-end gap-1.5 pb-1 pt-29 text-right sm:flex">
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-text-tertiary">
              Note communauté
            </p>
            <p className="inline-flex items-baseline gap-1 font-display text-4xl font-semibold leading-none tracking-[-0.02em]">
              <span style={{ color: "var(--color-accent)" }}>{rating.toFixed(1)}</span>
              <span className="font-body text-base font-medium text-text-tertiary">/10</span>
            </p>
            {reviewCount != null && reviewCount > 0 && (
              <p className="font-mono text-[10px] text-text-tertiary">
                {reviewCount.toLocaleString("fr-FR")} avis
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
