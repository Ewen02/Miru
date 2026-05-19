import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AnimeCard, EditorialHero, Pagination } from "@miru/ui";
import { fetchGenreDetail } from "@/lib/api";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await fetchGenreDetail(slug).catch(() => null);
  if (!detail) return { title: "Genre introuvable" };
  return {
    title: detail.name,
    description: `Catalogue des anime ${detail.name} sur Miru — ${detail.stats.totalAnimes} titres.`,
  };
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const detail = await fetchGenreDetail(slug, { page, pageSize: PAGE_SIZE }).catch(() => null);
  if (!detail) notFound();

  const totalPages = Math.max(1, Math.ceil(detail.animes.total / PAGE_SIZE));

  return (
    <>
      <EditorialHero
        decorative
        breadcrumbs={[{ href: "/", label: "Catalogue" }]}
        eyebrow="Genre"
        title={detail.name}
        description={DESCRIPTIONS[detail.slug] ?? DEFAULT_DESCRIPTION}
        aside={
          <>
            <StatBlock label="Titres" value={detail.stats.totalAnimes.toLocaleString("fr-FR")} />
            <StatBlock
              label="Cette année"
              value={detail.stats.thisYearAnimes.toLocaleString("fr-FR")}
            />
            <StatBlock
              label="Note moy."
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
            Tous les {detail.name.toLowerCase()}
          </h2>
          <span className="font-mono text-[11px] text-text-tertiary">
            {detail.animes.total.toLocaleString("fr-FR")} titres
          </span>
        </header>

        {detail.animes.data.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <p className="font-body text-text-secondary">
              Aucun anime indexé pour ce genre.
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

const DEFAULT_DESCRIPTION =
  "Tous les titres de ce genre dans notre catalogue, triés par note communautaire.";

/**
 * Curated editorial copy for the main genres. Falls back to a neutral
 * sentence when an unknown slug shows up — better than empty space.
 * Slugs match what AniList sends via `slugify`.
 */
const DESCRIPTIONS: Record<string, string> = {
  action:
    "Bagarres, traques, urgences chorégraphiées. L'action porte la cadence — combats au sabre, courses, batailles d'écoles surnaturelles.",
  adventure:
    "Voyages au long cours, mondes vastes, équipes qui se forment en route. L'aventure prend son temps et récompense la patience.",
  comedy:
    "Du gag à la sitcom otaku — la comédie traverse tous les sous-genres, du slice of life moelleux au parodique débridé.",
  drama:
    "Récits d'introspection, conflits intimes et grandes émotions. Slice of life, coming-of-age, drames sociaux confondus.",
  ecchi:
    "Suggestif sans franchir la ligne. Fanservice assumé, comédies romantiques pimentées, harems légers.",
  fantasy:
    "Magie, mondes parallèles, mythologies. Heroic fantasy classique, isekai contemporain, et tout ce qui ouvre un portail.",
  horror:
    "Tension, surnaturel, atmosphère oppressante. De la maison hantée à l'angoisse cosmique en passant par le body horror.",
  "mahou-shoujo":
    "Magical girls, transformations, amitiés qui sauvent le monde. Le genre qui défie les codes depuis Sailor Moon.",
  mecha:
    "Robots géants, pilotes adolescents, conflits politiques en arrière-plan. Real robot ou super robot, le mecha encadre une génération.",
  music:
    "Idols, groupes, conservatoires. Quand la musique est le moteur narratif, pas juste la bande-son.",
  mystery:
    "Énigmes, enquêtes, révélations tardives. Du polar classique au thriller psychologique.",
  psychological:
    "L'intérieur du personnage est le vrai décor. Manipulation, paranoïa, dissociation — la tension vient de la tête.",
  romance:
    "Du shojo lycéen au josei adulte, le sentiment amoureux comme moteur principal. Comédies, drames, et tout ce qu'il y a entre.",
  "sci-fi":
    "Futur proche ou lointain, idées scientifiques poussées jusqu'au bout. Cyberpunk, hard SF, space opera.",
  "slice-of-life":
    "Le quotidien comme matière. Petits rituels, conversations longues, saisons qui passent.",
  sports:
    "Du tennis au volley en passant par le cyclisme. Discipline, équipe, et la satisfaction très précise du sport bien filmé.",
  supernatural:
    "Yokais, esprits, capacités inexpliquées. Quand l'extraordinaire s'invite dans l'ordinaire sans demander permission.",
  thriller:
    "Tension constante, enjeux mortels, courses contre la montre. Survival, conspiration, chasse à l'homme.",
};
