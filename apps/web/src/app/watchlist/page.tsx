import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, WatchlistCard } from "@miru/ui";
import { WatchStatus, type WatchStatus as WatchStatusType } from "@miru/types";
import { fetchUserWatchlist } from "@/lib/server-watchlist";
import { getServerSession } from "@/lib/server-auth";

export const metadata = {
  title: "Ma watchlist",
};

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

const STATUS_LABELS: Record<WatchStatusType, string> = {
  WATCHING: "En cours",
  PLANNED: "À voir",
  ON_HOLD: "En pause",
  COMPLETED: "Terminés",
  DROPPED: "Abandonnés",
};

const EMPTY_COPY: Record<WatchStatusType, { title: string; description: string }> = {
  WATCHING: {
    title: "Aucun anime en cours.",
    description: "Trouve un anime qui te plaît et ajoute-le pour suivre tes épisodes ici.",
  },
  PLANNED: {
    title: "Aucun anime prévu.",
    description: "Marque les fiches qui t'intriguent en « À voir » pour les retrouver ici.",
  },
  ON_HOLD: {
    title: "Aucun anime en pause.",
    description: "Quand tu prends une pause sur un anime, il apparaît ici en attendant la suite.",
  },
  COMPLETED: {
    title: "Aucun anime terminé.",
    description: "Tes finis s'affichent ici, prêts à être notés et partagés.",
  },
  DROPPED: {
    title: "Aucun abandon (pour l'instant).",
    description: "Les animes que tu lâches en route atterrissent ici, sans jugement.",
  },
};

function isWatchStatus(value: string | undefined): value is WatchStatusType {
  return value !== undefined && (STATUS_ORDER as string[]).includes(value);
}

export default async function WatchlistPage({ searchParams }: WatchlistPageProps) {
  const session = await getServerSession();
  if (!session) redirect("/login?next=/watchlist");

  const sp = await searchParams;
  const activeStatus = isWatchStatus(sp.status) ? sp.status : WatchStatus.WATCHING;

  const [items, totalAll] = await Promise.all([
    fetchUserWatchlist(activeStatus),
    countAllStatuses(),
  ]);

  return (
    <main className="mx-auto max-w-300 px-7 py-14">
      <header className="mb-10">
        <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
          Watchlist
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
          {session.user.name}
        </h1>
      </header>

      <nav
        className="mb-10 flex flex-wrap gap-1.5 border-b border-border-subtle pb-1"
        aria-label="Filtrer par statut"
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
              {STATUS_LABELS[status]}
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
          title={EMPTY_COPY[activeStatus].title}
          description={EMPTY_COPY[activeStatus].description}
          primaryAction={{ label: "Découvrir le catalogue", href: "/" }}
        />
      ) : (
        <section className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => {
            const watching = item.status === WatchStatus.WATCHING;
            const badge = watching
              ? item.anime.episodeCount
                ? `ÉP. ${item.currentEpisode}/${item.anime.episodeCount}`
                : `ÉP. ${item.currentEpisode}`
              : statusBadge(item.status);
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

function statusBadge(status: WatchStatusType): string {
  switch (status) {
    case WatchStatus.PLANNED:
      return "À VOIR";
    case WatchStatus.ON_HOLD:
      return "EN PAUSE";
    case WatchStatus.COMPLETED:
      return "TERMINÉ";
    case WatchStatus.DROPPED:
      return "ABANDONNÉ";
    default:
      return "";
  }
}
