"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  /** Display name used as the share text — kept human, the URL has the slug. */
  name: string;
}

/**
 * Web Share API when available (mobile + recent Chromium desktop),
 * clipboard fallback otherwise. The fallback flashes "Copié" for 2s
 * so the user gets visual confirmation; failures (clipboard blocked,
 * user dismissed sheet) stay silent — there's no useful recovery.
 */
export function ShareProfileButton({ name }: Props) {
  const t = useTranslations("profilePublic");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: `${name} — Miru`, url };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled the sheet, or share unsupported on this content.
        // Fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No-op — clipboard blocked (Safari iframe, http context, …).
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={t("shareAria")}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-bg-surface px-3 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
    >
      <ShareIcon />
      {copied ? t("shareCopied") : t("shareLabel")}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
