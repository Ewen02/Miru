import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statut",
  description: "État des services Miru en temps réel.",
};

const SERVICES = [
  { name: "Application web", status: "ok" as const, latency: "42 ms" },
  { name: "API Miru", status: "ok" as const, latency: "84 ms" },
  { name: "AniList sync", status: "warn" as const, latency: "rate-limit léger" },
  { name: "Jikan (MyAnimeList)", status: "ok" as const, latency: "320 ms" },
  { name: "Base de données", status: "ok" as const, latency: "18 ms" },
];

const INCIDENTS = [
  {
    when: "2026-05-12",
    title: "AniList GraphQL — indisponibilité 32 min",
    resolution: "Circuit breaker activé, requêtes mises en cache. Restauration côté upstream.",
  },
  {
    when: "2026-05-05",
    title: "Maintenance programmée — déploiement v0.4.0",
    resolution: "Aucun incident, déploiement vert.",
  },
];

const STATUS_COLOR: Record<"ok" | "warn" | "down", string> = {
  ok: "var(--color-success)",
  warn: "var(--color-warning)",
  down: "var(--color-error)",
};

const STATUS_LABEL: Record<"ok" | "warn" | "down", string> = {
  ok: "Opérationnel",
  warn: "Dégradé",
  down: "Hors ligne",
};

export default function StatusPage() {
  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Infrastructure
        </p>
        <h1 className="m-0 mb-3 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Statut
        </h1>
        <p className="m-0 font-body text-sm text-text-secondary">
          Tous les services principaux sont opérationnels.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Services
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
          {SERVICES.map((s, idx) => (
            <div
              key={s.name}
              className={
                idx === SERVICES.length - 1
                  ? "flex items-center gap-4 p-4"
                  : "flex items-center gap-4 border-b border-border-subtle p-4"
              }
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[s.status] }}
              />
              <p className="m-0 flex-1 font-body text-sm font-medium text-text-primary">
                {s.name}
              </p>
              <span
                className="rounded-xs border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                style={{
                  color: STATUS_COLOR[s.status],
                  borderColor: `color-mix(in srgb, ${STATUS_COLOR[s.status]} 35%, transparent)`,
                }}
              >
                {STATUS_LABEL[s.status]}
              </span>
              <span className="font-mono text-[11px] text-text-tertiary">{s.latency}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Incidents récents
        </h2>
        <div className="flex flex-col gap-3">
          {INCIDENTS.map((i) => (
            <article
              key={i.title}
              className="rounded-xl border border-border-subtle bg-bg-surface p-4"
            >
              <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                {i.when}
              </p>
              <h3 className="m-0 mb-1 font-display text-base font-semibold text-text-primary">
                {i.title}
              </h3>
              <p className="m-0 font-body text-sm text-text-secondary">{i.resolution}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
