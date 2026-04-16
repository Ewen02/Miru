import Link from "next/link";
import { AnimeCard, CatalogToolbar, Pagination } from "@miru/ui";
import { fetchAnimeCatalog, fetchGenres, type CatalogFilters } from "@/lib/api";

interface CatalogPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    format?: string;
    year?: string;
    genres?: string | string[];
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

function parseFilters(sp: Awaited<CatalogPageProps["searchParams"]>): CatalogFilters {
  const genres = sp.genres ? (Array.isArray(sp.genres) ? sp.genres : [sp.genres]) : undefined;
  const year = sp.year ? Number(sp.year) : undefined;
  const page = sp.page ? Math.max(1, Number(sp.page)) : 1;
  return {
    search: sp.search?.trim() || undefined,
    status: sp.status || undefined,
    format: sp.format || undefined,
    year: Number.isFinite(year) ? year : undefined,
    genres: genres?.filter(Boolean),
    page,
    pageSize: PAGE_SIZE,
  };
}

function buildPageHref(sp: Awaited<CatalogPageProps["searchParams"]>, targetPage: number): string {
  const params = new URLSearchParams();
  if (sp.search) params.set("search", sp.search);
  if (sp.status) params.set("status", sp.status);
  if (sp.format) params.set("format", sp.format);
  if (sp.year) params.set("year", sp.year);
  if (sp.genres) {
    const list = Array.isArray(sp.genres) ? sp.genres : [sp.genres];
    for (const g of list) params.append("genres", g);
  }
  if (targetPage > 1) params.set("page", String(targetPage));
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const [catalog, genres] = await Promise.all([
    fetchAnimeCatalog(filters).catch((err) => {
      console.error(err);
      return null;
    }),
    fetchGenres().catch(() => []),
  ]);

  const totalPages = catalog ? Math.max(1, Math.ceil(catalog.total / PAGE_SIZE)) : 1;

  return (
    <main className="mx-auto max-w-300 px-6 py-14">
      <header className="mb-10">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Catalogue
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Explorer
        </h1>
        <p className="mt-3 max-w-prose font-body text-text-secondary">
          Les animes importés depuis AniList.
        </p>
      </header>

      <div className="mb-10">
        <CatalogToolbar availableGenres={genres} resultCount={catalog?.total ?? 0} />
      </div>

      {catalog === null ? (
        <EmptyState message="Impossible de joindre l'API. Est-elle démarrée sur le port 3001 ?" />
      ) : catalog.data.length === 0 ? (
        <EmptyState message="Aucun anime ne correspond à ces critères." />
      ) : (
        <>
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

          <div className="mt-10">
            <Pagination
              currentPage={filters.page ?? 1}
              totalPages={totalPages}
              makeHref={(page) => buildPageHref(sp, page)}
            />
          </div>
        </>
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
