import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@miru/ui";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Miru est en cours de maintenance.",
};

export default function MaintenancePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-7 py-14">
      <div className="flex w-full max-w-xl flex-col items-center gap-5 rounded-2xl border border-border-subtle bg-bg-surface px-6 py-14 text-center">
        <Link href="/" aria-label="Accueil Miru" className="text-text-primary">
          <Logo size={22} />
        </Link>
        <div
          aria-hidden
          className="grid h-14 w-14 place-items-center rounded-2xl border text-accent"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-elevated))",
            borderColor: "color-mix(in srgb, var(--color-accent) 30%, transparent)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <p className="m-0 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          Maintenance programmée
        </p>
        <h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          Petit ravalement de façade.
        </h1>
        <p className="m-0 max-w-md font-body text-sm text-text-secondary">
          On déploie une mise à jour de l'infrastructure. Le site sera à nouveau disponible
          dans quelques minutes — promis, on a chronométré.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/status"
            className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            Voir le statut →
          </Link>
          <a
            href="https://twitter.com/miruapp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors duration-200 hover:text-text-primary"
          >
            @miruapp
          </a>
        </div>
      </div>
    </main>
  );
}
