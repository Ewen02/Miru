import Link from "next/link";
import Image from "next/image";
import type { AnimeCard, ListSummaryDto } from "@miru/types";

interface LandingProps {
  /** A handful of top-rated anime — used in the mockup screenshots. */
  featuredAnime: AnimeCard[];
  /** A few public lists — used in the "share your taste" mockup. */
  featuredLists: ListSummaryDto[];
}

/**
 * Anonymous home page — the public face of Miru. Pitches the product,
 * shows in-page mockups built from real catalog data (no maintained PNGs),
 * and funnels visitors to /register or /login.
 *
 * Rendered only when both:
 *   - the user is anonymous
 *   - no catalog filter is active (search/filter mode keeps the grid)
 */
export function Landing({ featuredAnime, featuredLists }: LandingProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-30 -top-15 h-150 w-150 rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in srgb, var(--color-accent) 12%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto grid max-w-300 grid-cols-1 gap-12 px-7 pb-20 pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-24">
          <div className="flex flex-col justify-center">
            <p className="m-0 mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
              Plateforme anime · gratuite · sans pub
            </p>
            <h1 className="m-0 mb-6 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-text-primary sm:text-6xl lg:text-7xl">
              Explorer, organiser,<br />
              partager.
            </h1>
            <p className="m-0 mb-8 max-w-160 font-body text-lg leading-relaxed text-text-secondary text-pretty">
              4 500+ anime indexés. Watchlist personnelle, listes curées, avis publics.
              Conçu pour disparaître derrière les œuvres.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center rounded-md px-6 font-body text-base font-semibold"
                style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
              >
                Créer un compte
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                J'ai déjà un compte →
              </Link>
            </div>
            <p className="m-0 mt-5 font-mono text-[10px] text-text-tertiary">
              Pas d'email marketing, pas de tracker tiers, pas d'IA générative. Promis.
            </p>
          </div>

          <CatalogMockup anime={featuredAnime.slice(0, 6)} />
        </div>
      </section>

      {/* Three pillars */}
      <section className="border-b border-border-subtle">
        <div className="mx-auto max-w-300 px-7 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            <Pillar
              eyebrow="01"
              title="Explorer"
              body="Catalogue construit sur AniList et enrichi via Jikan. Recherche instantanée, filtres par genre/format/année/saison, top 100 et calendrier hebdo des épisodes."
            />
            <Pillar
              eyebrow="02"
              title="Organiser"
              body="Watchlist avec 5 statuts, progression épisode par épisode, note privée. Crée des listes curées (publiques ou privées) et like celles des autres."
            />
            <Pillar
              eyebrow="03"
              title="Partager"
              body="Publie des avis (1-10 + spoiler tag) qui alimentent la note communautaire. Profil public partageable. Importe ta liste AniList en un clic."
            />
          </div>
        </div>
      </section>

      {/* Watchlist mockup */}
      <section className="border-b border-border-subtle">
        <div className="mx-auto grid max-w-300 grid-cols-1 gap-12 px-7 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <WatchlistMockup anime={featuredAnime.slice(0, 4)} />
          <div>
            <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
              Watchlist
            </p>
            <h2 className="m-0 mb-5 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
              Un tracker qui ne te juge pas.
            </h2>
            <p className="m-0 mb-4 max-w-140 font-body text-base leading-relaxed text-text-secondary text-pretty">
              5 statuts simples (en cours, à voir, en pause, terminé, abandonné), un stepper
              d'épisodes, et une note à toi seul. Pas de streak shaming, pas de notif culpabilisante.
            </p>
            <p className="m-0 max-w-140 font-body text-base leading-relaxed text-text-secondary text-pretty">
              Bilans annuels personnalisés — heures regardées, top genres, top studios — privés par défaut.
            </p>
          </div>
        </div>
      </section>

      {/* Lists section */}
      {featuredLists.length > 0 && (
        <section className="border-b border-border-subtle">
          <div className="mx-auto max-w-300 px-7 py-20">
            <div className="mb-10">
              <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
                Communauté
              </p>
              <h2 className="m-0 mb-3 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
                Des listes curées par la communauté.
              </h2>
              <p className="m-0 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
                Plonge dans les sélections des autres ou crée les tiennes. Pas d'algorithme caché,
                juste des gens avec du goût.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredLists.slice(0, 3).map((list) => (
                <ListPreviewCard key={list.id} list={list} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Import section */}
      <section className="border-b border-border-subtle">
        <div className="mx-auto max-w-300 px-7 py-20 text-center">
          <p
            className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "var(--color-accent)" }}
          >
            Pour les transfuges AniList
          </p>
          <h2 className="m-0 mb-4 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
            Garde 10 ans d'historique.
          </h2>
          <p className="mx-auto m-0 mb-8 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
            Importe ta watchlist publique AniList en un POST. Statuts mappés, notes conservées,
            progression intacte. Pas besoin de connecter un compte.
          </p>
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-md px-6 font-body text-base font-semibold"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            Commencer
          </Link>
        </div>
      </section>

      {/* What we don't do */}
      <section className="border-b border-border-subtle">
        <div className="mx-auto max-w-300 px-7 py-20">
          <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Ce qu'on ne fait pas
          </p>
          <h2 className="m-0 mb-10 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
            Et c'est volontaire.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <NopeItem title="Pas de publicité" body="Aucune. Jamais. Y compris pas de bannières 'partenaire'." />
            <NopeItem title="Pas de tracking tiers" body="Pas de pixel Meta/Google/Mixpanel. Logs serveur anonymisés à 7 jours." />
            <NopeItem title="Pas d'IA générative" body="Les synopsis viennent d'AniList. Les avis viennent de vrais humains." />
            <NopeItem title="Pas de NSFW" body="Le catalogue exclut le Hentai à trois couches (GraphQL + adapter + repo)." />
            <NopeItem title="Pas de gamification toxique" body="Pas de streak shaming, pas de notifications culpabilisantes." />
            <NopeItem title="Pas de scroll infini" body="Tout est paginé. Tu décides quand tu arrêtes." />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto max-w-300 px-7 py-24 text-center">
          <h2 className="m-0 mb-4 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            Prêt à organiser le bordel ?
          </h2>
          <p className="mx-auto m-0 mb-8 max-w-140 font-body text-base leading-relaxed text-text-secondary text-pretty">
            Gratuit, pas de carte bleue, exportable à tout moment. Tu peux supprimer ton compte en
            un clic depuis les paramètres.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-12 items-center rounded-md px-6 font-body text-base font-semibold"
              style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
            >
              Créer un compte
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors duration-200 hover:text-text-primary"
            >
              En savoir plus →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Pillar({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <article className="flex flex-col gap-3">
      <p
        className="m-0 font-mono text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--color-accent)" }}
      >
        {eyebrow}
      </p>
      <h3 className="m-0 font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary">
        {title}
      </h3>
      <p className="m-0 font-body text-base leading-relaxed text-text-secondary text-pretty">
        {body}
      </p>
    </article>
  );
}

