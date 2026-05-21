import Link from "next/link";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { AnimeCard as AnimeCardDTO } from "@miru/types";
import { AnimeCard, Pagination } from "@miru/ui";
import { fetchAnimeCatalog } from "@/lib/api";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PAGE_SIZE = 24;

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const t = await getTranslations("searchPage");
  return {
    title: q ? t("metaTitleQuery", { q }) : t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [sp, t, locale] = await Promise.all([
    searchParams,
    getTranslations("searchPage"),
    getLocale(),
  ]);
  const query = sp.q?.trim() ?? "";
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const [catalog, suggestions] = await Promise.all([
    query.length > 0
      ? fetchAnimeCatalog({ search: query, page, pageSize: PAGE_SIZE }).catch(() => null)
      : Promise.resolve(null),
    query.length === 0
      ? fetchAnimeCatalog({ pageSize: 8 }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const total = catalog?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const resultsLabel =
    total > 1
      ? t("resultsCountPlural", { total: total.toLocaleString(locale) })
      : t("resultsCount", { total: total.toLocaleString(locale) });

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t("eyebrow")}
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          {query ? `« ${query} »` : t("promptTitle")}
        </h1>
        {query.length > 0 && (
          <p className="m-0 mt-2 font-body text-sm text-text-secondary">{resultsLabel}</p>
        )}
      </header>

      <form action="/search" method="get" className="mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={t("placeholder")}
            className="h-12 flex-1 rounded-md border border-border bg-bg-surface px-4 font-body text-base text-text-primary placeholder:text-text-quaternary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            autoFocus
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center rounded-md px-5 font-body text-sm font-semibold"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            {t("submit")}
          </button>
        </div>
        <p className="m-0 mt-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          {t("hint")}
        </p>
      </form>

      {query.length === 0 ? (
        <SuggestionsPanel anime={suggestions?.data ?? []} t={t} />
      ) : catalog === null ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">{t("apiUnreachable")}</p>
        </div>
      ) : catalog.data.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">
            {t("noMatchPre")} <span className="text-text-primary">« {query} »</span>.
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

type T = (key: string, values?: Record<string, string | number>) => string;

function SuggestionsPanel({ anime, t }: { anime: AnimeCardDTO[]; t: T }) {
  if (anime.length === 0) {
    return (
      <section className="rounded-2xl border border-border-subtle bg-bg-surface p-8 text-center">
        <p className="m-0 font-body text-sm text-text-tertiary">{t("promptEmpty")}</p>
      </section>
    );
  }
  return (
    <section>
      <p className="m-0 mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
        {t("topRated")}
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
