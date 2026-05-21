"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo, cn } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const { error: err } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Lien invalide ou expiré. Refais une demande.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login" as never), 2000);
  }

  if (!token) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-100 rounded-2xl border border-border bg-bg-surface p-8 text-center">
          <p className="m-0 mb-3 font-display text-lg font-semibold text-text-primary">
            Lien invalide
          </p>
          <p className="m-0 mb-6 font-body text-sm text-text-tertiary">
            Ce lien de réinitialisation est mal formé. Refais une demande depuis la page de
            connexion.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            Nouvelle demande
          </Link>
        </div>
      </main>
    );
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
              Nouveau mot de passe
            </h1>
            <p className="m-0 font-body text-sm text-text-tertiary">
              {done
                ? "Mot de passe mis à jour."
                : "Choisis un mot de passe d'au moins 8 caractères."}
            </p>
          </div>
        </div>

        {done ? (
          <p className="m-0 text-center font-body text-sm text-text-secondary">
            Redirection vers la connexion…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field
              label="Nouveau mot de passe"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <Field
              label="Confirme le mot de passe"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />

            {error && (
              <p className="m-0 font-body text-xs text-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || password.length === 0}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-md font-body text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
            >
              {loading ? "Mise à jour…" : "Mettre à jour"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
        {label}
      </span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        minLength={8}
        className={cn(
          "h-10 rounded-md border border-border bg-bg-base px-3 font-body text-sm text-text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        )}
      />
    </label>
  );
}
