import type { Metadata } from "next";
import { StatCard } from "@miru/ui";

export const metadata: Metadata = {
  title: "Stats lifetime",
  description: "Tes stats depuis le premier jour sur Miru.",
};

export default function LifetimeStatsPage() {
  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Toute ma vie
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Stats lifetime
        </h1>
        <p className="m-0 mt-2 font-body text-sm text-text-secondary">
          Tout ce que tu as fait sur Miru depuis ton inscription en sep. 2024.
        </p>
      </header>

      <section className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Anime terminés" value="284" sub="depuis 2024" />
        <StatCard label="Heures regardées" value="2 048" sub="≈ 85 jours" />
        <StatCard label="Films" value="42" />
        <StatCard label="Avis publiés" value="38" tone="accent" sub="Note moy. 7.9/10" />
        <StatCard label="Streak max" value="47 jours" sub="oct. 2025 → nov. 2025" />
        <StatCard label="Genre le plus regardé" value="Drame" sub="32 % des titres" />
        <StatCard label="Studio préféré" value="MAPPA" sub="18 titres" />
        <StatCard label="Watchlist totale" value="412" sub="dont 128 à voir" />
      </section>

      <section>
        <h2 className="m-0 mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Records personnels
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Plus long binge", value: "12 épisodes en une journée", when: "Vinland Saga · janv. 2026" },
            { label: "Note la plus haute", value: "10/10 sur Cowboy Bebop", when: "oct. 2024" },
            { label: "Plus long temps avant note", value: "23 jours", when: "Texhnolyze · mars 2025" },
            { label: "Plus court binge", value: "1 film en 1h45", when: "Yôjuu Toshi · mai 2025" },
            { label: "Anime relu le plus de fois", value: "FLCL × 4 rewatchs", when: "depuis 2024" },
            { label: "Premier anime ajouté", value: "Mushishi", when: "le 12 sep. 2024" },
          ].map((r) => (
            <article key={r.label} className="rounded-xl border border-border-subtle bg-bg-surface p-4">
              <p className="m-0 mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-tertiary">
                {r.label}
              </p>
              <p className="m-0 font-display text-base font-semibold text-text-primary">{r.value}</p>
              <p className="m-0 mt-1 font-mono text-[10px] text-text-tertiary">{r.when}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
