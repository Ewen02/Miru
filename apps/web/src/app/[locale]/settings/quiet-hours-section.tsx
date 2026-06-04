"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { UserPreferencesDto } from "@miru/types";
import { updatePreferences } from "@/lib/preferences-api";

interface Props {
  initial: UserPreferencesDto;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function timeStringToHour(value: string): number | null {
  // <input type="time"> always returns "HH:mm". We keep only the hour;
  // minute resolution would imply per-minute cron evaluation which is
  // overkill for "quiet hours".
  const match = value.match(/^(\d{2}):/);
  if (!match) return null;
  const hour = Number(match[1]);
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
}

export function QuietHoursSection({ initial }: Props) {
  const t = useTranslations("settings");
  const [from, setFrom] = useState<number | null>(initial.quietFromHour);
  const [to, setTo] = useState<number | null>(initial.quietToHour);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function persist(nextFrom: number | null, nextTo: number | null) {
    setError(null);
    const fromSet = nextFrom != null;
    const toSet = nextTo != null;
    // Only persist when both are set (enabled) or both null (disabled).
    if (fromSet !== toSet) return;
    startTransition(async () => {
      const res = await updatePreferences({
        quietFromHour: nextFrom,
        quietToHour: nextTo,
      });
      if ("error" in res) {
        setError(res.error);
        // Revert.
        setFrom(initial.quietFromHour);
        setTo(initial.quietToHour);
      }
    });
  }

  const enabled = from != null && to != null;

  function handleEnable() {
    const f = 22;
    const tt = 8;
    setFrom(f);
    setTo(tt);
    persist(f, tt);
  }

  function handleDisable() {
    setFrom(null);
    setTo(null);
    persist(null, null);
  }

  return (
    <section>
      <header className="mb-5">
        <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
          {t("quietTitle")}
        </h2>
        <p className="m-0 mt-1 font-body text-sm text-text-tertiary">
          {t("quietSubtitle")}
        </p>
      </header>
      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
        {!enabled ? (
          <button
            type="button"
            onClick={handleEnable}
            disabled={pending}
            className="inline-flex h-10 items-center rounded-md border border-border px-4 font-body text-sm font-medium text-text-primary transition-colors duration-200 hover:bg-bg-elevated disabled:opacity-50"
          >
            {t("quietEnable")}
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <TimeField
              label={t("quietFrom")}
              value={`${pad(from)}:00`}
              disabled={pending}
              onChange={(v) => {
                const h = timeStringToHour(v);
                if (h == null) return;
                setFrom(h);
                persist(h, to);
              }}
            />
            <TimeField
              label={t("quietTo")}
              value={`${pad(to)}:00`}
              disabled={pending}
              onChange={(v) => {
                const h = timeStringToHour(v);
                if (h == null) return;
                setTo(h);
                persist(from, h);
              }}
            />
            <span className="font-mono text-[10px] text-text-tertiary">
              {t("quietTimezone")}
            </span>
            <button
              type="button"
              onClick={handleDisable}
              disabled={pending}
              className="ml-auto font-mono text-[10px] uppercase tracking-wider text-text-tertiary hover:text-text-secondary disabled:opacity-50"
            >
              {t("quietDisable")}
            </button>
          </div>
        )}
        {error && (
          <p className="mt-3 font-body text-xs text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

function TimeField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
        {label}
      </span>
      <input
        type="time"
        value={value}
        step={3600}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-border bg-bg-base px-2 font-mono text-sm text-text-primary disabled:opacity-50"
      />
    </label>
  );
}
