import Link from "next/link";
import type { Metadata } from "next";

interface CharacterPageProps {
  params: Promise<{ id: string }>;
}

interface CharacterMock {
  name: string;
  nameJp: string;
  attributes: Record<string, string>;
  bio: string;
  voices: Array<{ lang: "JP" | "FR" | "EN"; va: string; studio: string }>;
  appearances: Array<{ title: string; type: "PRINCIPAL" | "ANNONCE"; episodes: number | null; year: number; slug: string }>;
}

const CHARACTERS: Record<string, CharacterMock> = {
  "yor-forger": {
    name: "Yor Forger",
    nameJp: "ヨル・フォージャー",
    attributes: {
      Âge: "27 ans",
      Anniversaire: "2 décembre",
      Genre: "Féminin",
      Taille: "168 cm",
      Origine: "Ostania",
      "Groupe sanguin": "A",
    },
    bio: "Assassin sous le pseudonyme « Princesse Épine », mariée par convention à Loid Forger. Surnaturellement forte, douce dans la vie quotidienne, redoutable au combat.",
    voices: [
      { lang: "JP", va: "Saori Hayami", studio: "WIT Studio" },
      { lang: "FR", va: "Marion Le Bouar", studio: "Wantake" },
      { lang: "EN", va: "Natalie Van Sistine", studio: "Funimation" },
    ],
    appearances: [
      { title: "Spy x Family", type: "PRINCIPAL", episodes: 25, year: 2022, slug: "spy-x-family" },
      { title: "Spy x Family — Saison 2", type: "PRINCIPAL", episodes: 12, year: 2023, slug: "spy-x-family-s2" },
      { title: "Spy x Family Code: White", type: "PRINCIPAL", episodes: null, year: 2023, slug: "spy-x-family-code-white" },
    ],
  },
};

export async function generateMetadata({ params }: CharacterPageProps): Promise<Metadata> {
  const { id } = await params;
  const c = CHARACTERS[id] ?? CHARACTERS["yor-forger"];
  return {
    title: c.name,
    description: c.bio.slice(0, 160),
  };
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { id } = await params;
  const c = CHARACTERS[id] ?? CHARACTERS["yor-forger"];

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-14 flex flex-col gap-10 md:flex-row md:items-start">
        <div
          aria-hidden
          className="h-85 w-60 shrink-0 rounded-xl border border-border-subtle"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in srgb, var(--color-accent) 35%, transparent), var(--color-bg-elevated))",
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Personnage
          </p>
          <h1 className="m-0 mb-2 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {c.name}
          </h1>
          <p className="m-0 mb-6 font-body text-lg text-text-secondary">{c.nameJp}</p>

          <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {Object.entries(c.attributes).map(([k, v]) => (
              <div key={k}>
                <dt className="m-0 mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
                  {k}
                </dt>
                <dd className="m-0 font-body text-sm text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="m-0 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
            {c.bio}
          </p>
        </div>
      </header>

      {/* Voices */}
      <section className="mb-16">
        <header className="mb-6">
          <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Voix
          </p>
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
            Doublage
          </h2>
        </header>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
          {c.voices.map((v, idx) => (
            <div
              key={v.lang}
              className={
                idx === c.voices.length - 1
                  ? "flex items-center gap-4 p-4"
                  : "flex items-center gap-4 border-b border-border-subtle p-4"
              }
            >
              <div
                aria-hidden
                className="h-10 w-10 shrink-0 rounded-full border border-border"
                style={{
                  background: `linear-gradient(${130 + idx * 80}deg, hsl(${(idx * 90) % 360} 40% 30%), hsl(${(idx * 90 + 40) % 360} 50% 18%))`,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="m-0 font-body text-sm font-semibold text-text-primary">{v.va}</p>
                <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  {v.studio}
                </p>
              </div>
              <span
                className="shrink-0 rounded-xs border border-border bg-bg-base px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-secondary"
              >
                {v.lang}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Appearances */}
      <section>
        <header className="mb-6">
          <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Apparitions
          </p>
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
            Titres liés
          </h2>
        </header>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
          {c.appearances.map((a, idx) => (
            <Link
              key={a.slug}
              href={`/anime/${a.slug}`}
              className={
                idx === c.appearances.length - 1
                  ? "flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-bg-elevated"
                  : "flex items-center gap-4 border-b border-border-subtle p-4 transition-colors duration-150 hover:bg-bg-elevated"
              }
            >
              <div
                className="h-17 w-12 shrink-0 rounded-md border border-border-subtle"
                style={{
                  background: `linear-gradient(${140 + idx * 12}deg, color-mix(in srgb, var(--color-accent) ${20 + idx * 5}%, transparent), var(--color-bg-elevated))`,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="m-0 font-body text-sm font-semibold text-text-primary">{a.title}</p>
                <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  {a.year} {a.episodes != null && <span>· {a.episodes} ép.</span>}
                </p>
              </div>
              <span
                className="shrink-0 rounded-xs border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                style={{
                  color: a.type === "PRINCIPAL" ? "var(--color-accent)" : "var(--color-text-tertiary)",
                  borderColor: a.type === "PRINCIPAL" ? "color-mix(in srgb, var(--color-accent) 35%, transparent)" : "var(--color-border)",
                }}
              >
                {a.type === "PRINCIPAL" ? "Principal" : "Annoncé"}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
