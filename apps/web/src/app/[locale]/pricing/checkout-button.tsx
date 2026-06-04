"use client";

import { useState } from "react";
import { startCheckout } from "@/lib/billing-api";

interface Props {
  label: string;
  variant?: "primary" | "secondary";
}

export function CheckoutButton({ label, variant = "primary" }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setBusy(true);
    setError(null);
    const res = await startCheckout();
    if ("error" in res) {
      setError(res.error);
      setBusy(false);
      return;
    }
    window.location.href = res.url;
  }

  const styles =
    variant === "primary"
      ? "border-transparent bg-accent text-bg-base hover:opacity-90"
      : "border-border bg-bg-base text-text-primary hover:border-accent/40";

  return (
    <>
      <button
        type="button"
        onClick={handle}
        disabled={busy}
        className={`inline-flex h-10 items-center justify-center rounded-md border px-5 font-body text-sm font-medium transition-colors duration-200 disabled:opacity-50 ${styles}`}
      >
        {busy ? "Redirection…" : label}
      </button>
      {error && <p className="m-0 mt-2 font-body text-xs text-error">{error}</p>}
    </>
  );
}
