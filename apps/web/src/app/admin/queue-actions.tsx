"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminReportItem } from "@miru/types";
import { deleteReportTarget, dismissReport } from "@/lib/reports-api";

export function QueueActions({ report }: { report: AdminReportItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(action: "dismiss" | "delete") {
    setBusy(true);
    setError(null);
    const res =
      action === "dismiss"
        ? await dismissReport(report.id)
        : await deleteReportTarget(report.id, report.targetKind, report.targetId);
    if ("error" in res) {
      setError(res.error);
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handle("dismiss")}
          disabled={busy}
          className="inline-flex h-9 items-center rounded-md border border-border bg-bg-base px-3 font-body text-xs text-text-secondary transition-colors duration-200 hover:border-accent/40 hover:text-text-primary disabled:opacity-50"
        >
          Ignorer
        </button>
        <button
          type="button"
          onClick={() => handle("delete")}
          disabled={busy}
          className="inline-flex h-9 items-center rounded-md border border-error/40 bg-error-muted px-3 font-body text-xs font-medium text-error transition-colors duration-200 hover:bg-error/20 disabled:opacity-50"
        >
          Supprimer le contenu
        </button>
      </div>
      {error && <span className="font-body text-xs text-error">{error}</span>}
    </div>
  );
}
