import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AnimeCard, EditorialHero } from "@miru/ui";
import { fetchRecommendations } from "@/lib/server-recommendations";
import { fetchUserLifetimeStats } from "@/lib/server-lifetime-stats";

export const metadata: Metadata = {
  title: "Pour toi",
  description:
    "Des recommandations calibrées sur ton historique : genres dominants, studios récurrents, en évitant ce que tu as déjà vu.",
};

export default async function ForYouPage() {
  const [recommendations, lifetime] = await Promise.all([
    fetchRecommendations(24),
    fetchUserLifetimeStats(),
  ]);

  if (recommendations === null) {
    redirect("/login?next=/for-you");
  }

  const topGenre = lifetime?.stats.topGenre ?? null;
  const topStudio = lifetime?.stats.topStudio ?? null;

  return (
    <>
      <EditorialHero
        decorative
        breadcrumbs={[{ href: "/", label: "Accueil" }]}
        eyebrow="Recommandations"
        title="Pour toi"
        description={buildDescription(topGenre?.name ?? null, topStudio?.name ?? null)}
        aside={
          <>
            <StatBlock
              label="Genre dominant"
              value={topGenre ? topGenre.name : "—"}
            />
            <StatBlock
              label="Studio favori"
              value={topStudio ? topStudio.name : "—"}
            />
            <StatBlock label="Suggestions" value={String(recommendations.length)} />
          </>
        }
      />

      <main className="mx-auto max-w-300 px-7 pb-20 pt-10">
        <header className="mb-6 flex items-baseline justify-between">
          <h2 className="m-0 flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.22em] text-text-secondary">
            <span
              aria-hidden
              className="inline-block h-0.5 w-6 rounded-sm"
              style={{ backgroundColor: "var(--color-accent)" }}
            />
            Sélection personnalisée
          </h2>
          <span className="font-mono text-[11px] text-text-tertiary">
            {recommendations.length.toLocaleString("fr-FR")} titres
          </span>
        </header>

        {recommendations.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="font-body text-text-secondary">
              Marque quelques anime comme “Regardé” ou “En cours” pour qu'on apprenne
              tes goûts. Tu peux commencer par le{" "}
              <Link href="/" className="underline hover:text-text-primary">
                catalogue
              </Link>
              .
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {recommendations.map((anime) => (
              <Link
                key={anime.id}
                href={`/anime/${anime.slug}`}
                className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              >
                <AnimeCard
                  title={anime.title}
                  coverUrl={anime.coverUrl}
                  studioName={anime.studioName}
                  year={anime.year}
                  rating={anime.averageRating}
                />
              </Link>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

function buildDescription(topGenre: string | null, topStudio: string | null): string {
  if (topGenre && topStudio) {
    return `Calibré sur ton goût pour ${topGenre.toLowerCase()} et les productions ${topStudio}. On exclut ce que tu as déjà ajouté à ta watchlist.`;
  }
  if (topGenre) {
    return `Calibré sur ton goût pour ${topGenre.toLowerCase()}. On exclut ce que tu as déjà ajouté à ta watchlist.`;
  }
  return "Plus tu ajoutes d'anime à ta watchlist, plus les suggestions deviennent précises.";
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="m-0 mb-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
        {label}
      </p>
      <p className="m-0 font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary">
        {value}
      </p>
    </div>
  );
}
