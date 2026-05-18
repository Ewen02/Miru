"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Logo } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
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
    router.push("/profile");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        aria-label="Accueil Miru"
        className="mb-12 inline-flex shrink-0 self-start text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        <Logo size={24} />
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary">
        Connexion
      </h1>
      <p className="mt-2 mb-8 font-body text-sm text-text-secondary">
        Bon retour. Connecte-toi pour retrouver ta watchlist.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-body text-xs text-text-tertiary">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-xs text-text-tertiary">Mot de passe</span>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={8}
          />
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-error/30 bg-error/10 px-3 py-2 font-body text-xs text-error"
          >
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="mt-8 text-center font-body text-xs text-text-tertiary">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-text-secondary underline-offset-2 hover:underline">
          Inscris-toi
        </Link>
      </p>
    </main>
  );
}
