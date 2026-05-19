import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { StatCard } from "@miru/ui";

interface YearInReviewProps {
  params: Promise<{ year: string }>;
}

/** Static mockup data — replace with a per-user aggregation use-case later. */
const MONTHS = [
  { label: "Jan", value: 6 },
  { label: "Fév", value: 8 },
  { label: "Mar", value: 9 },
  { label: "Avr", value: 12 },
  { label: "Mai", value: 15 },
  { label: "Juin", value: 11 },
  { label: "Jui", value: 8 },
  { label: "Aoû", value: 10 },
  { label: "Sep", value: 14 },
  { label: "Oct", value: 16 },
  { label: "Nov", value: 13 },
  { label: "Déc", value: 18 },
];

const TOP_FIVE = [
  { rank: 1, title: "Frieren — Beyond Journey's End", rating: 9.5, slug: "frieren-beyond-journey-s-end" },
  { rank: 2, title: "Solo Leveling", rating: 9.0, slug: "solo-leveling" },
  { rank: 3, title: "Kaiju No. 8", rating: 9.0, slug: "kaiju-no-8" },
  { rank: 4, title: "Dandadan", rating: 8.5, slug: "dandadan" },
  { rank: 5, title: "Mashle: Magic and Muscles", rating: 8.5, slug: "mashle-magic-and-muscles" },
];

const GENRES = [
  { name: "Drame", count: 45, pct: 32 },
  { name: "Slice of life", count: 34, pct: 24 },
  { name: "Fantastique", count: 25, pct: 18 },
  { name: "Romance", count: 17, pct: 12 },
  { name: "Aventure", count: 11, pct: 8 },
  { name: "Autres", count: 8, pct: 6 },
];

const STUDIOS = [
  { name: "MAPPA", count: 18, opacity: 1 },
  { name: "Studio Bind", count: 14, opacity: 0.7 },
  { name: "ufotable", count: 11, opacity: 0.5 },
  { name: "Trigger", count: 9, opacity: 0.35 },
  { name: "P.A. Works", count: 7, opacity: 0.22 },
];

