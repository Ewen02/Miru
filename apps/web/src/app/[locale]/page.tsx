import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  AnimeCard,
  CatalogTemplate,
  CatalogToolbar,
  ContinueCard,
  HomeHero,
  HorizontalSlider,
  Pagination,
  type HomeHeroSlide,
} from "@miru/ui";
import { fetchAnimeCatalog, fetchAnimeDetail, fetchGenres, type CatalogFilters } from "@/lib/api";
import { fetchLists } from "@/lib/server-lists";
import { fetchUserWatchlist } from "@/lib/server-watchlist";
import { fetchUserLifetimeStats } from "@/lib/server-lifetime-stats";
import { fetchRecommendations } from "@/lib/server-recommendations";
import { fetchOnboardingSnapshot } from "@/lib/server-onboarding";
import { fetchMe } from "@/lib/server-me";
import { getServerSession } from "@/lib/server-auth";
import { HomeBanners } from "@/components/home-banners";
import { currentSeasonLabel } from "@/lib/dates";
import type { AnimeCard as AnimeCardDTO, WatchlistItem } from "@miru/types";
import { Landing } from "./landing";

interface CatalogPageProps {
  params: Promise<{ locale: string }>;
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

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const isFiltered = hasActiveFilters(sp);

  // Critical path — needed for LCP (catalog grid + hero). Block on these.
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

  // Anonymous visitors with no active filter see the landing page instead of
  // the catalog grid. Filters/search keep working — useful for shared links.
  if (!session && !isFiltered) {
    const [featuredAnime, featuredLists] = await Promise.all([
      fetchAnimeCatalog({ pageSize: 6 })
        .then((res) => res?.data ?? [])
        .catch(() => []),
      fetchLists("public").catch(() => []),
    ]);
    return <Landing featuredAnime={featuredAnime} featuredLists={featuredLists} />;
  }

  const totalPages = catalog ? Math.max(1, Math.ceil(catalog.total / PAGE_SIZE)) : 1;

  return (
    <>
      {/* New-user nudges streamed independently — never blocks LCP. */}
      {session && (
        <Suspense fallback={null}>
          <NewUserBanners />
        </Suspense>
      )}

      {/* Editorial top — only when no filters are active (search is dedicated mode).
          Suspense streams it independently so the catalog grid below renders as
          soon as `catalog` resolves — hero hydrates a few hundred ms later. */}
      {!isFiltered && trending && trending.data.length > 0 && (
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection trending={trending.data} sessioned={session !== null} />
        </Suspense>
      )}

      {/* WEBPERF-07: each lower section streams independently so a slow
          recommendations query never blocks the catalog grid LCP. */}
      {!isFiltered && session && (
        <Suspense fallback={null}>
          <ContinueWatchingSection />
        </Suspense>
      )}

      {!isFiltered && session && (
        <Suspense fallback={null}>
          <ForYouSection />
        </Suspense>
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

      <CatalogTemplate
        eyebrow={isFiltered ? "Résultats filtrés" : "Tout explorer"}
        title={isFiltered ? "Catalogue" : "Explorer le catalogue"}
        totalCount={!isFiltered ? catalog?.total ?? null : null}
        toolbar={<CatalogToolbar availableGenres={genres} resultCount={catalog?.total ?? 0} />}
        grid={
          catalog === null ? (
            <EmptyState message="Impossible de joindre l'API. Est-elle démarrée sur le port 3001 ?" />
          ) : catalog.data.length === 0 ? (
            <EmptyState message="Aucun anime ne correspond à ces critères." />
          ) : (
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
          )
        }
        pagination={
          catalog && catalog.data.length > 0 ? (
            <Pagination
              currentPage={filters.page ?? 1}
              totalPages={totalPages}
              makeHref={(page) => buildPageHref(sp, page)}
            />
          ) : null
        }
      />
    </>
  );
}

// --- Streamed sections (each lives behind its own Suspense boundary) -------

async function NewUserBanners() {
  // Parallel-fetch the two signals the client banners need. Both wrapped
  // in React.cache(), so subsequent server-component callers in the same
  // render hit the dedup'd promise rather than the network.
  const [snapshot, me] = await Promise.all([fetchOnboardingSnapshot(), fetchMe()]);
  if (!snapshot && !me) return null;
  return <HomeBanners snapshot={snapshot} emailVerified={me?.emailVerified ?? true} />;
}

async function HeroSection({
  trending,
  sessioned,
}: {
  trending: AnimeCardDTO[];
  sessioned: boolean;
}) {
  const heroSlides: HomeHeroSlide[] = await Promise.all(
    trending.slice(0, HERO_SLIDES).map(async (card, idx) => {
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
  );
  if (heroSlides.length === 0) return null;
  return <HomeHero slides={heroSlides} showWatchlistCta={sessioned} />;
}

function HeroSkeleton() {
  return <div className="h-130 w-full animate-pulse bg-bg-elevated" />;
}

async function ContinueWatchingSection() {
  const items: WatchlistItem[] = await fetchUserWatchlist("WATCHING").catch(() => []);
  if (items.length === 0) return null;
  return (
    <div className="mx-auto mt-16 max-w-300">
      <HorizontalSlider
        eyebrow="Reprendre"
        title="Continue à regarder"
        count={items.length}
        action={{ label: "Voir tout", href: "/watchlist" }}
      >
        {items.slice(0, 12).map((item) => (
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
  );
}

async function ForYouSection() {
  const [recos, lifetime] = await Promise.all([
    fetchRecommendations(8).catch(() => null),
    fetchUserLifetimeStats().catch(() => null),
  ]);
  const recommendations = recos ?? [];
  if (recommendations.length === 0) return null;
  const topGenreLabel = lifetime?.stats.topGenre?.name ?? null;
  return (
    <div className="mx-auto mt-16 max-w-300">
      <HorizontalSlider
        eyebrow={
          topGenreLabel
            ? `Tu regardes du ${topGenreLabel.toLowerCase()}`
            : "Calibré sur ta watchlist"
        }
        title="Pour toi"
        count={recommendations.length}
        action={{ label: "Voir tout", href: "/for-you" }}
      >
        {recommendations.map((anime) => (
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
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
      <p className="font-body text-text-secondary">{message}</p>
    </div>
  );
}
