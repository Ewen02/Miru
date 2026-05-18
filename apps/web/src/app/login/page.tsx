"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Logo, cn } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

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
    router.push((next ?? "/profile") as never);
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <BackdropCovers />

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
          <Field
            label="Adresse e-mail"
            type="email"
            value={email}
            onChange={(v) => setEmail(v)}
            placeholder="toi@exemple.fr"
            autoComplete="email"
            required
          />

          <Field
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

interface FieldProps {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
  invalid?: boolean;
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  hint,
  invalid,
}: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
        {label}
      </span>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        aria-invalid={invalid}
        className={cn(invalid && "border-error/40 bg-error-muted")}
      />
      {hint && (
        <span
          className={cn(
            "font-body text-xs",
            invalid ? "text-error" : "text-text-tertiary",
          )}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

/** Decorative scattered cover silhouettes behind the auth card. */
function BackdropCovers() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute left-[8%] top-[20%] h-58 w-40 -rotate-8 rounded-xl border border-border-subtle opacity-40"
        style={{ background: "linear-gradient(160deg, #1a0e36, #2d1844)" }}
      />
      <div
        className="absolute right-[10%] bottom-[12%] h-62 w-45 rotate-6 rounded-xl border border-border-subtle opacity-30"
        style={{ background: "linear-gradient(160deg, #0e1620, #1c5170)" }}
      />
      <div
        className="absolute right-[30%] top-[8%] h-48 w-33 -rotate-4 rounded-xl border border-border-subtle opacity-20"
        style={{ background: "linear-gradient(160deg, #1c1313, #6e1f1f)" }}
      />
    </div>
  );
}