function NopeItem({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
      <p className="m-0 mb-1 flex items-center gap-2 font-display text-base font-semibold text-text-primary">
        <span aria-hidden style={{ color: "var(--color-accent)" }}>
          ✓
        </span>
        {title}
      </p>
      <p className="m-0 font-body text-sm text-text-tertiary">{body}</p>
    </article>
  );
}

/**
 * In-page "screenshot" of the catalog grid — uses real anime covers so the
 * mockup stays in sync with reality without maintaining PNGs.
 */
function CatalogMockup({ anime }: { anime: AnimeCard[] }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-3xl border border-border-subtle bg-bg-surface/40 backdrop-blur-sm"
      />
      <div className="relative rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-text-quaternary" />
          <span className="h-2 w-2 rounded-full bg-text-quaternary" />
          <span className="h-2 w-2 rounded-full bg-text-quaternary" />
          <span className="ml-3 font-mono text-[10px] text-text-tertiary">miru.app / catalogue</span>
        </div>
        <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-bg-base px-3 py-2 font-mono text-xs text-text-tertiary">
          <span>🔍</span>
          <span>Rechercher dans 4 521 anime…</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {anime.length > 0
            ? anime.map((a) => <MockCover key={a.id} title={a.title} coverUrl={a.coverUrl} rating={a.averageRating} />)
            : Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-3/4 rounded-md border border-border-subtle"
                  style={{
                    background: `linear-gradient(${140 + i * 12}deg, color-mix(in srgb, var(--color-accent) ${15 + i * 5}%, transparent), var(--color-bg-elevated))`,
                  }}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

function MockCover({ title, coverUrl, rating }: { title: string; coverUrl: string | null; rating: number | null }) {
  return (
    <div className="relative aspect-3/4 overflow-hidden rounded-md border border-border-subtle">
      {coverUrl ? (
        <Image src={coverUrl} alt="" fill sizes="120px" className="object-cover" />
      ) : (
        <div className="h-full w-full bg-bg-elevated" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-base/95 via-bg-base/60 to-transparent p-2">
        <p className="m-0 line-clamp-1 font-body text-[10px] font-semibold text-text-primary">
          {title}
        </p>
        {rating != null && (
          <p
            className="m-0 mt-0.5 font-mono text-[9px]"
            style={{ color: "var(--color-accent)" }}
          >
            ★ {rating.toFixed(1)}
          </p>
        )}
      </div>
    </div>
  );
}

function WatchlistMockup({ anime }: { anime: AnimeCard[] }) {
  const statuses = ["EN COURS", "À VOIR", "TERMINÉ", "TERMINÉ"];
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-3xl border border-border-subtle bg-bg-surface/40 backdrop-blur-sm"
      />
      <div className="relative rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-2xl">
        <p className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Ma watchlist
        </p>
        <div className="flex flex-col gap-2">
          {anime.length > 0
            ? anime.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-md border border-border-subtle bg-bg-base p-2"
                >
                  <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-xs border border-border-subtle">
                    {a.coverUrl && (
                      <Image src={a.coverUrl} alt="" fill sizes="36px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate font-body text-sm font-medium text-text-primary">
                      {a.title}
                    </p>
                    <p className="m-0 font-mono text-[10px] text-text-tertiary">
                      ÉP. {(i + 1) * 3} / {a.year ?? 12}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-xs border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                    style={{
                      color: "var(--color-accent)",
                      borderColor: "color-mix(in srgb, var(--color-accent) 35%, transparent)",
                    }}
                  >
                    {statuses[i] ?? "À VOIR"}
                  </span>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}

function ListPreviewCard({ list }: { list: ListSummaryDto }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
      <div className="relative grid h-32 grid-cols-2 gap-px bg-bg-base">
        {Array.from({ length: 4 }, (_, i) => {
          const cover = list.previewCovers[i] ?? null;
          if (cover) {
            return (
              <div key={i} className="relative h-full w-full">
                <Image src={cover} alt="" fill sizes="200px" className="object-cover" />
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
      </div>
      <div className="p-4">
        <h3 className="m-0 mb-1 font-display text-sm font-semibold text-text-primary">{list.title}</h3>
        <p className="m-0 font-mono text-[10px] text-text-tertiary">
          {list.itemCount} titres · par {list.ownerName}
        </p>
      </div>
    </article>
  );
}
