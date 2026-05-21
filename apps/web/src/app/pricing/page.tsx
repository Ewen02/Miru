import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { fetchBillingStatus } from "@/lib/server-billing";
import { CheckoutButton } from "./checkout-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  const tp = await getTranslations("pricing");
  return { title: t("pricing"), description: tp("subtitle") };
}

export default async function PricingPage() {
  const [billing, locale, t, tNav] = await Promise.all([
    fetchBillingStatus(),
    getLocale(),
    getTranslations("pricing"),
    getTranslations("nav"),
  ]);

  const PLANS = [
    {
      name: t("freeTitle"),
      price: t("freePrice"),
      period: t("freePeriod"),
      description: t("freeDescription"),
      cta: t("freeCta"),
      primary: false,
    },
    {
      name: t("proTitle"),
      price: t("proPrice"),
      period: t("proPeriod"),
      description: t("proDescription"),
      cta: t("proCta"),
      primary: true,
    },
  ];

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      {billing.isPro && (
        <div className="mx-auto mb-10 max-w-160 rounded-xl border border-accent/40 bg-accent-subtle p-5 text-center">
          <p className="m-0 font-body text-sm text-text-primary">
            {t("alreadyActive", {
              date: billing.proSince
                ? new Date(billing.proSince).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—",
            })}{" "}
            <Link href="/settings" className="underline hover:text-text-secondary">
              {t("manageInSettings")}
            </Link>
          </p>
        </div>
      )}
      <header className="mb-12 text-center">
        <p className="m-0 mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {tNav("pricing")}
        </p>
        <h1 className="m-0 mb-4 font-display text-5xl font-semibold tracking-[-0.03em] text-text-primary sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto m-0 max-w-160 font-body text-lg text-text-secondary">
          {t("subtitle")}
        </p>
      </header>

      <section className="mb-16 grid grid-cols-1 gap-5 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className="flex flex-col gap-5 rounded-2xl border bg-bg-surface p-8"
            style={{
              borderColor: plan.primary
                ? "color-mix(in srgb, var(--color-accent) 40%, var(--color-border))"
                : "var(--color-border-subtle)",
            }}
          >
            <header>
              <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
                {plan.name}
              </p>
              <p className="m-0 flex items-baseline gap-2">
                <span
                  className="font-display text-5xl font-semibold tracking-[-0.025em] text-text-primary"
                  style={plan.primary ? { color: "var(--color-accent)" } : undefined}
                >
                  {plan.price}
                </span>
                <span className="font-mono text-sm text-text-tertiary">{plan.period}</span>
              </p>
              <p className="m-0 mt-3 font-body text-sm text-text-secondary">{plan.description}</p>
            </header>
            <div className="mt-auto">
              {plan.primary ? (
                billing.isPro ? (
                  <span className="inline-flex h-11 items-center justify-center rounded-md border border-accent/40 px-5 font-body text-sm font-medium text-accent">
                    Actif
                  </span>
                ) : (
                  <CheckoutButton label={plan.cta} variant="primary" />
                )
              ) : (
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 font-body text-sm font-semibold text-text-secondary transition-colors duration-200 hover:border-accent/40 hover:text-text-primary"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border-subtle bg-bg-surface p-8 text-center">
        <h2 className="m-0 mb-3 font-display text-2xl font-semibold tracking-tight text-text-primary">
          {t("noLock")}
        </h2>
        <p className="mx-auto m-0 max-w-140 font-body text-sm text-text-secondary">
          {t("noLockBody")}
        </p>
      </section>
    </main>
  );
}
