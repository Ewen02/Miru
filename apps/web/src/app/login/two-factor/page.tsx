"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo, cn } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

export default function TwoFactorLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [useBackup, setUseBackup] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = useBackup
        ? await authClient.twoFactor.verifyBackupCode({ code })
        : await authClient.twoFactor.verifyTotp({ code });
      if (result.error) {
        setError(result.error.message ?? "Code invalide.");
        return;
      }
      router.push(next as never);
      router.refresh();
    } finally {
      setPending(false);
    }
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
              Vérification 2FA
            </h1>
            <p className="m-0 font-body text-sm text-text-tertiary">
              {useBackup
                ? "Saisis un de tes codes de récupération."
                : "Saisis le code à 6 chiffres de ton application."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode={useBackup ? "text" : "numeric"}
            pattern={useBackup ? undefined : "[0-9]*"}
            maxLength={useBackup ? 16 : 6}
            value={code}
            onChange={(e) =>
              setCode(useBackup ? e.target.value : e.target.value.replace(/\D/g, ""))
            }
            placeholder={useBackup ? "Code de récupération" : "123 456"}
            autoFocus
            autoComplete="one-time-code"
            className={cn(
              "h-12 rounded-md border border-border bg-bg-base px-3 text-center font-mono text-2xl tracking-widest text-text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
            )}
          />

          {error && (
            <p className="m-0 font-body text-xs text-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || code.length < (useBackup ? 6 : 6)}
            className="inline-flex h-11 items-center justify-center rounded-md font-body text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            {pending ? "Vérification…" : "Valider"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-xs text-text-tertiary">
          <button
            type="button"
            onClick={() => {
              setUseBackup((v) => !v);
              setCode("");
              setError(null);
            }}
            className="font-medium text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
          >
            {useBackup
              ? "← Utiliser une application d'authentification"
              : "Tu n'as plus accès à ton app ? Utiliser un code de récupération"}
          </button>
        </p>
      </div>
    </main>
  );
}
