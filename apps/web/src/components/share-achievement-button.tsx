"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@miru/ui";

interface ShareAchievementButtonProps {
  badgeName: string;
  badgeDescription: string;
  /** Public link to the achievement (currently /achievements — adapt when a per-code page lands). */
  href: string;
  className?: string;
}

const COPIED_RESET_MS = 2400;

/**
 * Single button that opens a tiny popover with three share affordances:
 *  - Twitter / X intent
 *  - Discord (copy a formatted snippet that pastes nicely)
 *  - Copy raw link
 *
 * Keeps the component fully client-side so we never round-trip a clipboard
 * write through the server. The copy ack is local state with a 2.4s reset.
 */
export function ShareAchievementButton({
  badgeName,
  badgeDescription,
  href,
  className,
}: ShareAchievementButtonProps) {
  const t = useTranslations("components.shareAchievement");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"link" | "discord" | null>(null);

  const absoluteUrl = buildAbsolute(href);
  const tweetText = t("tweetText", { badge: badgeName });
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(absoluteUrl)}`;
  const discordSnippet = `🏆 ${badgeName} — ${badgeDescription}\n${absoluteUrl}`;

  async function copy(text: string, kind: "link" | "discord") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), COPIED_RESET_MS);
    } catch {
      // Permission denied or insecure context — keep the popover open with
      // a hint by leaving copied=null. User can still long-press the link.
    }
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex h-7 items-center gap-1 rounded-md border border-border-subtle bg-bg-surface px-2",
          "font-mono text-[10px] uppercase tracking-wider text-text-tertiary",
          "transition-colors duration-150 hover:border-border hover:text-text-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        )}
      >
        <ShareIcon />
        {t("share")}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-transparent"
            tabIndex={-1}
          />
          <div
            role="menu"
            className={cn(
              "absolute right-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-lg",
              "border border-border bg-bg-surface shadow-lg shadow-bg-base/40",
            )}
          >
            <a
              href={tweetHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block px-3 py-2 font-body text-xs text-text-secondary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary"
            >
              {t("twitter")}
            </a>
            <button
              type="button"
              onClick={() => copy(discordSnippet, "discord")}
              role="menuitem"
              className="block w-full px-3 py-2 text-left font-body text-xs text-text-secondary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary"
            >
              {copied === "discord" ? t("copied") : t("discord")}
            </button>
            <button
              type="button"
              onClick={() => copy(absoluteUrl, "link")}
              role="menuitem"
              className="block w-full border-t border-border-subtle px-3 py-2 text-left font-body text-xs text-text-secondary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary"
            >
              {copied === "link" ? t("copied") : t("copyLink")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function buildAbsolute(href: string): string {
  if (href.startsWith("http")) return href;
  if (typeof window === "undefined") return href;
  return new URL(href, window.location.origin).toString();
}

function ShareIcon() {
  return (
    <svg
      width="11"
      height="11"
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
