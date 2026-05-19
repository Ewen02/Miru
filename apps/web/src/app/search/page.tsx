import Link from "next/link";
import type { Metadata } from "next";
import type { AnimeCard as AnimeCardDTO } from "@miru/types";
import { AnimeCard, Pagination } from "@miru/ui";
import { fetchAnimeCatalog } from "@/lib/api";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PAGE_SIZE = 24;

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Recherche : ${q}` : "Recherche",
    description: "Recherche dans le catalogue Miru.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const [catalog, suggestions] = await Promise.all([
    query.length > 0
      ? fetchAnimeCatalog({ search: query, page, pageSize: PAGE_SIZE }).catch(() => null)
      : Promise.resolve(null),
    // Suggestions: top-rated handful from the catalog. Only computed on the
    // empty-state path — pointless to re-fetch when results are showing.
    query.length === 0
      ? fetchAnimeCatalog({ pageSize: 8 }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const total = catalog?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Recherche
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          {query ? `« ${query} »` : "Que cherches-tu ?"}
        </h1>
        {query.length > 0 && (
          <p className="m-0 mt-2 font-body text-sm text-text-secondary">
            {total.toLocaleString("fr-FR")} résultat{total > 1 ? "s" : ""}
          </p>
        )}
      </header>

      <form action="/search" method="get" className="mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Titre, studio, personnage…"
            className="h-12 flex-1 rounded-md border border-border bg-bg-surface px-4 font-body text-base text-text-primary placeholder:text-text-quaternary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            autoFocus
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center rounded-md px-5 font-body text-sm font-semibold"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            Chercher
          </button>
        </div>
        <p className="m-0 mt-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          Astuce : utilise ⌘K pour ouvrir la palette de recherche rapide.
        </p>
      </form>

      {query.length === 0 ? (
        <SuggestionsPanel anime={suggestions?.data ?? []} />
      ) : catalog === null ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">
            Impossible de joindre l'API.
          </p>
        </div>
      ) : catalog.data.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">
            Aucun anime ne correspond à <span className="text-text-primary">« {query} »</span>.
          </p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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

          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                makeHref={(p) =>
                  p === 1
                    ? `/search?q=${encodeURIComponent(query)}`
                    : `/search?q=${encodeURIComponent(query)}&page=${p}`
                }
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}

function SuggestionsPanel({ anime }: { anime: AnimeCardDTO[] }) {
  if (anime.length === 0) {
    return (
      <section className="rounded-2xl border border-border-subtle bg-bg-surface p-8 text-center">
        <p className="m-0 font-body text-sm text-text-tertiary">
          Saisis une recherche pour explorer le catalogue.
        </p>
      </section>
    );
  }
  return (
    <section>
      <p className="m-0 mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
        Mieux notés ces temps-ci
      </p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {anime.map((a) => (
          <Link
            key={a.id}
            href={`/anime/${a.slug}`}
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <AnimeCard
              title={a.title}
              coverUrl={a.coverUrl}
              studioName={a.studioName}
              year={a.year}
              rating={a.averageRating}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
