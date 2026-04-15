import Link from "next/link";
import { AnimeCard } from "@miru/ui";
import { fetchAnimeCatalog } from "@/lib/api";

export default async function CatalogPage() {
  const catalog = await fetchAnimeCatalog({ pageSize: 20 }).catch((err) => {
    console.error(err);
    return null;
  });

  return (
    <main className="mx-auto max-w-300 px-6 py-14">
      <header className="mb-14">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Catalogue
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Explorer
        </h1>
        <p className="mt-3 max-w-prose font-body text-text-secondary">
          Les animes trending, importés depuis AniList.
        </p>
      </header>

      {catalog === null ? (
        <EmptyState message="Impossible de joindre l'API. Est-elle démarrée sur le port 3001 ?" />
      ) : catalog.data.length === 0 ? (
        <EmptyState message="Aucun anime en base. Lance la sync : PAGES=3 PER_PAGE=20 pnpm --filter api sync:trending" />
      ) : (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {catalog.data.map((anime) => (
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
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
      <p className="font-body text-text-secondary">{message}</p>
    </div>
  );
}
