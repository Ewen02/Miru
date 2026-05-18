import Link from "next/link";
import { redirect } from "next/navigation";
import { AnimeCard, Logo } from "@miru/ui";
import { WatchStatus, type WatchStatus as WatchStatusType, type WatchlistItem } from "@miru/types";
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

function isWatchStatus(value: string | undefined): value is WatchStatusType {
  return value !== undefined && (STATUS_ORDER as string[]).includes(value);
}

export default async function WatchlistPage({ searchParams }: WatchlistPageProps) {
  const session = await getServerSession();
  if (!session) redirect("/login?next=/watchlist");

  const sp = await searchParams;
  const activeStatus = isWatchStatus(sp.status) ? sp.status : WatchStatus.WATCHING;

  const items = await fetchUserWatchlist(activeStatus);
  const totalAll = await countAllStatuses();

  return (
    <main className="mx-auto max-w-300 px-6 py-14">
      <Link
        href="/"
        aria-label="Accueil Miru"
        className="mb-10 inline-flex shrink-0 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        <Logo size={20} />
      </Link>

      <header className="mb-10">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Watchlist
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          {session.user.name}
        </h1>
      </header>

      <nav className="mb-10 flex flex-wrap gap-1.5" aria-label="Filtrer par statut">
        {STATUS_ORDER.map((status) => {
          const active = status === activeStatus;
          const count = totalAll.get(status) ?? 0;
          return (
            <Link
              key={status}
              href={status === WatchStatus.WATCHING ? "/watchlist" : `/watchlist?status=${status}`}
              className={[
                "rounded-md px-3 py-1.5 font-body text-xs transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                active
                  ? "bg-accent-muted text-accent"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              ].join(" ")}
            >
              {STATUS_LABELS[status]}
              <span className="ml-1.5 font-mono text-[10px] text-text-tertiary">{count}</span>
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <EmptyState status={activeStatus} />
      ) : (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <WatchlistCard key={item.animeId} item={item} />
          ))}
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

function WatchlistCard({ item }: { item: WatchlistItem }) {
  const totalEpisodes = item.anime.episodeCount;
  const progressLabel =
    totalEpisodes != null && totalEpisodes > 0
      ? `Ép. ${item.currentEpisode} / ${totalEpisodes}`
      : `Ép. ${item.currentEpisode}`;

  return (
    <Link
      href={`/anime/${item.anime.slug}`}
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      <AnimeCard
        title={item.anime.title}
        coverUrl={item.anime.coverUrl}
        studioName={progressLabel}
        year={null}
        rating={item.rating}
      />
    </Link>
  );
}

function EmptyState({ status }: { status: WatchStatusType }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
      <p className="font-body text-text-secondary">
        Aucun anime en « {STATUS_LABELS[status]} » pour l&apos;instant.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-accent transition-colors duration-200 hover:text-text-primary"
      >
        ← Catalogue
      </Link>
    </div>
  );
}
