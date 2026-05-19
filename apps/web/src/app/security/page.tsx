import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sécurité",
  description: "Sécurité de ton compte Miru — 2FA, sessions, audit.",
};

const SESSIONS = [
  { device: "MacBook Pro · Safari", location: "Paris, FR", lastSeen: "actuelle", current: true },
  { device: "iPhone 14 · Mobile", location: "Paris, FR", lastSeen: "il y a 2h" },
  { device: "Chrome · Linux", location: "Berlin, DE", lastSeen: "il y a 3 jours" },
];

const AUDIT = [
  { event: "Connexion réussie", when: "19 mai 2026 10:42", ip: "78.124.x.x" },
  { event: "Mot de passe changé", when: "12 mai 2026 14:08", ip: "78.124.x.x" },
  { event: "Session terminée", when: "12 mai 2026 09:30", ip: "203.0.x.x" },
];

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-3xl px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Compte
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          Sécurité
        </h1>
      </header>

      <section className="mb-10">
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Authentification à deux facteurs
        </h2>
        <article className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-surface p-5">
          <div>
            <p className="m-0 font-display text-base font-semibold text-text-primary">
              2FA · Application d'authentification
            </p>
            <p className="m-0 mt-0.5 font-body text-xs text-text-tertiary">
              Désactivée — recommandée pour sécuriser ton compte.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-md px-4 font-body text-sm font-semibold"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            Activer
          </button>
        </article>
      </section>

      <section className="mb-10">
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Sessions actives
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
          {SESSIONS.map((s, i) => (
            <div
              key={s.device}
              className={
                i === SESSIONS.length - 1
                  ? "flex items-center justify-between p-4"
                  : "flex items-center justify-between border-b border-border-subtle p-4"
              }
            >
              <div>
                <p className="m-0 font-body text-sm font-semibold text-text-primary">{s.device}</p>
                <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  {s.location} · {s.lastSeen}
                </p>
              </div>
              {s.current ? (
                <span
                  className="rounded-xs border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                  style={{
                    color: "var(--color-success)",
                    borderColor: "color-mix(in srgb, var(--color-success) 30%, transparent)",
                  }}
                >
                  Actuelle
                </span>
              ) : (
                <button
                  type="button"
                  className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-error"
                >
                  Révoquer
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Journal récent
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface">
          {AUDIT.map((a, i) => (
            <div
              key={i}
              className={
                i === AUDIT.length - 1
                  ? "flex items-center justify-between p-4"
                  : "flex items-center justify-between border-b border-border-subtle p-4"
              }
            >
              <div>
                <p className="m-0 font-body text-sm text-text-primary">{a.event}</p>
                <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  {a.when} · IP {a.ip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
