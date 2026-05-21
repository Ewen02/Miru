import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@miru/ui";

interface VerifyEmailPageProps {
  searchParams: Promise<{ error?: string }>;
}

export const metadata: Metadata = {
  title: "E-mail confirmé",
  description: "Confirmation d'adresse e-mail Miru.",
};

/**
 * Landing page after the user clicks the verify link in their email.
 * Better Auth handles the actual verification at /api/auth/verify-email,
 * then redirects here. If `?error=` is set the verification failed
 * (expired / invalid token).
 */
export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { error } = await searchParams;
  const failed = Boolean(error);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-100 rounded-2xl border border-border bg-bg-surface p-8 text-center">
        <div className="mb-7 flex flex-col items-center gap-4">
          <Link
            href="/"
            aria-label="Accueil Miru"
            className="rounded-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <Logo size={24} />
          </Link>
        </div>

        {failed ? (
          <>
            <div
              aria-hidden
              className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-error/30 text-error"
              style={{ backgroundColor: "var(--color-error-muted)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </div>
            <h1 className="m-0 mb-3 font-display text-xl font-semibold text-text-primary">
              Lien invalide ou expiré
            </h1>
            <p className="m-0 mb-6 font-body text-sm text-text-secondary">
              Ce lien de vérification ne fonctionne plus. Reconnecte-toi pour qu'on t'envoie un nouveau message.
            </p>
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
              style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
            >
              Aller à la connexion
            </Link>
          </>
        ) : (
          <>
            <div
              aria-hidden
              className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border"
              style={{
                color: "var(--color-success)",
                borderColor: "color-mix(in srgb, var(--color-success) 30%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--color-success) 10%, transparent)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="m-0 mb-3 font-display text-xl font-semibold text-text-primary">
              E-mail confirmé
            </h1>
            <p className="m-0 mb-6 font-body text-sm text-text-secondary">
              Ton compte est activé. Tu peux maintenant te connecter et calibrer Miru en 3 étapes.
            </p>
            <Link
              href="/onboard"
              className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
              style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
            >
              Démarrer
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
