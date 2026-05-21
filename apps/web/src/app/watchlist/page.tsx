import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmptyState, WatchlistCard } from "@miru/ui";
import { WatchStatus, type WatchStatus as WatchStatusType } from "@miru/types";
import { fetchUserWatchlist } from "@/lib/server-watchlist";
import { getServerSession } from "@/lib/server-auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("watchlistPage");
  return { title: t("metaTitle") };
}

interface WatchlistPageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_ORDER: WatchStatusType[] = [
  WatchStatus.WATCHING,
  WatchStatus.PLANNED,
  WatchStatus.ON_HOLD,
  WatchStatus.COMPLETED,
  WatchStatus.DROPPED,
];

const STATUS_KEY: Record<WatchStatusType, string> = {
  WATCHING: "statusWatching",
  PLANNED: "statusPlanned",
  ON_HOLD: "statusOnHold",
  COMPLETED: "statusCompleted",
  DROPPED: "statusDropped",
};

const EMPTY_KEY: Record<WatchStatusType, { title: string; desc: string }> = {
  WATCHING: { title: "emptyWatchingTitle", desc: "emptyWatchingDesc" },
  PLANNED: { title: "emptyPlannedTitle", desc: "emptyPlannedDesc" },
  ON_HOLD: { title: "emptyOnHoldTitle", desc: "emptyOnHoldDesc" },
  COMPLETED: { title: "emptyCompletedTitle", desc: "emptyCompletedDesc" },
  DROPPED: { title: "emptyDroppedTitle", desc: "emptyDroppedDesc" },
};

const BADGE_KEY: Record<WatchStatusType, string | null> = {
  WATCHING: null,
  PLANNED: "badgePlanned",
  ON_HOLD: "badgeOnHold",
  COMPLETED: "badgeCompleted",
  DROPPED: "badgeDropped",
};

function isWatchStatus(value: string | undefined): value is WatchStatusType {
  return value !== undefined && (STATUS_ORDER as string[]).includes(value);
}

export default async function WatchlistPage({ searchParams }: WatchlistPageProps) {
  const [session, sp, t] = await Promise.all([
    getServerSession(),
    searchParams,
    getTranslations("watchlistPage"),
  ]);
  if (!session) redirect("/login?next=/watchlist");

  const activeStatus = isWatchStatus(sp.status) ? sp.status : WatchStatus.WATCHING;

  const [items, totalAll] = await Promise.all([
    fetchUserWatchlist(activeStatus),
    countAllStatuses(),
  ]);

  return (
    <main className="mx-auto max-w-300 px-7 py-14">
      <header className="mb-10">
        <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
          {session.user.name}
        </h1>
      </header>

      <nav
        className="mb-10 flex flex-wrap gap-1.5 border-b border-border-subtle pb-1"
        aria-label={t("filterAria")}
      >
        {STATUS_ORDER.map((status) => {
          const active = status === activeStatus;
          const count = totalAll.get(status) ?? 0;
          return (
            <Link
              key={status}
              href={status === WatchStatus.WATCHING ? "/watchlist" : `/watchlist?status=${status}`}
              className={[
                "relative inline-flex items-center gap-2 rounded-md px-3 py-2 font-body text-sm font-medium",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                active
                  ? "text-text-primary"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              ].join(" ")}
            >
              {t(STATUS_KEY[status])}
              <span className="font-mono text-[10px] text-text-tertiary">
                {String(count).padStart(2, "0")}
              </span>
              {active && (
                <span
                  aria-hidden
                  className="absolute right-3 -bottom-1 left-3 h-0.5 rounded-sm"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          title={t(EMPTY_KEY[activeStatus].title)}
          description={t(EMPTY_KEY[activeStatus].desc)}
          primaryAction={{ label: t("discoverCatalog"), href: "/" }}
        />
      ) : (
        <section className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => {
            const watching = item.status === WatchStatus.WATCHING;
            const badgeKey = BADGE_KEY[item.status];
            const badge = watching
              ? item.anime.episodeCount
                ? `ÉP. ${item.currentEpisode}/${item.anime.episodeCount}`
                : `ÉP. ${item.currentEpisode}`
              : badgeKey
                ? t(badgeKey)
                : "";
            return (
              <WatchlistCard
                key={item.animeId}
                slug={item.anime.slug}
                title={item.anime.title}
                coverUrl={item.anime.coverUrl}
                episodesWatched={item.currentEpisode}
                episodesTotal={item.anime.episodeCount}
                rating={item.rating}
                badge={badge}
              />
            );
          })}
        </section>
      )}
    </main>
  );
}

async function countAllStatuses(): Promise<Map<WatchStatusType, number>> {
  const all = await fetchUserWatchlist();
  const counts = new Map<WatchStatusType, number>();
  for (const item of all) {
    counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
  }
  return counts;
}
