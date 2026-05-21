import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { AnimeCard, EditorialHero, Pagination } from "@miru/ui";
import { fetchGenreDetail } from "@/lib/api";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

const KNOWN_GENRE_SLUGS = new Set([
  "action",
  "adventure",
  "comedy",
  "drama",
  "ecchi",
  "fantasy",
  "horror",
  "mahou-shoujo",
  "mecha",
  "music",
  "mystery",
  "psychological",
  "romance",
  "sci-fi",
  "slice-of-life",
  "sports",
  "supernatural",
  "thriller",
]);

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [detail, t] = await Promise.all([
    fetchGenreDetail(slug).catch(() => null),
    getTranslations("genrePage"),
  ]);
  if (!detail) return { title: t("notFound") };
  return {
    title: detail.name,
    description: t("metaDescription", {
      name: detail.name,
      total: detail.stats.totalAnimes,
    }),
  };
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const [{ slug }, sp, t, locale] = await Promise.all([
    params,
    searchParams,
    getTranslations("genrePage"),
    getLocale(),
  ]);
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const detail = await fetchGenreDetail(slug, { page, pageSize: PAGE_SIZE }).catch(() => null);
  if (!detail) notFound();

  const totalPages = Math.max(1, Math.ceil(detail.animes.total / PAGE_SIZE));
  const description = KNOWN_GENRE_SLUGS.has(detail.slug)
    ? t(detail.slug)
    : t("defaultDescription");

  return (
    <>
      <EditorialHero
        decorative
        breadcrumbs={[{ href: "/", label: t("breadcrumbCatalog") }]}
        eyebrow={t("eyebrow")}
        title={detail.name}
        description={description}
        aside={
          <>
            <StatBlock
              label={t("statTitles")}
              value={detail.stats.totalAnimes.toLocaleString(locale)}
            />
            <StatBlock
              label={t("statThisYear")}
              value={detail.stats.thisYearAnimes.toLocaleString(locale)}
            />
            <StatBlock
              label={t("statAvgRating")}
              value={
                detail.stats.averageRating != null
                  ? detail.stats.averageRating.toFixed(1)
                  : "—"
              }
            />
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
            {t("allOf", { name: detail.name.toLowerCase() })}
          </h2>
          <span className="font-mono text-[11px] text-text-tertiary">
            {t("titlesCount", { total: detail.animes.total.toLocaleString(locale) })}
          </span>
        </header>

        {detail.animes.data.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="font-body text-text-secondary">
              {t("emptyGenre")}
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {detail.animes.data.map((anime) => (
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
                currentPage={page}
                totalPages={totalPages}
                makeHref={(p) => (p === 1 ? `/genre/${slug}` : `/genre/${slug}?page=${p}`)}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
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
