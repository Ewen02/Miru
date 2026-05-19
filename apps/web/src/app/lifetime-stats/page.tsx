import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { StatCard } from "@miru/ui";
import { fetchUserLifetimeStats } from "@/lib/server-lifetime-stats";

export const metadata: Metadata = {
  title: "Stats lifetime",
  description: "Tes stats depuis le premier jour sur Miru.",
};

export default async function LifetimeStatsPage() {
  const data = await fetchUserLifetimeStats();
  if (!data) redirect("/login?next=/lifetime-stats");

  const { stats, joinedAt } = data;
  const joinedLabel = joinedAt ? formatMonthYear(joinedAt) : null;
  const firstAddedLabel = stats.firstAddedAt ? formatFullDate(stats.firstAddedAt) : null;

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Toute ma vie
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Stats lifetime
        </h1>
        {joinedLabel && (
          <p className="m-0 mt-2 font-body text-sm text-text-secondary">
            Tout ce que tu as fait sur Miru depuis ton inscription en {joinedLabel}.
          </p>
        )}
      </header>

      <section className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Anime terminés"
          value={stats.completedCount.toLocaleString("fr-FR")}
          sub={joinedLabel ? `depuis ${joinedLabel}` : undefined}
        />
        <StatCard
          label="Heures regardées"
          value={stats.hoursWatched.toLocaleString("fr-FR")}
          sub={
            stats.hoursWatched > 0
              ? `≈ ${Math.round(stats.hoursWatched / 24).toLocaleString("fr-FR")} jours`
              : undefined
          }
        />
        <StatCard label="Films" value={stats.moviesCount.toLocaleString("fr-FR")} />
        <StatCard
          label="Avis publiés"
          value={stats.reviewCount.toLocaleString("fr-FR")}
          tone="accent"
          sub={
            stats.reviewAverageRating != null
              ? `Note moy. ${stats.reviewAverageRating.toFixed(1)}/10`
              : undefined
          }
        />
        <StatCard
          label="Watchlist totale"
          value={stats.watchlistTotal.toLocaleString("fr-FR")}
          sub={`dont ${stats.watchlistPlanned.toLocaleString("fr-FR")} à voir`}
        />
        {stats.topGenre && (
          <StatCard
            label="Genre le plus regardé"
            value={stats.topGenre.name}
            sub={
              stats.completedCount > 0
                ? `${Math.round((stats.topGenre.count / stats.completedCount) * 100)} % des titres`
                : undefined
            }
          />
        )}
        {stats.topStudio && (
          <StatCard
            label="Studio préféré"
            value={stats.topStudio.name}
            sub={`${stats.topStudio.count} titre${stats.topStudio.count > 1 ? "s" : ""}`}
          />
        )}
      </section>

      {firstAddedLabel && (
        <section>
          <h2 className="m-0 mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Premier pas
          </h2>
          <article className="rounded-xl border border-border-subtle bg-bg-surface p-4">
            <p className="m-0 mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
              Premier anime ajouté à la watchlist
            </p>
            <p className="m-0 font-display text-base font-semibold text-text-primary">
              {firstAddedLabel}
            </p>
          </article>
        </section>
      )}

      {stats.completedCount === 0 && (
        <div className="mt-8 rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">
            Tu n'as pas encore d'anime marqué comme terminé. Reviens ici quand tu en as quelques-uns dans la liste.
          </p>
        </div>
      )}
    </main>
  );
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
