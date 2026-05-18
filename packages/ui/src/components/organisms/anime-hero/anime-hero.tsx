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
  const metaParts = [format, status, year?.toString(), studioName].filter(Boolean) as string[];

  return (
    <header className={cn("relative w-full", className)}>
      {/* Banner fixe 280px, gradient accent → bg-base */}
      <div className="relative h-hero-banner-h w-full overflow-hidden bg-bg-elevated">
        {bannerUrl ? (
          <Image src={bannerUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent) 0%, #2a0e0e 60%, #08080c 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-bg-base" />
      </div>

      {/* Cover + info, overlap fixe -100px */}
      <div className="relative -mt-hero-overlap flex gap-5 px-5">
        <div className="relative h-cover-h w-cover-w shrink-0 overflow-hidden rounded-lg border-2 border-border bg-bg-surface">
          {coverUrl ? (
            <Image src={coverUrl} alt={title} fill sizes="128px" className="object-cover" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: "linear-gradient(145deg, var(--color-accent) 0%, rgba(0,0,0,0.4) 100%)",
              }}
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-end gap-1 pb-1">
          {metaParts.length > 0 && (
            <div className="font-body text-[10px] font-medium uppercase tracking-[0.15em] text-text-tertiary">
              {metaParts.join(" · ")}
            </div>
          )}

          <h1 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-text-primary">
            {title}
          </h1>
          {titleJp && <p className="font-body text-sm text-text-secondary">{titleJp}</p>}

          {rating != null && (
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className="font-display text-[26px] font-bold leading-none"
                style={{ color: "var(--color-accent)" }}
              >
                {rating.toFixed(1)}
              </span>
              <span className="font-body text-xs text-text-tertiary">/ 10</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
