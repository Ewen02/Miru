import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { CalendarEpisode } from "@miru/types";
import { fetchCalendarWeek } from "@/lib/api";
import { addDays, formatDateRange, startOfDay, startOfWeek, timeZoneLabel } from "@/lib/dates";

interface CalendarPageProps {
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendarPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const DAY_KEYS = ["dayMon", "dayTue", "dayWed", "dayThu", "dayFri", "daySat", "daySun"];

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const [sp, t, locale] = await Promise.all([
    searchParams,
    getTranslations("calendarPage"),
    getLocale(),
  ]);
  const monday = startOfWeek(sp.from ? new Date(sp.from) : new Date());
  const sunday = addDays(monday, 7);

  const week = await fetchCalendarWeek(monday, sunday).catch(() => null);
  const episodes = week?.episodes ?? [];

  const byDay = groupByDay(episodes, monday);
  const today = startOfDay(new Date());
  const prevHref = `/calendar?from=${addDays(monday, -7).toISOString()}`;
  const nextHref = `/calendar?from=${addDays(monday, 7).toISOString()}`;
  const todayHref = `/calendar`;

  const now = Date.now();
  const liveEp = episodes.find((e) => {
    const ts = new Date(e.airedAt).getTime();
    return ts > now - 30 * 60 * 1000 && ts < now + 30 * 60 * 1000;
  });

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            {t("eyebrow")}
          </p>
          <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {t("title")}
          </h1>
          <p className="m-0 mt-2 font-body text-sm text-text-secondary">
            {t("rangeTimezone", { range: formatDateRange(monday, sunday), tz: timeZoneLabel() })}
          </p>
        </div>
        <nav className="flex gap-2" aria-label={t("navAria")}>
          <NavButton href={prevHref} label={t("prevWeek")} />
          <NavButton href={todayHref} label={t("today")} primary />
          <NavButton href={nextHref} label={t("nextWeek")} />
        </nav>
      </header>

      {liveEp && <LiveSpotlight episode={liveEp} t={t} locale={locale} />}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
        {byDay.map((day) => {
          const isToday = day.date.getTime() === today.getTime();
          const isPast = day.date.getTime() < today.getTime();
          return (
            <article
              key={day.date.toISOString()}
              className="flex min-h-60 flex-col rounded-2xl border border-border-subtle bg-bg-surface p-4"
              style={{
                opacity: isPast ? 0.6 : 1,
                borderColor: isToday
                  ? "color-mix(in srgb, var(--color-accent) 50%, var(--color-border))"
                  : undefined,
              }}
            >
              <header className="mb-3 flex items-baseline justify-between">
                <div>
                  <p className="m-0 font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
                    {t(DAY_KEYS[day.dow]!)}
                  </p>
                  <p
                    className="m-0 font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary"
                    style={isToday ? { color: "var(--color-accent)" } : undefined}
                  >
                    {day.date.getDate()}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {t("epShort", { n: day.episodes.length })}
                </span>
              </header>
              <div className="flex flex-col gap-2">
                {day.episodes.length === 0 ? (
                  <p className="font-body text-xs text-text-quaternary">—</p>
                ) : (
                  day.episodes.map((e) => (
                    <EpisodeChip key={e.animeId + e.episodeNumber} episode={e} t={t} locale={locale} />
                  ))
                )}
              </div>
            </article>
          );
        })}
      </section>

      {!week && (
        <div className="mt-10 rounded-xl border border-border-subtle bg-bg-surface p-6 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">{t("apiUnreachable")}</p>
        </div>
      )}
    </main>
  );
}

function NavButton({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "inline-flex h-9 items-center rounded-md px-3 font-mono text-xs uppercase tracking-wider"
          : "inline-flex h-9 items-center rounded-md border border-border bg-bg-surface px-3 font-mono text-xs text-text-secondary uppercase tracking-wider transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
      }
      style={primary ? { backgroundColor: "var(--color-accent)", color: "#08080c" } : undefined}
    >
      {label}
    </Link>
  );
}

type T = (key: string, values?: Record<string, string | number>) => string;

function EpisodeChip({
  episode,
  t,
  locale,
}: {
  episode: CalendarEpisode;
  t: T;
  locale: string;
}) {
  const time = new Date(episode.airedAt).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <Link
      href={`/anime/${episode.animeSlug}`}
      className="group flex items-center gap-2 rounded-md border border-border-subtle bg-bg-base px-2 py-1.5 transition-colors duration-150 hover:border-border hover:bg-bg-elevated"
    >
      <span className="font-mono text-[10px] text-text-tertiary">{time}</span>
      <span className="min-w-0 flex-1 truncate font-body text-xs text-text-primary group-hover:text-accent">
        {episode.animeTitle}
      </span>
      <span className="font-mono text-[9px] text-text-quaternary">
        {t("epBadge", { n: episode.episodeNumber })}
      </span>
    </Link>
  );
}

function LiveSpotlight({
  episode,
  t,
  locale,
}: {
  episode: CalendarEpisode;
  t: T;
  locale: string;
}) {
  const time = new Date(episode.airedAt).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <section
      className="mb-8 flex gap-4 rounded-2xl border bg-bg-surface p-5"
      style={{
        borderColor: "color-mix(in srgb, var(--color-accent) 40%, var(--color-border))",
        backgroundColor: "color-mix(in srgb, var(--color-accent) 6%, var(--color-bg-surface))",
      }}
    >
      <Link
        href={`/anime/${episode.animeSlug}`}
        className="relative h-25 w-17 shrink-0 overflow-hidden rounded-lg border border-border-subtle"
      >
        {episode.coverUrl ? (
          <Image src={episode.coverUrl} alt="" fill sizes="68px" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-bg-elevated" />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--color-accent)" }}
        >
          {t("live")}
        </p>
        <Link
          href={`/anime/${episode.animeSlug}`}
          className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary hover:text-accent"
        >
          {episode.animeTitle}
        </Link>
        <p className="m-0 font-mono text-xs text-text-secondary">
          {t("episode", { n: episode.episodeNumber })}
          {episode.episodeCount && (
            <span className="text-text-tertiary"> / {episode.episodeCount}</span>
          )}
          {" · "}
          {time} {timeZoneLabel()}
        </p>
      </div>
    </section>
  );
}

function groupByDay(
  episodes: CalendarEpisode[],
  weekStart: Date,
): Array<{ date: Date; dow: number; episodes: CalendarEpisode[] }> {
  const days = Array.from({ length: 7 }, (_, i) => ({
    date: addDays(weekStart, i),
    dow: i,
    episodes: [] as CalendarEpisode[],
  }));
  for (const e of episodes) {
    const d = new Date(e.airedAt);
    const dow = (d.getDay() + 6) % 7;
    days[dow]?.episodes.push(e);
  }
  return days;
}
