import Link from "next/link";
import type { Metadata } from "next";

interface StudioPageProps {
  params: Promise<{ slug: string }>;
}

interface StudioMock {
  name: string;
  city: string;
  founded: number;
  bio: string;
  stats: { titles: number; avgRating: number; tv: number; movies: number; followers: number };
  films: Array<{ title: string; year: number; format: string; rating: number; slug: string }>;
  staff: Array<{ name: string; role: string }>;
}

const STUDIOS: Record<string, StudioMock> = {
  mappa: {
    name: "MAPPA",
    city: "Tokyo",
    founded: 2011,
    bio: "Studio fondé par Masao Maruyama après son départ de Madhouse. Connu pour des productions ambitieuses : Yuri on Ice, Jujutsu Kaisen, Chainsaw Man, et la dernière saison d'Attack on Titan.",
    stats: { titles: 47, avgRating: 8.4, tv: 32, movies: 15, followers: 12480 },
    films: [
      { title: "Jujutsu Kaisen — S2", year: 2023, format: "TV", rating: 8.9, slug: "jujutsu-kaisen-s2" },
      { title: "Chainsaw Man", year: 2022, format: "TV", rating: 8.6, slug: "chainsaw-man" },
      { title: "Attack on Titan — Final", year: 2023, format: "TV", rating: 9.2, slug: "attack-on-titan-final" },
      { title: "Hell's Paradise", year: 2023, format: "TV", rating: 7.8, slug: "hells-paradise" },
      { title: "Yuri on Ice", year: 2016, format: "TV", rating: 8.5, slug: "yuri-on-ice" },
      { title: "Dororo", year: 2019, format: "TV", rating: 8.3, slug: "dororo" },
      { title: "Zombie Land Saga", year: 2018, format: "TV", rating: 7.9, slug: "zombie-land-saga" },
      { title: "Inuyashiki", year: 2017, format: "TV", rating: 7.4, slug: "inuyashiki" },
    ],
    staff: [
      { name: "Sunghoo Park", role: "Réalisateur" },
      { name: "Hiroshi Seko", role: "Scénariste" },
      { name: "Tatsuya Kitani", role: "Compositeur" },
      { name: "Tadashi Hiramatsu", role: "Character design" },
    ],
  },
};

export async function generateMetadata({ params }: StudioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const studio = STUDIOS[slug];
  if (!studio) return { title: "Studio introuvable" };
  return {
    title: studio.name,
    description: `${studio.name} — ${studio.stats.titles} titres au catalogue Miru.`,
  };
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { slug } = await params;
  const studio = STUDIOS[slug] ?? STUDIOS.mappa;

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      {/* Hero */}
      <header className="mb-14 flex flex-col gap-8 sm:flex-row sm:items-start">
        <div
          aria-hidden
          className="flex h-33 w-33 shrink-0 items-center justify-center rounded-2xl border border-border-subtle text-center"
          style={{ background: "linear-gradient(160deg, #4a1d6b, #2d1844)" }}
        >
          <span className="font-display text-2xl font-bold tracking-tight text-text-primary">
            {studio.name}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Studio · {studio.city} · fondé en {studio.founded}
          </p>
          <h1 className="m-0 mb-3 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {studio.name}
          </h1>
          <p className="m-0 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
            {studio.bio}
          </p>
        </div>
      </header>

      {/* Stats */}
      <section className="mb-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatBox label="Titres" value={studio.stats.titles} />
        <StatBox label="Note moy." value={studio.stats.avgRating.toFixed(1)} accent />
        <StatBox label="Séries TV" value={studio.stats.tv} />
        <StatBox label="Films" value={studio.stats.movies} />
        <StatBox label="Abonnés" value={studio.stats.followers.toLocaleString("fr-FR")} />
      </section>

      {/* Filmography */}
      <section className="mb-16">
        <header className="mb-6">
          <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Filmographie
          </p>
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
            Productions principales
          </h2>
        </header>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {studio.films.map((film, idx) => (
            <Link
              key={film.slug}
              href={`/anime/${film.slug}`}
              className="group relative block aspect-3/4 overflow-hidden rounded-xl border border-border-subtle"
              style={{
                background: `linear-gradient(${130 + idx * 12}deg, color-mix(in srgb, var(--color-accent) ${15 + idx * 5}%, transparent), var(--color-bg-elevated))`,
              }}
            >
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-base/90 to-transparent p-3">
                <p className="m-0 mb-1 font-display text-sm font-semibold text-text-primary group-hover:text-accent">
                  {film.title}
                </p>
                <p className="m-0 font-mono text-[10px] text-text-tertiary">
                  {film.year} · {film.format}
                </p>
              </div>
              <span
                className="absolute right-2 top-2 inline-flex h-6 items-center rounded-xs px-1.5 font-mono text-[10px] font-semibold"
                style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
              >
                ★ {film.rating.toFixed(1)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Staff */}
      <section>
        <header className="mb-6">
          <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Équipe
          </p>
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
            Membres clés
          </h2>
        </header>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {studio.staff.map((member, idx) => (
            <article
              key={member.name}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-3"
            >
              <div
                aria-hidden
                className="h-12 w-12 shrink-0 rounded-full border border-border"
                style={{
                  background: `linear-gradient(${130 + idx * 30}deg, hsl(${(idx * 60) % 360} 40% 25%), hsl(${(idx * 60 + 30) % 360} 50% 18%))`,
                }}
              />
              <div className="min-w-0">
                <p className="m-0 font-body text-sm font-semibold text-text-primary">{member.name}</p>
                <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  {member.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface px-4 py-3">
      <p className="m-0 mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
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
