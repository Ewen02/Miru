"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@miru/ui";

const STORAGE_KEY = "miru:sentry-disclosure-dismissed";
// Two-week silence after dismiss. We re-surface periodically so users who
// dismissed without reading remain in the loop on what's being collected.
const DISMISS_TTL_DAYS = 14;

/**
 * GDPR-flavoured disclosure: "we use Sentry to collect anonymised error
 * traces, no advertising cookies." Compact, dismissible, persistent.
 *
 * Server doesn't know whether the user has dismissed (cookies vs local
 * storage) — render as a no-op on the server, hydrate the actual state
 * after mount. Brief flash on first load is acceptable.
 */
export function SentryDisclosure() {
  const t = useTranslations("sentryDisclosure");
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setOpen(true);
        return;
      }
      const at = Number(raw);
      if (!Number.isFinite(at) || Date.now() - at > DISMISS_TTL_DAYS * 86_400_000) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Storage blocked — banner just re-appears next load, no harm.
    }
  }

  if (!hydrated || !open) return null;

  return (
    <div
      role="dialog"
      aria-label={t("ariaLabel")}
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-3xl items-start gap-3",
        "rounded-xl border border-border bg-bg-surface px-4 py-3 shadow-xl shadow-bg-base/50 backdrop-blur",
        "sm:inset-x-6",
      )}
    >
      <span
        aria-hidden
        className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: "var(--color-accent)" }}
      />
      <div className="flex-1 text-sm">
        <p className="m-0 font-body text-text-secondary">
          <strong className="font-semibold text-text-primary">{t("title")}</strong>{" "}
          {t("body")}{" "}
          <Link href="/privacy" className="underline hover:text-text-primary">
            {t("readMore")}
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className={cn(
          "-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          "text-text-tertiary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        )}
      >
        ✕
      </button>
    </div>
  );
}
