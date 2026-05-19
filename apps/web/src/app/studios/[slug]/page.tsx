import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnimeCard, EditorialHero, Pagination } from "@miru/ui";
import { fetchStudioDetail } from "@/lib/api";

interface StudioPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

export async function generateMetadata({ params }: StudioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const studio = await fetchStudioDetail(slug).catch(() => null);
  if (!studio) return { title: "Studio introuvable" };
  return {
    title: studio.name,
    description: `${studio.name} — ${studio.stats.totalAnimes} titres au catalogue Miru.`,
  };
}

export default async function StudioPage({ params, searchParams }: StudioPageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const studio = await fetchStudioDetail(slug, { page, pageSize: PAGE_SIZE }).catch(() => null);
  if (!studio) notFound();

  const totalPages = Math.max(1, Math.ceil(studio.animes.total / PAGE_SIZE));

  return (
    <>
      <EditorialHero
        decorative
        breadcrumbs={[{ href: "/", label: "Catalogue" }]}
        eyebrow="Studio"
        title={studio.name}
        aside={
          <>
            <StatBlock label="Titres" value={studio.stats.totalAnimes.toLocaleString("fr-FR")} />
            <StatBlock
              label="Note moy."
              value={
                studio.stats.averageRating != null ? studio.stats.averageRating.toFixed(1) : "—"
              }
              accent
            />
            <StatBlock label="Séries TV" value={studio.stats.tvCount.toLocaleString("fr-FR")} />
            <StatBlock label="Films" value={studio.stats.movieCount.toLocaleString("fr-FR")} />
          </>
        }
      />

      <main className="mx-auto max-w-300 px-7 pb-20 pt-10">
        <header className="mb-6 flex items-baseline justify-between">
          <h2 className="m-0 flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.22em] text-text-secondary">
            <span
              aria-hidden
              className="inline-block h-0.5 w-6 rounded-full"
              style={{ backgroundColor: "var(--color-accent)" }}
            />
            Filmographie
          </h2>
          <span className="font-mono text-[11px] text-text-tertiary">
            {studio.animes.total.toLocaleString("fr-FR")} titres
          </span>
        </header>

        {studio.animes.data.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="m-0 font-body text-sm text-text-tertiary">
              Aucun anime indexé pour ce studio.
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {studio.animes.data.map((anime) => (
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
                makeHref={(p) => (p === 1 ? `/studios/${slug}` : `/studios/${slug}?page=${p}`)}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="m-0 mb-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
        {label}
      </p>
      <p
        className="m-0 font-display text-2xl font-semibold tracking-[-0.02em]"
        style={{ color: accent ? "var(--color-accent)" : "var(--color-text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
