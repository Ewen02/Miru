import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchVoiceActorDetail } from "@/lib/api";

interface PersonPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { id } = await params;
  const person = await fetchVoiceActorDetail(id).catch(() => null);
  if (!person) return { title: "Personne introuvable" };
  return {
    title: person.name,
    description: `${person.name} — ${person.stats.roleCount} rôles indexés sur Miru.`,
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  const person = await fetchVoiceActorDetail(id).catch(() => null);
  if (!person) notFound();

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-14 flex flex-col gap-10 md:flex-row md:items-start">
        <div
          aria-hidden
          className="h-72 w-50 shrink-0 rounded-xl border border-border-subtle"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in srgb, var(--color-accent) 25%, transparent), var(--color-bg-elevated))",
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Voice actor
          </p>
          <h1 className="m-0 mb-4 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            {person.name}
          </h1>
          <p className="m-0 max-w-160 font-body text-base leading-relaxed text-text-secondary text-pretty">
            {person.stats.roleCount} rôle{person.stats.roleCount > 1 ? "s" : ""} indexé{person.stats.roleCount > 1 ? "s" : ""} dans {person.stats.animeCount} anime du catalogue.
          </p>
        </div>
        <aside className="grid w-full grid-cols-2 gap-3 md:w-50 md:grid-cols-1">
          <Stat label="Rôles" value={person.stats.roleCount} />
          <Stat label="Anime" value={person.stats.animeCount} accent />
        </aside>
      </header>

      {person.roles.length > 0 ? (
        <section>
          <header className="mb-6">
            <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
              Filmographie
            </p>
            <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
              Rôles
            </h2>
          </header>
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
            {person.roles.map((role, idx) => (
              <Link
                key={`${role.animeSlug}-${role.characterId}-${idx}`}
                href={`/anime/${role.animeSlug}`}
                className={
                  idx === person.roles.length - 1
                    ? "flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-bg-elevated"
                    : "flex items-center gap-4 border-b border-border-subtle p-4 transition-colors duration-150 hover:bg-bg-elevated"
                }
              >
                {role.animeCoverUrl ? (
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border border-border-subtle">
                    <Image
                      src={role.animeCoverUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden
                    className="h-16 w-12 shrink-0 rounded-md border border-border-subtle"
                    style={{
                      background: `linear-gradient(${140 + idx * 12}deg, color-mix(in srgb, var(--color-accent) ${20 + (idx * 5) % 30}%, transparent), var(--color-bg-elevated))`,
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-body text-sm font-semibold text-text-primary">
                    {role.characterName}
                  </p>
                  <p className="m-0 font-body text-xs text-text-secondary">{role.animeTitle}</p>
                </div>
                <span
                  className="shrink-0 rounded-xs border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                  style={{
                    color: role.role === "MAIN" ? "var(--color-accent)" : "var(--color-text-tertiary)",
                    borderColor: role.role === "MAIN" ? "color-mix(in srgb, var(--color-accent) 35%, transparent)" : "var(--color-border)",
                  }}
                >
                  {ROLE_LABEL[role.role] ?? role.role}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-text-tertiary">
                  {role.animeYear ?? "—"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
          <p className="m-0 font-body text-sm text-text-tertiary">
            Aucun rôle indexé pour cette personne.
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
