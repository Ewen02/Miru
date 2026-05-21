"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button, Logo } from "@miru/ui";
import { authClient } from "@/lib/auth-client";
import { AuthBackdrop } from "../_auth/auth-backdrop";
import { AuthField } from "../_auth/auth-field";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const t = useTranslations("auth");
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
      setError(err.message ?? t("registerFailed"));
      setErrorField("email");
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
            aria-label={t("logoAria")}
            className="rounded-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <Logo size={24} />
          </Link>
          <div>
            <h1 className="m-0 mb-1.5 font-display text-3xl font-semibold tracking-tight text-text-primary">
              {t("registerTitleShort")}
            </h1>
            <p className="m-0 font-body text-sm text-text-tertiary">
              {t("registerSubtitleShort")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthField
            label={t("name")}
            value={name}
            onChange={setName}
            placeholder={t("namePlaceholder")}
            autoComplete="name"
            required
            minLength={2}
            hint={t("nameHint")}
            invalid={errorField === "name"}
          />
          <AuthField
            label={t("email")}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            required
            invalid={errorField === "email"}
            hint={errorField === "email" ? error ?? undefined : undefined}
          />
          <AuthField
            label={t("password")}
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
            minLength={8}
            hint={errorField === "password" ? error ?? undefined : t("passwordHint")}
            invalid={errorField === "password"}
          />

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="mt-2"
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            {loading ? t("registerCtaLoading") : t("registerCta")}
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-xs text-text-tertiary">
          {t("hasAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-text-primary underline-offset-2 transition-opacity duration-200 hover:opacity-80"
          >
            {t("login")}
          </Link>
        </p>
      </div>
    </main>
  );
}

