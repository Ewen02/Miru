"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@miru/ui";
import { API_URL } from "@/lib/env";

/**
 * GDPR data export. Calls GET /users/me/export, slurps the JSON, and
 * triggers a client-side download with a date-stamped filename. The API
 * returns the blob inline so we never persist it server-side — the user's
 * machine is the only copy.
 */
export function DataExportSection() {
  const t = useTranslations("settingsPage");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${API_URL}/users/me/export`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const stamp = new Date().toISOString().slice(0, 10);
        const a = document.createElement("a");
        a.href = url;
        a.download = `miru-export-${stamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <h3 className="m-0 mb-2 font-display text-sm font-semibold text-text-primary">
        {t("exportTitle")}
      </h3>
      <p className="m-0 mb-4 font-body text-xs leading-relaxed text-text-secondary">
        {t("exportHint")}
      </p>
      <Button type="button" variant="outline" onClick={handleExport} disabled={pending}>
        {pending ? t("exportPending") : t("exportCta")}
      </Button>
      {error && (
        <p role="alert" className="mt-3 font-body text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
