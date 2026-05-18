"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Logo } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signUp.email({ email, password, name });
    if (err) {
      setError(err.message ?? "Inscription impossible.");
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
        Créer un compte
      </h1>
      <p className="mt-2 mb-8 font-body text-sm text-text-secondary">
        Une watchlist, des notes, et de quoi suivre les sorties.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-body text-xs text-text-tertiary">Nom</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            minLength={2}
          />
        </label>

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
            autoComplete="new-password"
            required
            minLength={8}
          />
          <span className="font-body text-[10px] text-text-tertiary">8 caractères minimum.</span>
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
          {loading ? "Création…" : "S'inscrire"}
        </Button>
      </form>

      <p className="mt-8 text-center font-body text-xs text-text-tertiary">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-text-secondary underline-offset-2 hover:underline">
          Connecte-toi
        </Link>
      </p>
    </main>
  );
}
