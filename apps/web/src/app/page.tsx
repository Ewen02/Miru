import Link from "next/link";
import {
  AnimeCard,
  CatalogToolbar,
  ContinueCard,
  HomeHero,
  HorizontalSlider,
  Pagination,
  type HomeHeroSlide,
} from "@miru/ui";
import { fetchAnimeCatalog, fetchAnimeDetail, fetchGenres, type CatalogFilters } from "@/lib/api";
import { fetchUserWatchlist } from "@/lib/server-watchlist";
import { getServerSession } from "@/lib/server-auth";
import type { WatchlistItem } from "@miru/types";

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
const HERO_SLIDES = 4;
const TRENDING_SLIDER = 8;

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

function hasActiveFilters(sp: Awaited<CatalogPageProps["searchParams"]>): boolean {
  return Boolean(sp.search || sp.status || sp.format || sp.year || sp.genres);
}

function truncate(text: string | null, max: number): string {
  if (!text) return "";
  const clean = text.replace(/<[^>]+>/g, "").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const isFiltered = hasActiveFilters(sp);

  const [catalog, genres, trending, session] = await Promise.all([
    fetchAnimeCatalog(filters).catch((err) => {
      if (process.env.NODE_ENV !== "production") console.error(err);
      return null;
    }),
    fetchGenres().catch(() => []),
    isFiltered
      ? Promise.resolve(null)
      : fetchAnimeCatalog({ status: "AIRING", pageSize: TRENDING_SLIDER }).catch(() => null),
    getServerSession(),
  ]);

  // Hero needs full detail (synopsis) for the top picks. Fetch in parallel.
  const heroSlides: HomeHeroSlide[] = trending
    ? await Promise.all(
        trending.data.slice(0, HERO_SLIDES).map(async (card, idx) => {
          const detail = await fetchAnimeDetail(card.slug).catch(() => null);
          return {
            slug: card.slug,
            title: card.title,
            pitch: truncate(detail?.synopsis ?? null, 220) || "À découvrir cette saison.",
            bannerUrl: detail?.bannerUrl ?? null,
            coverUrl: card.coverUrl,
            accentHex: card.accentHex,
            rating: card.averageRating,
            year: card.year,
            format: card.format,
            studio: card.studioName,
            rank: idx + 1,
          };
        }),
      )
    : [];

  const watchlistContinue: WatchlistItem[] = session
    ? await fetchUserWatchlist("WATCHING").catch(() => [])
    : [];

  const totalPages = catalog ? Math.max(1, Math.ceil(catalog.total / PAGE_SIZE)) : 1;

  return (
    <>
      {/* Editorial top — only when no filters are active (search is dedicated mode). */}
      {!isFiltered && heroSlides.length > 0 && (
        <HomeHero slides={heroSlides} showWatchlistCta={session !== null} />
      )}

      {!isFiltered && watchlistContinue.length > 0 && (
        <div className="mx-auto mt-16 max-w-300">
          <HorizontalSlider
            eyebrow="Reprendre"
            title="Continue à regarder"
            count={watchlistContinue.length}
            action={{ label: "Voir tout", href: "/watchlist" }}
          >
            {watchlistContinue.slice(0, 12).map((item) => (
              <ContinueCard
                key={item.animeId}
                slug={item.anime.slug}
                title={item.anime.title}
                coverUrl={item.anime.coverUrl}
                episodesWatched={item.currentEpisode}
                episodesTotal={item.anime.episodeCount}
                nextLabel={
                  item.anime.episodeCount && item.currentEpisode < item.anime.episodeCount
                    ? `Reprendre ép. ${item.currentEpisode + 1}`
                    : null
                }
              />
            ))}
          </HorizontalSlider>
        </div>
      )}

      {!isFiltered && trending && trending.data.length > 0 && (
        <div className="mx-auto mt-16 max-w-300">
          <HorizontalSlider
            eyebrow={`Saison ${currentSeasonLabel()}`}
            title="Tendances cette saison"
            count={trending.data.length}
            action={{ label: "Voir tout", href: "/?status=AIRING" }}
          >
            {trending.data.map((anime) => (
              <Link
                key={anime.id}
                href={`/anime/${anime.slug}`}
                className="w-44 shrink-0 snap-start rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
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
          </HorizontalSlider>
        </div>
      )}

      {/* Catalog grid — always present, the "explore everything" section. */}
      <main className="mx-auto mt-20 max-w-300 px-7 pb-20">
        {!isFiltered && (
          <header className="mb-8">
            <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
              Tout explorer
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Explorer le catalogue
              {catalog?.total != null && (
                <span className="ml-3 font-mono text-base text-text-tertiary">
                  {catalog.total}
                </span>
              )}
            </h2>
          </header>
        )}

        {isFiltered && (
          <header className="mb-8">
            <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
              Résultats filtrés
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Catalogue
            </h1>
          </header>
        )}

        <div className="mb-8">
          <CatalogToolbar availableGenres={genres} resultCount={catalog?.total ?? 0} />
        </div>

        {catalog === null ? (
          <EmptyState message="Impossible de joindre l'API. Est-elle démarrée sur le port 3001 ?" />
        ) : catalog.data.length === 0 ? (
          <EmptyState message="Aucun anime ne correspond à ces critères." />
        ) : (
          <>
            <section className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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

            <div className="mt-12">
              <Pagination
                currentPage={filters.page ?? 1}
                totalPages={totalPages}
                makeHref={(page) => buildPageHref(sp, page)}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
      <p className="font-body text-text-secondary">{message}</p>
    </div>
  );
}

/**
 * Human-readable label for the current anime season, FR. AniList buckets:
 * WINTER Jan-Mar, SPRING Apr-Jun, SUMMER Jul-Sep, FALL Oct-Dec.
 */
function currentSeasonLabel(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const seasons = ["hiver", "printemps", "été", "automne"];
  // Map month (0-11) → bucket index: 0,1,2 → 0 (winter); 3,4,5 → 1; …
  const name = seasons[Math.floor(month / 3)];
  return `${name} ${year}`;
}
