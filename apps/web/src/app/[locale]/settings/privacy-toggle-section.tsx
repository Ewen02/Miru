"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@miru/ui";
import { API_URL } from "@/lib/env";

interface PrivacyToggleSectionProps {
  initialIsPrivate: boolean;
}

/**
 * Toggles UserPreferences.isPrivate via PATCH /users/me/preferences. When
 * enabled, /u/[handle] returns 404 to anyone but the owner (the use case
 * leaks no signal — a private account is indistinguishable from a missing
 * one).
 */
export function PrivacyToggleSection({ initialIsPrivate }: PrivacyToggleSectionProps) {
  const t = useTranslations("settingsPage");
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(next: boolean) {
    setError(null);
    setIsPrivate(next); // optimistic
    startTransition(async () => {
      try {
        const res = await fetch(`${API_URL}/users/me/preferences`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPrivate: next }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        setIsPrivate(!next); // rollback
        setError((err as Error).message);
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="m-0 mb-2 font-display text-sm font-semibold text-text-primary">
            {t("privacyToggleTitle")}
          </h3>
          <p className="m-0 font-body text-xs leading-relaxed text-text-secondary">
            {t("privacyToggleHint")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPrivate}
          onClick={() => toggle(!isPrivate)}
          disabled={pending}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isPrivate ? "bg-accent" : "bg-bg-elevated",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-text-primary transition-transform duration-200",
              isPrivate ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 font-body text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
