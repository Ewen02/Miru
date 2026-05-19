import type { Metadata } from "next";
import { StatCard } from "@miru/ui";

export const metadata: Metadata = {
  title: "Admin",
  description: "Tableau de bord administrateur Miru.",
};

const QUEUE = [
  { type: "review", who: "@noé", what: "Avis sur Frieren — contenu signalé", priority: "HIGH" as const },
  { type: "report", who: "@miki", what: "Spam dans le forum", priority: "MED" as const },
  { type: "user", who: "@arthur", what: "Demande de suppression de compte", priority: "LOW" as const },
];

const COLOR: Record<"HIGH" | "MED" | "LOW", string> = {
  HIGH: "var(--color-error)",
  MED: "var(--color-warning)",
  LOW: "var(--color-text-tertiary)",
};

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Modération
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Admin
        </h1>
      </header>

      <section className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="En attente" value={12} tone="accent" />
        <StatCard label="Traités aujourd'hui" value={47} />
        <StatCard label="Utilisateurs actifs" value="2 840" />
        <StatCard label="Anime indexés" value="4 521" />
      </section>

      <section>
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          File d'attente
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
          {QUEUE.map((item, i) => (
            <article
              key={i}
              className={
                i === QUEUE.length - 1
                  ? "flex items-center gap-4 p-4"
                  : "flex items-center gap-4 border-b border-border-subtle p-4"
              }
            >
              <span
                className="rounded-xs border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                style={{
                  color: COLOR[item.priority],
                  borderColor: `color-mix(in srgb, ${COLOR[item.priority]} 30%, transparent)`,
                }}
              >
                {item.priority}
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 font-body text-sm text-text-primary">{item.what}</p>
                <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  {item.who} · {item.type}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-md border border-border bg-bg-base px-3 font-body text-xs text-text-secondary"
                >
                  Voir
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center rounded-md px-3 font-body text-xs font-semibold"
                  style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
                >
                  Traiter
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
