import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { YearInReviewDto } from "@miru/types";
import { EditorialSectionHeader, StatCard } from "@miru/ui";
import { fetchUserYearInReview } from "@/lib/server-year-in-review";
import { ShareButton } from "./share-button";

interface YearInReviewProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: YearInReviewProps): Promise<Metadata> {
  const { year } = await params;
  const t = await getTranslations("yearInReview");
  return {
    title: t("metaTitle", { year }),
    description: t("metaDescription", { year }),
  };
}

export default async function YearInReviewPage({ params }: YearInReviewProps) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 2000 || year > currentYear) notFound();

  const data = await fetchUserYearInReview(year);
  if (!data) redirect(`/login?next=/year-in-review/${year}`);

  if (data.completedCount === 0) {
    return <EmptyYear year={year} />;
  }

  return <YearInReviewContent year={year} data={data} />;
}

async function YearInReviewContent({ year, data }: { year: number; data: YearInReviewDto }) {
  const [t, locale] = await Promise.all([getTranslations("yearInReview"), getLocale()]);
  const maxMonth = Math.max(...data.months.map((m) => m.completedCount), 1);
  const yoy = computeYoY(data.completedCount, data.previousYearCompletedCount, t);
  const dominantGenre = data.genres[0]?.name ?? null;
  const numFmt = (n: number) => n.toLocaleString(locale);
  const monthLabels = [
    t("monthJan"), t("monthFeb"), t("monthMar"), t("monthApr"),
    t("monthMay"), t("monthJun"), t("monthJul"), t("monthAug"),
    t("monthSep"), t("monthOct"), t("monthNov"), t("monthDec"),
  ];

  const moodCopy =
    data.completedCount === 1
      ? t("moodSingle")
      : data.completedCount < 10
        ? t("moodCalm")
        : data.completedCount < 50
          ? t("moodNice")
          : t("moodIntense");

  return (
    <main className="mx-auto max-w-300 px-7 pb-20">
      {/* Hero */}
      <section className="relative border-b border-border-subtle py-20">
        <p
          className="m-0 mb-6 font-mono text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--color-accent)" }}
        >
          {t("heroEyebrow")}
        </p>
        <h1 className="m-0 mb-6 font-display font-bold leading-[0.85] tracking-[-0.04em] text-text-primary text-[120px] sm:text-[160px] lg:text-[200px]">
          {year}
        </h1>
        <p className="m-0 mb-8 max-w-180 font-body text-lg leading-snug text-text-secondary text-pretty sm:text-xl">
          {moodCopy} {t("completedLine")}{" "}
          <span className="text-text-primary">
            {t("completedAnime", { count: data.completedCount })}
          </span>
          {yoy && (
            <>
              {t("soit")} <span className="text-text-primary">{yoy}</span>
            </>
          )}
          , {t("totalLine")}{" "}
          <span className="text-text-primary">
            {t("hours", { count: numFmt(data.hoursWatched) })}
          </span>
        </p>
        <ShareButton
          year={data.year}
          completedCount={data.completedCount}
          hoursWatched={data.hoursWatched}
          topGenreLabel={dominantGenre}
        />
      </section>

      {/* Stats */}
      <section className="mt-16 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={t("statCompleted")}
          value={numFmt(data.completedCount)}
          sub={yoy ?? undefined}
        />
        <StatCard
          label={t("statHours")}
          value={numFmt(data.hoursWatched)}
          sub={
            data.hoursWatched > 0
              ? t("statHoursSub", { days: numFmt(Math.round(data.hoursWatched / 24)) })
              : undefined
          }
        />
        <StatCard
          label={t("statMovies")}
          value={numFmt(data.moviesCount)}
          sub={dominantGenre ? t("statMoviesSub", { genre: dominantGenre }) : undefined}
        />
        <StatCard
          label={t("statReviews")}
          value={numFmt(data.reviewCount)}
          tone="accent"
        />
      </section>

      {/* Monthly bar chart */}
      <section className="mt-20">
        <EditorialSectionHeader eyebrow={t("rhythmEyebrow")} title={t("rhythmTitle")} />
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-8">
          <div className="flex h-50 items-end gap-3">
            {data.months.map((mo) => {
              const heightPct = (mo.completedCount / maxMonth) * 100;
              const isMax = mo.completedCount === maxMonth && mo.completedCount > 0;
              const titleKey = mo.completedCount > 1 ? "monthsCompletedPlural" : "monthsCompleted";
              return (
                <div
                  key={mo.month}
                  className="flex flex-1 flex-col items-center gap-2"
                  title={t(titleKey, {
                    month: monthLabels[mo.month - 1] ?? "",
                    count: mo.completedCount,
                  })}
                >
                  <span className="font-mono text-[10px] text-text-tertiary">
                    {mo.completedCount}
                  </span>
                  <div
                    className="w-full rounded-sm transition-[height] duration-300"
                    style={{
                      height: `max(2px, ${heightPct}%)`,
                      backgroundColor: isMax
                        ? "var(--color-accent)"
                        : "var(--color-bg-elevated)",
                      borderColor: isMax ? "transparent" : "var(--color-border)",
                      borderWidth: isMax ? 0 : 1,
                      borderStyle: "solid",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-3">
            {data.months.map((mo) => (
              <span
                key={mo.month}
                className="flex-1 text-center font-mono text-[10px] text-text-tertiary"
              >
                {monthLabels[mo.month - 1] ?? ""}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Top anime */}
      {data.topAnime.length > 0 && (
        <section className="mt-20">
          <EditorialSectionHeader
            eyebrow={t("topEyebrow")}
            title={t("topTitle", { n: data.topAnime.length })}
          />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {data.topAnime.map((anime, idx) => (
              <Link
                key={anime.animeId}
                href={`/anime/${anime.slug}`}
                className="group relative block focus-visible:outline-none"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-3 -top-4 z-10 font-display text-7xl font-bold tracking-[-0.04em] leading-none"
                  style={{ color: "var(--color-accent)", opacity: 0.15 }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {anime.coverUrl ? (
                  <div className="relative z-0 mb-3 aspect-3/4 overflow-hidden rounded-xl border border-border-subtle">
                    <Image src={anime.coverUrl} alt="" fill sizes="160px" className="object-cover" />
                  </div>
                ) : (
                  <div
                    aria-hidden
                    className="relative z-0 mb-3 aspect-3/4 overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated"
                    style={{
                      background: `linear-gradient(160deg, color-mix(in srgb, var(--color-accent) ${20 + idx * 5}%, transparent), var(--color-bg-elevated))`,
                    }}
                  />
                )}
                <p className="m-0 mb-1 font-display text-base font-semibold leading-tight text-text-primary group-hover:text-accent">
                  {anime.title}
                </p>
                {anime.rating != null && (
                  <p
                    className="m-0 font-mono text-xs"
                    style={{ color: "var(--color-accent)" }}
                  >
                    ★ {anime.rating}/10
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Genres + Studios */}
      {(data.genres.length > 0 || data.studios.length > 0) && (
        <section className="mt-20">
          <EditorialSectionHeader eyebrow={t("prefsEyebrow")} title={t("prefsTitle")} />
          <div className="grid grid-cols-1 gap-12 rounded-2xl border border-border-subtle bg-bg-surface p-8 lg:grid-cols-2">
            <div>
              <p className="m-0 mb-5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
                {t("genresLabel")}
              </p>
              {data.genres.map((g, i) => {
                const pct =
                  data.completedCount > 0 ? Math.round((g.count / data.completedCount) * 100) : 0;
                return (
                  <div key={g.name} className={i === data.genres.length - 1 ? "" : "mb-4"}>
                    <div className="mb-1.5 flex items-baseline">
                      <span className="font-body text-sm font-medium text-text-primary">
                        {g.name}
                      </span>
                      <div className="flex-1" />
                      <span className="font-mono text-[11px] text-text-tertiary">{g.count}</span>
                      <span className="w-2" />
                      <span className="w-8 text-right font-mono text-[11px] font-medium text-text-secondary">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1 rounded-xs bg-bg-elevated">
                      <div
                        className="h-full rounded-xs"
                        style={{
                          width: `${Math.min(100, pct)}%`,
                          backgroundColor:
                            i === 0
                              ? "var(--color-accent)"
                              : "color-mix(in srgb, var(--color-accent) 40%, transparent)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="m-0 mb-5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
                {t("studiosLabel")}
              </p>
              {data.studios.length > 0 ? (
                data.studios.map((s, idx) => (
                  <div key={s.name} className="mb-3 flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `color-mix(in srgb, var(--color-accent) ${(1 - idx * 0.18) * 100}%, transparent)`,
                      }}
                    />
                    <span className="flex-1 font-body text-sm text-text-primary">{s.name}</span>
                    <span className="font-mono text-[11px] text-text-tertiary">
                      {s.count > 1
                        ? t("studioTitleCountPlural", { count: s.count })
                        : t("studioTitleCount", { count: s.count })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="m-0 font-mono text-xs text-text-tertiary">—</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Closing */}
      <section className="mt-20 border-t border-border-subtle px-6 py-12 text-center">
        <p className="m-0 mb-4 font-body text-sm text-text-tertiary">
          {t("closingThanks", { year })}
        </p>
        <p className="mx-auto m-0 max-w-140 font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary">
          {t("closingPrefix")}{" "}
          <span style={{ color: "var(--color-accent)" }}>
            {t("closingAccent", { year: year + 1 })}
          </span>
          .
        </p>
      </section>
    </main>
  );
}

async function EmptyYear({ year }: { year: number }) {
  const t = await getTranslations("yearInReview");
  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-20 text-center">
      <p
        className="m-0 mb-6 font-mono text-xs uppercase tracking-[0.3em]"
        style={{ color: "var(--color-accent)" }}
      >
        {t("heroEyebrow")}
      </p>
      <h1 className="m-0 mb-6 font-display font-bold leading-[0.9] tracking-[-0.04em] text-text-primary text-[120px] sm:text-[160px]">
        {year}
      </h1>
      <p className="mx-auto m-0 mb-8 max-w-160 font-body text-lg leading-snug text-text-secondary text-pretty">
        {t("emptyDescription", { year })}
      </p>
      <Link
        href="/watchlist"
        className="inline-flex h-11 items-center rounded-md px-5 font-body text-sm font-semibold"
        style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
      >
        {t("emptyCta")}
      </Link>
    </main>
  );
}

type T = (key: string, values?: Record<string, string | number>) => string;

function computeYoY(current: number, previous: number, t: T): string | null {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const lastYear = new Date().getFullYear() - 1;
  if (pct === 0) return t("yoyEqual");
  if (pct > 0) return t("yoyPositive", { pct, year: lastYear });
  return t("yoyNegative", { pct, year: lastYear });
}
