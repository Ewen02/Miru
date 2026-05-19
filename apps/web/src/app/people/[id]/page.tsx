import Link from "next/link";
import type { Metadata } from "next";

interface PersonPageProps {
  params: Promise<{ id: string }>;
}

interface PersonMock {
  name: string;
  nameJp: string;
  bio: string;
  stats: { roles: number; anime: number; avgRating: number; followers: number };
  roles: Array<{ character: string; anime: string; type: "PRINCIPAL" | "SUPPORT"; year: number; slug: string }>;
}

const PEOPLE: Record<string, PersonMock> = {
  "saori-hayami": {
    name: "Saori Hayami",
    nameJp: "早見 沙織",
    bio: "Voix douce, large registre. Connue pour ses rôles dans Spy x Family (Yor), Demon Slayer (Shinobu) et Eromanga Sensei. Active depuis 2007.",
    stats: { roles: 127, anime: 84, avgRating: 8.2, followers: 9420 },
    roles: [
      { character: "Yor Forger", anime: "Spy x Family", type: "PRINCIPAL", year: 2022, slug: "spy-x-family" },
      { character: "Shinobu Kocho", anime: "Demon Slayer", type: "PRINCIPAL", year: 2019, slug: "demon-slayer" },
      { character: "Yumeko Jabami", anime: "Kakegurui", type: "PRINCIPAL", year: 2017, slug: "kakegurui" },
      { character: "Ayase Aragaki", anime: "Oreimo", type: "PRINCIPAL", year: 2010, slug: "oreimo" },
      { character: "Hibiki Kohaku", anime: "Symphogear", type: "SUPPORT", year: 2012, slug: "symphogear" },
    ],
  },
};

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { id } = await params;
  const person = PEOPLE[id] ?? PEOPLE["saori-hayami"];
  return {
    title: person.name,
    description: `${person.name} — ${person.stats.roles} rôles indexés sur Miru.`,
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  const person = PEOPLE[id] ?? PEOPLE["saori-hayami"];

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-14 flex flex-col gap-10 md:flex-row md:items-start">
        <div
          aria-hidden
          className="h-70 w-50 shrink-0 rounded-xl border border-border-subtle"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in srgb, var(--color-accent) 25%, transparent), var(--color-bg-elevated))",
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Voice actor
          </p>
          <h1 className="m-0 mb-2 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {person.name}
          </h1>
          <p className="m-0 mb-4 font-body text-lg text-text-secondary">{person.nameJp}</p>
          <p className="m-0 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
            {person.bio}
          </p>
        </div>
        <aside className="grid w-full grid-cols-2 gap-3 md:w-50 md:grid-cols-1">
          <Stat label="Rôles" value={person.stats.roles} />
          <Stat label="Anime" value={person.stats.anime} />
          <Stat label="Note moy." value={person.stats.avgRating.toFixed(1)} accent />
          <Stat label="Abonnés" value={person.stats.followers.toLocaleString("fr-FR")} />
        </aside>
      </header>

      <section>
        <header className="mb-6">
          <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Filmographie
          </p>
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
            Rôles principaux
          </h2>
        </header>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
          {person.roles.map((role, idx) => (
            <Link
              key={role.character}
              href={`/anime/${role.slug}`}
              className={
                idx === person.roles.length - 1
                  ? "flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-bg-elevated"
                  : "flex items-center gap-4 border-b border-border-subtle p-4 transition-colors duration-150 hover:bg-bg-elevated"
              }
            >
              <div
                className="h-16 w-12 shrink-0 rounded-md border border-border-subtle"
                style={{
                  background: `linear-gradient(${140 + idx * 12}deg, color-mix(in srgb, var(--color-accent) ${20 + idx * 5}%, transparent), var(--color-bg-elevated))`,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="m-0 font-body text-sm font-semibold text-text-primary">
                  {role.character}
                </p>
                <p className="m-0 font-body text-xs text-text-secondary">{role.anime}</p>
              </div>
              <span
                className="shrink-0 rounded-xs border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                style={{
                  color: role.type === "PRINCIPAL" ? "var(--color-accent)" : "var(--color-text-tertiary)",
                  borderColor: role.type === "PRINCIPAL" ? "color-mix(in srgb, var(--color-accent) 35%, transparent)" : "var(--color-border)",
                }}
              >
                {role.type === "PRINCIPAL" ? "Principal" : "Support"}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-text-tertiary">{role.year}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface px-4 py-3">
      <p className="m-0 mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
        {label}
      </p>
      <p
        className="m-0 font-display text-xl font-semibold tracking-[-0.02em]"
        style={{ color: accent ? "var(--color-accent)" : "var(--color-text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
