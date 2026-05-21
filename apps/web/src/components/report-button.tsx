"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ReportReason, ReportTargetKind } from "@miru/types";
import { fileReport } from "@/lib/reports-api";

const REASONS: ReportReason[] = ["SPAM", "ABUSE", "OFFTOPIC", "OTHER"];

const REASON_KEY: Record<ReportReason, string> = {
  SPAM: "reasonSpam",
  ABUSE: "reasonAbuse",
  OFFTOPIC: "reasonOfftopic",
  OTHER: "reasonOther",
};

export function ReportButton({
  targetKind,
  targetId,
}: {
  targetKind: ReportTargetKind;
  targetId: string;
}) {
  const t = useTranslations("components.report");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("ABUSE");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setStatus("sending");
    setError(null);
    const res = await fileReport({
      targetKind,
      targetId,
      reason,
      details: details.trim() || undefined,
    });
    if ("error" in res) {
      setError(res.error);
      setStatus("error");
      return;
    }
    setStatus("sent");
    setTimeout(() => {
      setOpen(false);
      setStatus("idle");
      setDetails("");
    }, 1500);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        aria-label={t("trigger")}
      >
        {t("trigger")}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-border bg-bg-base p-3">
      <p className="m-0 mb-2 font-body text-xs text-text-secondary">
        {t("reasonLabel")}
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className="rounded-sm border px-2 py-1 font-body text-xs transition-colors duration-200"
            style={{
              borderColor:
                reason === r
                  ? "color-mix(in srgb, var(--color-accent) 40%, var(--color-border))"
                  : "var(--color-border)",
              color:
                reason === r
                  ? "var(--color-accent)"
                  : "var(--color-text-secondary)",
            }}
          >
            {t(REASON_KEY[r])}
          </button>
        ))}
      </div>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder={t("detailsPlaceholder")}
        maxLength={500}
        className="mb-3 w-full resize-none rounded-md border border-border bg-bg-base px-2 py-1.5 font-body text-xs text-text-primary"
        rows={2}
      />
      <div className="flex items-center justify-end gap-2">
        {error && <span className="mr-auto font-body text-xs text-error">{error}</span>}
        {status === "sent" && (
          <span className="mr-auto font-body text-xs text-success">{t("sent")}</span>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-body text-xs text-text-tertiary hover:text-text-secondary"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={status === "sending" || status === "sent"}
          className="inline-flex h-8 items-center rounded-md border border-transparent bg-accent px-3 font-body text-xs font-medium text-bg-base transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>
      </div>
    </div>
  );
}
