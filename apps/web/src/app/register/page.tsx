"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Logo, cn } from "@miru/ui";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<"name" | "email" | "password" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorField(null);
    setLoading(true);
    const { error: err } = await authClient.signUp.email({ email, password, name });
    if (err) {
      setError(err.message ?? "Inscription impossible.");
      // Heuristic: Better Auth surfaces email-specific errors most often.
      setErrorField("email");
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
              Crée ton compte
            </h1>
            <p className="m-0 font-body text-sm text-text-tertiary">
              Suis tes anime préférés et partage tes avis.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Nom d'affichage"
            value={name}
            onChange={setName}
            placeholder="Ton pseudo"
            autoComplete="name"
            required
            minLength={2}
            hint="Visible publiquement sur tes avis."
            invalid={errorField === "name"}
          />
          <Field
            label="Adresse e-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="toi@exemple.fr"
            autoComplete="email"
            required
            invalid={errorField === "email"}
            hint={errorField === "email" ? error ?? undefined : undefined}
          />
          <Field
            label="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
            minLength={8}
            hint={
              errorField === "password" ? error ?? undefined : "8 caractères minimum."
            }
            invalid={errorField === "password"}
          />

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="mt-2"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            {loading ? "Création…" : "S'inscrire"}
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-xs text-text-tertiary">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-text-primary underline-offset-2 transition-opacity duration-200 hover:opacity-80"
          >
            Connecte-toi
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
