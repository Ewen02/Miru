"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Logo } from "@miru/ui";
import { authClient } from "@/lib/auth-client";
import { AuthBackdrop } from "../_auth/auth-backdrop";
import { AuthField } from "../_auth/auth-field";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signIn.email({ email, password });
    if (err) {
      setError(err.message ?? "Identifiants incorrects.");
      setLoading(false);
      return;
    }
    router.push(next ?? "/profile");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <AuthBackdrop />

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
            <h1 className="m-0 mb-1.5 font-display text-3xl font-semibold tracking-tight text-text-primary">
              Bon retour
            </h1>
            <p className="m-0 font-body text-sm text-text-tertiary">
              Reprends où tu en étais.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthField
            label="Adresse e-mail"
            type="email"
            value={email}
            onChange={(v) => setEmail(v)}
            placeholder="toi@exemple.fr"
            autoComplete="email"
            required
          />

          <AuthField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(v) => setPassword(v)}
            autoComplete="current-password"
            required
            minLength={8}
            hint={error ?? undefined}
            invalid={!!error}
          />

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="mt-2"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-xs text-text-tertiary">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-medium text-text-primary underline-offset-2 transition-opacity duration-200 hover:opacity-80"
          >
            Inscris-toi
          </Link>
        </p>
      </div>
    </main>
  );
}