export async function generateMetadata({ params }: YearInReviewProps): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Bilan ${year}`,
    description: `Ton année anime sur Miru — bilan ${year}.`,
  };
}

export default async function YearInReviewPage({ params }: YearInReviewProps) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 2020 || year > currentYear) notFound();

  const maxMonth = Math.max(...MONTHS.map((m) => m.value));
  const totalAnime = 140;
  const totalHours = 1286;

  return (
    <main className="mx-auto max-w-300 px-7 pb-20">
      {/* Hero — full-bleed editorial */}
      <section className="relative border-b border-border-subtle py-20">
        <p
          className="m-0 mb-6 font-mono text-xs uppercase tracking-[0.3em]"
          style={{ color: "var(--color-accent)" }}
        >
          Bilan annuel
        </p>
        <h1 className="m-0 mb-6 font-display font-bold leading-[0.85] tracking-[-0.04em] text-text-primary text-[120px] sm:text-[160px] lg:text-[200px]">
          {year}
        </h1>
        <p className="m-0 mb-8 max-w-180 font-body text-lg leading-snug text-text-secondary text-pretty sm:text-xl">
          Une année intense. Tu as terminé{" "}
          <span className="text-text-primary">{totalAnime} anime</span>, soit 38 % de
          plus que l'an dernier, pour un total de{" "}
          <span className="text-text-primary">{totalHours.toLocaleString("fr-FR")} heures</span>{" "}
          regardées.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex h-12 items-center rounded-md px-5 font-body text-sm font-semibold"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            Partager mon bilan
          </button>
          <button
            type="button"
            className="inline-flex h-12 items-center rounded-md border border-border bg-bg-surface px-5 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
          >
            Télécharger en image
          </button>
        </div>
      </section>

      {/* Stats grid */}
      <section className="mt-16 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Anime terminés" value={totalAnime} sub="+38 % vs 2024" />
        <StatCard
          label="Heures regardées"
          value={totalHours.toLocaleString("fr-FR")}
          sub="≈ 54 jours d'affilée"
        />
        <StatCard label="Films vus" value={22} sub="Genre dominant : Drame" />
        <StatCard label="Avis publiés" value={12} tone="accent" sub="184 likes au total" />
      </section>

      {/* Monthly bar chart */}
      <section className="mt-20">
        <SectionHeader eyebrow="Rythme" title="Ton année, mois par mois" />
        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-8">
          <div className="flex h-50 items-end gap-3">
            {MONTHS.map((mo) => {
              const heightPct = (mo.value / maxMonth) * 100;
              const isMax = mo.value === maxMonth;
              return (
                <div key={mo.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-mono text-[10px] text-text-tertiary">{mo.value}</span>
                  <div
                    className="w-full rounded-sm transition-[height] duration-300"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isMax
                        ? "var(--color-accent)"
                        : "var(--color-bg-elevated)",
                      borderColor: isMax ? "transparent" : "var(--color-border)",
                      borderWidth: isMax ? 0 : 1,
                      borderStyle: "solid",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-3">
            {MONTHS.map((mo) => (
              <span
                key={mo.label}
                className="flex-1 text-center font-mono text-[10px] text-text-tertiary"
              >
                {mo.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Top 5 */}
      <section className="mt-20">
        <SectionHeader eyebrow="Tes coups de cœur" title="Top 5 de l'année" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {TOP_FIVE.map((p) => (
            <Link
              key={p.slug}
              href={`/anime/${p.slug}`}
              className="group relative block focus-visible:outline-none"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -left-3 -top-4 z-10 font-display text-7xl font-bold tracking-[-0.04em] leading-none"
                style={{ color: "var(--color-accent)", opacity: 0.15 }}
              >
                0{p.rank}
              </span>
              <div className="relative z-0 mb-3 aspect-3/4 overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated">
                {/* Cover placeholder gradient — real cover will come once backend lands. */}
                <div
                  className="h-full w-full"
                  style={{
                    background: `linear-gradient(160deg, color-mix(in srgb, var(--color-accent) ${20 + p.rank * 5}%, transparent), var(--color-bg-elevated))`,
                  }}
                />
              </div>
              <p className="m-0 mb-1 font-display text-base font-semibold leading-tight text-text-primary group-hover:text-accent">
                {p.title}
              </p>
              <p
                className="m-0 font-mono text-xs"
                style={{ color: "var(--color-accent)" }}
              >
                ★ {p.rating.toFixed(1)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Genres + Studios breakdown */}
      <section className="mt-20">
        <SectionHeader eyebrow="Tes préférences" title="Genres de l'année" />
        <div className="grid grid-cols-1 gap-12 rounded-2xl border border-border-subtle bg-bg-surface p-8 lg:grid-cols-2">
          <div>
            {GENRES.map((g, i) => (
              <div key={g.name} className={i === GENRES.length - 1 ? "" : "mb-4"}>
                <div className="mb-1.5 flex items-baseline">
                  <span className="font-body text-sm font-medium text-text-primary">
                    {g.name}
                  </span>
                  <div className="flex-1" />
                  <span className="font-mono text-[11px] text-text-tertiary">{g.count}</span>
                  <span className="w-2" />
                  <span className="w-8 text-right font-mono text-[11px] font-medium text-text-secondary">
                    {g.pct}%
                  </span>
                </div>
                <div className="h-1 rounded-xs bg-bg-elevated">
                  <div
                    className="h-full rounded-xs"
                    style={{
                      width: `${Math.min(100, g.pct * 3)}%`,
                      backgroundColor:
                        i === 0
                          ? "var(--color-accent)"
                          : "color-mix(in srgb, var(--color-accent) 40%, transparent)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="m-0 mb-5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
              Studios les plus regardés
            </p>
            {STUDIOS.map((s) => (
              <div key={s.name} className="mb-3 flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-xs"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--color-accent) ${s.opacity * 100}%, transparent)`,
                  }}
                />
                <span className="flex-1 font-body text-sm text-text-primary">{s.name}</span>
                <span className="font-mono text-[11px] text-text-tertiary">
                  {s.count} titres
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mt-20 border-t border-border-subtle px-6 py-12 text-center">
        <p className="m-0 mb-4 font-body text-sm text-text-tertiary">
          Merci d'avoir passé {year} avec Miru.
        </p>
        <p className="mx-auto m-0 max-w-140 font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary">
          On a hâte de voir{" "}
          <span style={{ color: "var(--color-accent)" }}>
            ce que {year + 1} va t'apporter
          </span>
          .
        </p>
      </section>
    </main>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mb-6">
      <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
        {eyebrow}
      </p>
      <h2 className="m-0 font-display text-2xl font-semibold tracking-[-0.02em] text-text-primary">
        {title}
      </h2>
    </header>
  );
}
