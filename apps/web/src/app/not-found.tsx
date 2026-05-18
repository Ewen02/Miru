import Link from "next/link";
import { EmptyState } from "@miru/ui";

export const metadata = {
  title: "Introuvable",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-300 items-center justify-center px-7 py-14">
      <div className="w-full max-w-xl">
        <p className="mb-3 text-center font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
          Erreur 404
        </p>
        <EmptyState
          title="Cette page n'existe plus."
          description="L'anime que tu cherches a peut-être été retiré, ou tu as suivi un lien périmé. Le catalogue, lui, n'a pas bougé."
          icon={
            <div
              aria-hidden
              className="grid h-16 w-16 place-items-center rounded-2xl border border-border bg-bg-elevated"
              style={{
                color: "var(--color-accent)",
                background: "var(--color-accent-muted)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
                <path d="M8 11h6" />
              </svg>
            </div>
          }
          primaryAction={{ label: "Retour au catalogue", href: "/" }}
          secondaryAction={{ label: "Ma watchlist →", href: "/watchlist" }}
        />
      </div>
    </main>
  );
}
