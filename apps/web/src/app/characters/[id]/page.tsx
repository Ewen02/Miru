import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchCharacterDetail } from "@/lib/api";

interface CharacterPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CharacterPageProps): Promise<Metadata> {
  const { id } = await params;
  const character = await fetchCharacterDetail(id).catch(() => null);
  if (!character) return { title: "Personnage introuvable" };
  return {
    title: character.name,
    description: `${character.name} — apparitions dans ${character.appearances.length} anime sur Miru.`,
  };
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { id } = await params;
  const character = await fetchCharacterDetail(id).catch(() => null);
  if (!character) notFound();

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-14 flex flex-col gap-10 md:flex-row md:items-start">
        {character.imageUrl ? (
          <div className="relative h-85 w-60 shrink-0 overflow-hidden rounded-xl border border-border-subtle">
            <Image
              src={character.imageUrl}
              alt={character.name}
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="h-85 w-60 shrink-0 rounded-xl border border-border-subtle"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in srgb, var(--color-accent) 35%, transparent), var(--color-bg-elevated))",
            }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Personnage
          </p>
          <h1 className="m-0 mb-2 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {character.name}
          </h1>
          {character.nameJp && (
            <p className="m-0 mb-6 font-body text-lg text-text-secondary">{character.nameJp}</p>
          )}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            <Stat label="Apparitions" value={character.appearances.length} />
            <Stat label="Voix" value={character.voiceCredits.length} />
            {character.appearances[0]?.animeYear && (
              <Stat label="Première apparition" value={character.appearances[character.appearances.length - 1]?.animeYear ?? character.appearances[0].animeYear} />
            )}
          </dl>
        </div>
      </header>

      {character.voiceCredits.length > 0 && (
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
            {character.voiceCredits.map((credit, idx) => (
              <Link
                key={credit.voiceActorId}
                href={`/people/${credit.voiceActorId}`}
                className={
                  idx === character.voiceCredits.length - 1
                    ? "flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-bg-elevated"
                    : "flex items-center gap-4 border-b border-border-subtle p-4 transition-colors duration-150 hover:bg-bg-elevated"
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
                  <p className="m-0 font-body text-sm font-semibold text-text-primary">
                    {credit.voiceActorName}
                  </p>
                  <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                    {credit.appearances} apparition{credit.appearances > 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {character.appearances.length > 0 && (
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
            {character.appearances.map((a, idx) => (
              <Link
                key={`${a.animeSlug}-${idx}`}
                href={`/anime/${a.animeSlug}`}
                className={
                  idx === character.appearances.length - 1
                    ? "flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-bg-elevated"
                    : "flex items-center gap-4 border-b border-border-subtle p-4 transition-colors duration-150 hover:bg-bg-elevated"
                }
              >
                {a.animeCoverUrl ? (
                  <div className="relative h-17 w-12 shrink-0 overflow-hidden rounded-md border border-border-subtle">
                    <Image
                      src={a.animeCoverUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden
                    className="h-17 w-12 shrink-0 rounded-md border border-border-subtle"
                    style={{
                      background: `linear-gradient(${140 + idx * 12}deg, color-mix(in srgb, var(--color-accent) ${20 + idx * 5}%, transparent), var(--color-bg-elevated))`,
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-body text-sm font-semibold text-text-primary">
                    {a.animeTitle}
                  </p>
                  <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                    {a.animeYear ?? "—"}
                    {a.animeEpisodeCount != null && <span> · {a.animeEpisodeCount} ép.</span>}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-xs border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                  style={{
                    color: a.role === "MAIN" ? "var(--color-accent)" : "var(--color-text-tertiary)",
                    borderColor: a.role === "MAIN" ? "color-mix(in srgb, var(--color-accent) 35%, transparent)" : "var(--color-border)",
                  }}
                >
                  {ROLE_LABEL[a.role] ?? "Background"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {character.appearances.length === 0 && character.voiceCredits.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">
            Aucune apparition indexée pour ce personnage.
          </p>
        </div>
      )}
    </main>
  );
}

const ROLE_LABEL: Record<string, string> = {
  MAIN: "Principal",
  SUPPORTING: "Support",
  BACKGROUND: "Background",
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="m-0 mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
        {label}
      </dt>
      <dd className="m-0 font-display text-xl font-semibold text-text-primary">{value}</dd>
    </div>
  );
}
