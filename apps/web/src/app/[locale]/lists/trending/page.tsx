import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@miru/ui";
import { Link } from "@/i18n/navigation";
import { buildAlternates } from "@/lib/alternates";
import type { ListSummaryDto } from "@miru/types";
import { fetchTrendingLists } from "@/lib/server-lists";

interface TrendingListsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TrendingListsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "listsTrendingPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/lists/trending", locale),
  };
}

/**
 * Dedicated discovery surface for the most-liked public lists. Anonymous-
 * friendly — no session checks, the API endpoint /lists/trending is open.
 */
export default async function TrendingListsPage({ params }: TrendingListsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [lists, t] = await Promise.all([
    fetchTrendingLists(),
    getTranslations("listsTrendingPage"),
  ]);

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            {t("eyebrow")}
          </p>
          <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {t("title")}
          </h1>
          <p className="m-0 mt-3 max-w-160 font-body text-base leading-relaxed text-text-secondary">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href="/lists?tab=public"
          className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-primary"
        >
          {t("seeAll")} →
        </Link>
      </header>

      {lists.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyBody")}
          primaryAction={{ label: t("emptyCta"), href: "/" }}
        />
      ) : (
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list, index) => (
            <li key={list.id}>
              <RankedListCard list={list} rank={index + 1} ownerLabel={t("byOwner", { name: list.ownerName })} likeLabel={t("likes")} titlesLabel={t("titlesCount", { count: list.itemCount })} />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

interface RankedListCardProps {
  list: ListSummaryDto;
  rank: number;
  ownerLabel: string;
  likeLabel: string;
  titlesLabel: string;
}

function RankedListCard({ list, rank, ownerLabel, likeLabel, titlesLabel }: RankedListCardProps) {
  return (
    <Link
      href={`/lists/${list.id}`}
      className="group block overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface transition-colors duration-200 hover:border-border hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      <div className="relative grid h-40 grid-cols-2 gap-px bg-bg-base">
        {Array.from({ length: 4 }, (_, i) => {
          const cover = list.previewCovers[i] ?? null;
          if (cover) {
            return (
              <div key={i} className="relative h-full w-full">
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            );
          }
          return (
            <div
              key={i}
              aria-hidden
              className="h-full w-full"
              style={{
                background: `linear-gradient(${130 + i * 15}deg, color-mix(in srgb, var(--color-accent) ${15 + i * 5}%, transparent), var(--color-bg-elevated))`,
              }}
            />
          );
        })}
        {/* Rank badge — distinct from the private badge so the two never collide. */}
        <span
          className="absolute left-3 top-3 inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 font-mono text-[11px] font-semibold"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "var(--color-on-accent)",
          }}
        >
          #{rank}
        </span>
      </div>
      <div className="p-4">
        <h3 className="m-0 mb-1 font-display text-base font-semibold leading-tight text-text-primary group-hover:text-accent">
          {list.title}
        </h3>
        {list.description && (
          <p className="m-0 mb-3 line-clamp-2 font-body text-xs text-text-secondary">
            {list.description}
          </p>
        )}
        <div className="flex items-center gap-3 font-mono text-[10px] text-text-tertiary">
          <span>{titlesLabel}</span>
          <span aria-hidden>·</span>
          <span>
            {list.likeCount} {likeLabel}
          </span>
          <span aria-hidden>·</span>
          <span>{ownerLabel}</span>
        </div>
      </div>
    </Link>
  );
}
