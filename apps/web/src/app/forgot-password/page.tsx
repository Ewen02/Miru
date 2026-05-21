"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo, cn } from "@miru/ui";
import { API_URL } from "@/lib/env";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Better Auth's React client does not surface this endpoint by name —
      // we call the server route directly. The server always returns 200
      // even when the email is unknown, to avoid leaking user existence.
      await fetch(`${API_URL}/api/auth/request-password-reset`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      });
    } catch {
      // Network errors still show the "check your inbox" message so an
      // adversary can't probe for valid emails by watching the response.
    }
    setLoading(false);
    setSent(true);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-10">
      <div className="relative w-full max-w-100 rounded-2xl border border-border bg-bg-surface p-8">
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          <Link
            href="/"
            aria-label="Accueil Miru"
            className="rounded-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <Logo size={24} />
          </Link>
          <div>
            <h1 className="m-0 mb-1.5 font-display text-2xl font-semibold tracking-tight text-text-primary">
              Mot de passe oublié
            </h1>
            <p className="m-0 font-body text-sm text-text-tertiary">
              On t'envoie un lien pour le réinitialiser.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-xl border border-border-subtle bg-bg-base p-5 text-center">
            <p className="m-0 mb-2 font-display text-base font-semibold text-text-primary">
              Vérifie ta boîte mail.
            </p>
            <p className="m-0 font-body text-sm text-text-secondary">
              Si <span className="text-text-primary">{email}</span> est rattaché à un compte
              Miru, tu y trouveras un lien de réinitialisation. Il expire dans 1 heure.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
                Adresse e-mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
                className={cn(
                  "h-10 rounded-md border border-border bg-bg-base px-3 font-body text-sm text-text-primary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                )}
              />
            </label>

            {error && (
              <p className="m-0 font-body text-xs text-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || email.length === 0}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-md font-body text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
            >
              {loading ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center font-body text-xs text-text-tertiary">
          <Link
            href="/login"
            className="font-medium text-text-primary underline-offset-2 hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
