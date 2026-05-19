import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Pagination } from "@miru/ui";
import { fetchAnimeCatalog } from "@/lib/api";

interface TopPageProps {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;
const TOTAL_ITEMS = 100;

export const metadata: Metadata = {
  title: "Top 100",
  description: "Les 100 anime les mieux notés du catalogue Miru.",
};

export default async function TopPage({ searchParams }: TopPageProps) {
  const sp = await searchParams;
  const page = clampPage(Number(sp.page), 1, Math.ceil(TOTAL_ITEMS / PAGE_SIZE));

  const catalog = await fetchAnimeCatalog({ page, pageSize: PAGE_SIZE }).catch(() => null);
  const items = catalog?.data ?? [];
  const totalPages = Math.ceil(TOTAL_ITEMS / PAGE_SIZE);

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Classement
          </p>
          <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            Top 100
          </h1>
          <p className="m-0 mt-2 font-body text-sm text-text-secondary">
            Calculé sur la note moyenne agrégée AniList & avis Miru.
          </p>
        </div>
        <p className="font-mono text-[11px] text-text-tertiary">
          {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, TOTAL_ITEMS)} sur {TOTAL_ITEMS}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">
            {catalog === null
              ? "Impossible de joindre l'API."
              : "Aucun résultat à afficher."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <Th className="w-16 text-center">#</Th>
                  <Th>Titre</Th>
                  <Th className="hidden md:table-cell">Studio</Th>
                  <Th className="hidden sm:table-cell w-20">Année</Th>
                  <Th className="hidden lg:table-cell w-20">Format</Th>
                  <Th className="w-24 text-right">Note ↓</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((anime, idx) => {
                  const rank = (page - 1) * PAGE_SIZE + idx + 1;
                  const isPodium = rank <= 3;
                  return (
                    <tr
                      key={anime.id}
                      className="border-b border-border-subtle last:border-0 transition-colors duration-150 hover:bg-bg-elevated"
                    >
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            isPodium
                              ? "font-display text-2xl font-bold tracking-tight"
                              : "font-mono text-sm text-text-secondary"
                          }
                          style={
                            isPodium ? { color: "var(--color-accent)" } : undefined
                          }
                        >
                          {rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/anime/${anime.slug}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-xs border border-border-subtle">
                            {anime.coverUrl ? (
                              <Image
                                src={anime.coverUrl}
                                alt=""
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-bg-elevated" />
                            )}
                          </div>
                          <span className="font-body text-sm font-medium text-text-primary group-hover:text-accent line-clamp-2">
                            {anime.title}
                          </span>
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 font-body text-xs text-text-secondary md:table-cell">
                        {anime.studioName ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-text-tertiary sm:table-cell">
                        {anime.year ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="inline-flex rounded-xs border border-border-subtle bg-bg-base px-1.5 py-0.5 font-mono text-[10px] uppercase text-text-tertiary">
                          {anime.format}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {anime.averageRating != null ? (
                          <span
                            className="font-mono text-sm font-semibold"
                            style={{ color: "var(--color-accent)" }}
                          >
                            ★ {anime.averageRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-text-quaternary">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              makeHref={(p) => (p === 1 ? "/top" : `/top?page=${p}`)}
            />
          </div>
        </>
      )}
    </main>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-tertiary ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function clampPage(value: number, min: number, max: number): number {
  if (Number.isNaN(value) || value < min) return min;
  if (value > max) return max;
  return value;
}
