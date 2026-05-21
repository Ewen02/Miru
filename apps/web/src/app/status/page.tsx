import type { Metadata } from "next";
import { fetchServiceStatus } from "@/lib/server-status";

export const metadata: Metadata = {
  title: "Statut",
  description: "État des services Miru en temps réel.",
};

// 30-second revalidation — the page is a smoke check, not a live monitor.
export const revalidate = 30;

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

export default async function StatusPage() {
  const services = await fetchServiceStatus();
  const downCount = services.filter((s) => s.status === "down").length;
  const warnCount = services.filter((s) => s.status === "warn").length;
  const overall =
    downCount > 0
      ? "Un ou plusieurs services sont hors ligne."
      : warnCount > 0
        ? "Performance dégradée sur un service."
        : "Tous les services principaux sont opérationnels.";

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
          {overall}
        </p>
      </header>

      <section className="mb-12">
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Services
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
          {services.map((s, idx) => (
            <div
              key={s.name}
              className={
                idx === services.length - 1
                  ? "flex items-center gap-4 p-4"
                  : "flex items-center gap-4 border-b border-border-subtle p-4"
              }
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: STATUS_COLOR[s.status] }}
              />
              <div className="min-w-0 flex-1">
                <p className="m-0 font-body text-sm font-medium text-text-primary">
                  {s.name}
                </p>
                {s.detail && (
                  <p className="m-0 mt-0.5 font-body text-xs text-text-tertiary">
                    {s.detail}
                  </p>
                )}
              </div>
              <span
                className="rounded-xs border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                style={{
                  color: STATUS_COLOR[s.status],
                  borderColor: `color-mix(in srgb, ${STATUS_COLOR[s.status]} 35%, transparent)`,
                }}
              >
                {STATUS_LABEL[s.status]}
              </span>
              <span className="font-mono text-[11px] text-text-tertiary">
                {s.latencyMs != null ? `${s.latencyMs} ms` : "—"}
              </span>
            </div>
          ))}
        </div>
        <p className="m-0 mt-3 text-right font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          Sondes rafraîchies toutes les 30 s
        </p>
      </section>
    </main>
  );
}
