import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { StatCard } from "@miru/ui";
import { fetchUserLifetimeStats } from "@/lib/server-lifetime-stats";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("lifetimePage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function LifetimeStatsPage() {
  const [data, t, locale] = await Promise.all([
    fetchUserLifetimeStats(),
    getTranslations("lifetimePage"),
    getLocale(),
  ]);
  if (!data) redirect("/login?next=/lifetime-stats");

  const { stats, joinedAt } = data;
  const joinedLabel = joinedAt ? formatMonthYear(joinedAt, locale) : null;
  const firstAddedLabel = stats.firstAddedAt ? formatFullDate(stats.firstAddedAt, locale) : null;

  const streakValue =
    stats.currentStreakDays > 0
      ? stats.currentStreakDays > 1
        ? t("streakDays", { n: stats.currentStreakDays })
        : t("streakDay", { n: stats.currentStreakDays })
      : "—";

  const streakRecord =
    stats.longestStreakDays > 0
      ? stats.longestStreakDays > 1
        ? t("streakRecordPlural", { n: stats.longestStreakDays })
        : t("streakRecord", { n: stats.longestStreakDays })
      : undefined;

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t("eyebrow")}
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          {t("title")}
        </h1>
        {joinedLabel && (
          <p className="m-0 mt-2 font-body text-sm text-text-secondary">
            {t("joinedLine", { month: joinedLabel })}
          </p>
        )}
      </header>

      <section className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label={t("completedLabel")}
          value={stats.completedCount.toLocaleString(locale)}
          sub={joinedLabel ? t("completedSub", { month: joinedLabel }) : undefined}
        />
        <StatCard
          label={t("hoursLabel")}
          value={stats.hoursWatched.toLocaleString(locale)}
          sub={
            stats.hoursWatched > 0
              ? t("hoursSub", { days: Math.round(stats.hoursWatched / 24).toLocaleString(locale) })
              : undefined
          }
        />
        <StatCard label={t("moviesLabel")} value={stats.moviesCount.toLocaleString(locale)} />
        <StatCard
          label={t("reviewsLabel")}
          value={stats.reviewCount.toLocaleString(locale)}
          tone="accent"
          sub={
            stats.reviewAverageRating != null
              ? t("reviewsSub", { avg: stats.reviewAverageRating.toFixed(1) })
              : undefined
          }
        />
        <StatCard
          label={t("watchlistLabel")}
          value={stats.watchlistTotal.toLocaleString(locale)}
          sub={t("watchlistSub", { planned: stats.watchlistPlanned.toLocaleString(locale) })}
        />
        <StatCard
          label={t("streakLabel")}
          value={streakValue}
          tone={stats.currentStreakDays >= 7 ? "accent" : "default"}
          sub={streakRecord}
        />
        {stats.topGenre && (
          <StatCard
            label={t("topGenreLabel")}
            value={stats.topGenre.name}
            sub={
              stats.completedCount > 0
                ? t("topGenreSub", {
                    pct: Math.round((stats.topGenre.count / stats.completedCount) * 100),
                  })
                : undefined
            }
          />
        )}
        {stats.topStudio && (
          <StatCard
            label={t("topStudioLabel")}
            value={stats.topStudio.name}
            sub={
              stats.topStudio.count > 1
                ? t("topStudioSubPlural", { n: stats.topStudio.count })
                : t("topStudioSub", { n: stats.topStudio.count })
            }
          />
        )}
      </section>

      {firstAddedLabel && (
        <section>
          <h2 className="m-0 mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            {t("firstStepsHeading")}
          </h2>
          <article className="rounded-xl border border-border-subtle bg-bg-surface p-4">
            <p className="m-0 mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
              {t("firstAddedLabel")}
            </p>
            <p className="m-0 font-display text-base font-semibold text-text-primary">
              {firstAddedLabel}
            </p>
          </article>
        </section>
      )}

      {stats.completedCount === 0 && (
        <div className="mt-8 rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">{t("emptyCompleted")}</p>
        </div>
      )}
    </main>
  );
}

function formatMonthYear(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { month: "long", year: "numeric" });
}

function formatFullDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
