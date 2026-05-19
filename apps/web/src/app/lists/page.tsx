import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listes",
  description: "Tes listes Miru et les sélections curées de la communauté.",
};

const MY_LISTS = [
  {
    id: "rewatch-2026",
    title: "Rewatch 2026",
    description: "Les titres que je veux revoir cette année avant les sorties d'automne.",
    count: 12,
    likes: 38,
    pinned: true,
  },
  {
    id: "best-mappa",
    title: "Le meilleur de MAPPA",
    description: "Mes choix MAPPA depuis Yuri on Ice. Mise à jour à chaque saison.",
    count: 18,
    likes: 124,
  },
  {
    id: "slice-of-life-essentials",
    title: "Slice of life essentiels",
    description: "Si tu commences le genre, commence par ces dix-là.",
    count: 10,
    likes: 67,
  },
];

const OFFICIAL_LISTS = [
  {
    id: "miru-100",
    title: "Miru 100",
    description: "Les 100 titres qui ont défini le médium selon notre équipe éditoriale.",
    count: 100,
    likes: 4280,
    official: true,
  },
  {
    id: "comfort-watch",
    title: "Comfort watch",
    description: "Quand rien d'autre ne va. Sélection lente, douce, sans enjeu vital.",
    count: 24,
    likes: 1820,
    official: true,
  },
];

export default function ListsPage() {
  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            Curated
          </p>
          <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
            Listes
          </h1>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
        >
          + Créer une liste
        </button>
      </header>

      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border-subtle" aria-label="Onglets">
        <Tab label="Mes listes" active />
        <Tab label="Likées" />
        <Tab label="Officielles" />
        <Tab label="Communauté" />
      </nav>

      <section className="mb-16">
        <header className="mb-6">
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
            Mes listes
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MY_LISTS.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      </section>

      <section>
        <header className="mb-6">
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
            Sélections officielles
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {OFFICIAL_LISTS.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      </section>
    </main>
  );
}

interface ListSummary {
  id: string;
  title: string;
  description: string;
  count: number;
  likes: number;
  pinned?: boolean;
  official?: boolean;
}

function ListCard({ list }: { list: ListSummary }) {
  return (
    <Link
      href={`/lists/${list.id}`}
      className="group block overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface transition-colors duration-200 hover:border-border hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      <div className="relative grid h-40 grid-cols-2 gap-px bg-bg-base">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-full w-full"
            style={{
              background: `linear-gradient(${130 + i * 15}deg, color-mix(in srgb, var(--color-accent) ${15 + i * 5}%, transparent), var(--color-bg-elevated))`,
            }}
          />
        ))}
        {list.pinned && (
          <span className="absolute left-3 top-3 rounded-xs border border-accent/40 bg-accent/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
            style={{ color: "var(--color-accent)" }}>
            Épinglée
          </span>
        )}
        {list.official && (
          <span className="absolute left-3 top-3 rounded-xs border border-accent/40 bg-accent/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
            style={{ color: "var(--color-accent)" }}>
            Officielle
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="m-0 mb-1 font-display text-base font-semibold leading-tight text-text-primary group-hover:text-accent">
          {list.title}
        </h3>
        <p className="m-0 mb-3 line-clamp-2 font-body text-xs text-text-secondary">{list.description}</p>
        <div className="flex items-center gap-3 font-mono text-[10px] text-text-tertiary">
          <span>{list.count} titres</span>
          <span aria-hidden>·</span>
          <span>{list.likes} ❤</span>
        </div>
      </div>
    </Link>
  );
}

function Tab({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      role="tab"
      aria-selected={active}
      className="relative inline-flex h-10 items-center rounded-t-md px-4 font-body text-sm font-medium"
      style={{
        color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
      }}
    >
      {label}
      {active && (
        <span
          aria-hidden
          className="absolute -bottom-px left-3 right-3 h-0.5"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
      )}
    </span>
  );
}
