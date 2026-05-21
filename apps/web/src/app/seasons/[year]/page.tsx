import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { AnimeCard, Pagination } from "@miru/ui";
import { fetchAnimeCatalog } from "@/lib/api";

interface SeasonPageProps {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ page?: string; format?: string }>;
}

const PAGE_SIZE = 20;

const FORMAT_KEYS = [
  { key: "ALL", labelKey: "formatAll" },
  { key: "TV", labelKey: null },
  { key: "MOVIE", labelKey: "formatMovie" },
  { key: "OVA", labelKey: "formatOva" },
  { key: "ONA", labelKey: "formatOna" },
  { key: "SPECIAL", labelKey: "formatSpecial" },
] as const;

export async function generateMetadata({ params }: SeasonPageProps): Promise<Metadata> {
  const { year } = await params;
  const t = await getTranslations("seasonsPage");
  return {
    title: t("metaTitle", { year }),
    description: t("metaDescription", { year }),
  };
}

export default async function SeasonPage({ params, searchParams }: SeasonPageProps) {
  const [{ year: yearStr }, sp, t, locale] = await Promise.all([
    params,
    searchParams,
    getTranslations("seasonsPage"),
    getLocale(),
  ]);
  const year = Number(yearStr);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1960 || year > currentYear + 2) notFound();

  const format = sp.format && sp.format !== "ALL" ? sp.format : undefined;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const catalog = await fetchAnimeCatalog({
    year,
    format,
    page,
    pageSize: PAGE_SIZE,
  }).catch(() => null);

  const items = catalog?.data ?? [];
  const total = catalog?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const makeHref = (overrides: { page?: number; format?: string }) => {
    const params = new URLSearchParams();
    const nextFormat = overrides.format ?? sp.format;
    if (nextFormat && nextFormat !== "ALL") params.set("format", nextFormat);
    const nextPage = overrides.page ?? 1;
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/seasons/${year}?${qs}` : `/seasons/${year}`;
  };

  const prevYearHref = `/seasons/${year - 1}`;
  const nextYearHref = `/seasons/${year + 1}`;
  const activeFormat = sp.format ?? "ALL";
  const totalLabel = total.toLocaleString(locale);
  const subtitleKey = total > 1 ? "titlesCountPlural" : "titlesCount";
  const emptyText =
    catalog === null
      ? t("apiUnreachable")
      : format
        ? t("emptyYearWithFormat", { year, format })
        : t("emptyYear", { year });

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            {t("eyebrow")}
          </p>
          <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {year}
          </h1>
          <p className="m-0 mt-2 font-body text-sm text-text-secondary">
            {t(subtitleKey, { total: totalLabel })}
          </p>
        </div>
        <nav className="flex items-center gap-2" aria-label={t("yearNavAria")}>
          <Link
            href={prevYearHref}
            className="inline-flex h-9 items-center rounded-md border border-border bg-bg-surface px-3 font-mono text-xs text-text-secondary uppercase tracking-wider transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
          >
            ‹ {year - 1}
          </Link>
          <span className="font-display text-sm font-semibold text-text-primary">{year}</span>
          {year < currentYear + 2 && (
            <Link
              href={nextYearHref}
              className="inline-flex h-9 items-center rounded-md border border-border bg-bg-surface px-3 font-mono text-xs text-text-secondary uppercase tracking-wider transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
            >
              {year + 1} ›
            </Link>
          )}
        </nav>
      </header>

      {/* Format tabs */}
      <nav
        className="mb-8 flex flex-wrap gap-1 border-b border-border-subtle"
        role="tablist"
        aria-label={t("formatAria")}
      >
        {FORMAT_KEYS.map((tab) => {
          const isActive = activeFormat === tab.key;
          const label = tab.labelKey ? t(tab.labelKey) : tab.key;
          return (
            <Link
              key={tab.key}
              href={makeHref({ format: tab.key, page: 1 })}
              role="tab"
              aria-selected={isActive}
              className="relative inline-flex h-10 items-center rounded-t-md px-4 font-body text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              style={{
                color: isActive
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
              }}
            >
              {label}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -bottom-px left-3 right-3 h-0.5"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">{emptyText}</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((anime) => (
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
              makeHref={(p) => makeHref({ page: p })}
            />
          </div>
        </>
      )}
    </main>
  );
}
