import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorialHero } from "@miru/ui";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import { fetchAnimeDetail } from "@/lib/api";
import type { AnimeDetail } from "@miru/types";

interface ComparePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ a?: string; b?: string }>;
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "comparePage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/compare", locale),
  };
}

export default async function ComparePage({ params, searchParams }: ComparePageProps) {
  const [{ locale }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("comparePage"),
  ]);
  setRequestLocale(locale);

  const [a, b] = await Promise.all([
    sp.a ? fetchAnimeDetail(sp.a).catch(() => null) : Promise.resolve(null),
    sp.b ? fetchAnimeDetail(sp.b).catch(() => null) : Promise.resolve(null),
  ]);

  return (
    <>
      <EditorialHero decorative eyebrow={t("eyebrow")} title={t("title")} />
      <main className="mx-auto max-w-300 px-7 pb-20 pt-10">
        {!sp.a || !sp.b ? (
          <EmptyNotice text={t("empty")} />
        ) : !a || !b ? (
          <EmptyNotice text={t("notFound")} />
        ) : (
          <ComparisonView a={a} b={b} t={t} locale={locale} />
        )}
      </main>
    </>
  );
}

function EmptyNotice({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
      <p className="m-0 font-body text-sm text-text-secondary">{text}</p>
    </div>
  );
}

function ComparisonView({
  a,
  b,
  t,
  locale,
}: {
  a: AnimeDetail;
  b: AnimeDetail;
  t: (key: string) => string;
  locale: string;
}) {
  const commonGenres = a.genres.filter((g) => b.genres.includes(g));
  const rows: Array<{ label: string; a: string; b: string }> = [
    { label: t("rowStudio"), a: a.studioName ?? "—", b: b.studioName ?? "—" },
    { label: t("rowYear"), a: a.year ? String(a.year) : "—", b: b.year ? String(b.year) : "—" },
    { label: t("rowFormat"), a: a.format, b: b.format },
    {
      label: t("rowEpisodes"),
      a: a.episodeCount ? String(a.episodeCount) : "—",
      b: b.episodeCount ? String(b.episodeCount) : "—",
    },
    {
      label: t("rowRating"),
      a: a.averageRating != null ? a.averageRating.toFixed(1) : "—",
      b: b.averageRating != null ? b.averageRating.toFixed(1) : "—",
    },
    { label: t("rowStatus"), a: a.status, b: b.status },
  ];

  return (
    <>
      {/* Hero compare: two cover columns split by a VS divider. */}
      <section className="relative mb-10 flex items-stretch overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
        <CompareSide anime={a} />
        <div className="relative w-px bg-border-subtle">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-bg-surface px-3.5 py-1.5 font-mono text-[11px] tracking-[0.18em] text-text-tertiary">
            {t("vs")}
          </span>
        </div>
        <CompareSide anime={b} />
      </section>

      {/* Attribute table */}
      <section className="mb-10 overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
        {rows.map((row, idx) => (
          <div
            key={row.label}
            className={
              idx === rows.length - 1
                ? "grid grid-cols-[1fr_auto_1fr] items-center"
                : "grid grid-cols-[1fr_auto_1fr] items-center border-b border-border-subtle"
            }
          >
            <span className="px-5 py-3.5 text-right font-body text-sm text-text-primary">{row.a}</span>
            <span className="px-4 py-3.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
              {row.label}
            </span>
            <span className="px-5 py-3.5 font-body text-sm text-text-primary">{row.b}</span>
          </div>
        ))}
      </section>

      {/* Common genres */}
      <section>
        <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t("commonGenres")}
        </p>
        {commonGenres.length === 0 ? (
          <p className="m-0 font-body text-sm text-text-secondary">{t("noCommonGenres")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {commonGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-sm border border-accent/35 bg-accent-subtle px-2.5 py-1 font-mono text-[11px] text-accent"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function CompareSide({ anime }: { anime: AnimeDetail }) {
  return (
    <div className="flex-1 px-6 py-8 text-center">
      <Link href={`/anime/${anime.slug}`} className="inline-block">
        <div className="relative mx-auto mb-6 h-70 w-50 overflow-hidden rounded-xl border border-border-subtle">
          {anime.coverUrl ? (
            <Image src={anime.coverUrl} alt={anime.title} fill sizes="200px" className="object-cover" />
          ) : (
            <div className="h-full w-full bg-bg-elevated" />
          )}
        </div>
      </Link>
      <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
        {anime.format} · {anime.year ?? "—"} · {(anime.studioName ?? "—").toUpperCase()}
      </p>
      <h2 className="m-0 mb-4 font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary">
        {anime.title}
      </h2>
      <div className="font-display text-5xl font-semibold leading-none text-accent">
        {anime.averageRating != null ? anime.averageRating.toFixed(1) : "—"}
        <span className="text-xl text-text-tertiary">/10</span>
      </div>
    </div>
  );
}
