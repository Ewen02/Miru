"use client";

import { useState } from "react";

interface ShareButtonProps {
  year: number;
  completedCount: number;
  hoursWatched: number;
  topGenreLabel: string | null;
}

/**
 * Client share button — generates a tweet intent + clipboard copy with the
 * canonical Miru tagline. We don't post the year-in-review URL itself (it's
 * auth-gated) — we share the public landing instead.
 */
export function ShareButton({
  year,
  completedCount,
  hoursWatched,
  topGenreLabel,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const text = buildShareText({ year, completedCount, hoursWatched, topGenreLabel });
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miru.app";

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // best-effort, no fallback
    }
  }

  function openTwitter() {
    const intentUrl = new URL("https://twitter.com/intent/tweet");
    intentUrl.searchParams.set("text", text);
    intentUrl.searchParams.set("url", url);
    window.open(intentUrl.toString(), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={openTwitter}
        className="inline-flex h-11 items-center rounded-md px-5 font-body text-sm font-semibold"
        style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
      >
        Partager sur X
      </button>
      <button
        type="button"
        onClick={copyToClipboard}
        className="inline-flex h-11 items-center rounded-md border border-border bg-bg-surface px-5 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
      >
        {copied ? "Copié ✓" : "Copier le résumé"}
      </button>
    </div>
  );
}

function buildShareText({
  year,
  completedCount,
  hoursWatched,
  topGenreLabel,
}: ShareButtonProps): string {
  const parts: string[] = [];
  parts.push(`Mon année anime ${year} sur Miru :`);
  parts.push(
    `${completedCount} anime terminés · ${hoursWatched.toLocaleString("fr-FR")} heures regardées`,
  );
  if (topGenreLabel) {
    parts.push(`Genre dominant : ${topGenreLabel}.`);
  }
  return parts.join("\n");
}
