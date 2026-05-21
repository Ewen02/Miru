"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { openBillingPortal, startCheckout } from "@/lib/billing-api";

interface Props {
  isPro: boolean;
  proSince: string | null;
}

export function BillingSection({ isPro, proSince }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("settings");
  const locale = useLocale();

  async function handle() {
    setBusy(true);
    setError(null);
    const res = isPro ? await openBillingPortal() : await startCheckout();
    if ("error" in res) {
      setError(res.error);
      setBusy(false);
      return;
    }
    window.location.href = res.url;
  }

  const dateLabel = proSince ? new Date(proSince).toLocaleDateString(locale) : "—";

  return (
    <section>
      <header className="mb-5">
        <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
          {t("billingTitle")}
        </h2>
        <p className="m-0 mt-1 font-body text-sm text-text-tertiary">
          {isPro
            ? t("billingActiveDescription", { date: dateLabel })
            : t("billingInactiveDescription")}
        </p>
      </header>
      <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-5">
        <button
          type="button"
          onClick={handle}
          disabled={busy}
          className="inline-flex h-10 items-center rounded-md border border-transparent bg-accent px-5 font-body text-sm font-medium text-bg-base transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
        >
          {busy
            ? `${t("manageBilling")}…`
            : isPro
              ? t("manageBilling")
              : t("becomeSympathisant")}
        </button>
        {error && <span className="font-body text-xs text-error">{error}</span>}
      </div>
    </section>
  );
}
