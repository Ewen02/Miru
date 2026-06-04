"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { UserPreferencesDto } from "@miru/types";
import { updatePreferences, type UserPreferencesPatch } from "@/lib/preferences-api";

interface Props {
  initial: UserPreferencesDto;
}

type ToggleKey =
  | "emailNewEpisodes"
  | "emailWeeklyRecap"
  | "emailReviewReply"
  | "emailNewFollower"
  | "inAppEpisodeAired"
  | "inAppRecommendation"
  | "inAppMention";

/**
 * Optimistic toggles. Each switch flips local state immediately, then
 * PATCHes the API; on failure the toggle reverts and an inline error
 * is shown. Updates are bundled in a `useTransition` so React shows
 * the busy state without blocking other interactions.
 */
export function NotificationsSection({ initial }: Props) {
  const t = useTranslations("settings");
  const [prefs, setPrefs] = useState<UserPreferencesDto>(initial);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function setToggle(key: ToggleKey, next: boolean) {
    const previous = prefs[key];
    setPrefs({ ...prefs, [key]: next });
    setError(null);
    startTransition(async () => {
      const patch: UserPreferencesPatch = { [key]: next };
      const res = await updatePreferences(patch);
      if ("error" in res) {
        // Roll back.
        setPrefs((current) => ({ ...current, [key]: previous }));
        setError(res.error);
      } else {
        setPrefs(res);
      }
    });
  }

  return (
    <>
      <section>
        <header className="mb-5">
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
            {t("emailNotifsTitle")}
          </h2>
          <p className="m-0 mt-1 font-body text-sm text-text-tertiary">
            {t("emailNotifsSubtitle")}
          </p>
        </header>
        <div className="rounded-2xl border border-border-subtle bg-bg-surface divide-y divide-border-subtle">
          <ToggleRow
            label={t("emailNewEpisodes")}
            description={t("emailNewEpisodesDesc")}
            on={prefs.emailNewEpisodes}
            onChange={(v) => setToggle("emailNewEpisodes", v)}
          />
          <ToggleRow
            label={t("emailWeeklyRecap")}
            description={t("emailWeeklyRecapDesc")}
            on={prefs.emailWeeklyRecap}
            onChange={(v) => setToggle("emailWeeklyRecap", v)}
          />
          <ToggleRow
            label={t("emailComments")}
            description={t("emailCommentsDesc")}
            on={prefs.emailReviewReply}
            onChange={(v) => setToggle("emailReviewReply", v)}
          />
          <ToggleRow
            label={t("emailFollowers")}
            description={t("emailFollowersDesc")}
            on={prefs.emailNewFollower}
            onChange={(v) => setToggle("emailNewFollower", v)}
          />
        </div>
      </section>

      <section>
        <header className="mb-5">
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
            {t("inAppTitle")}
          </h2>
        </header>
        <div className="rounded-2xl border border-border-subtle bg-bg-surface divide-y divide-border-subtle">
          <ToggleRow
            label={t("inAppAired")}
            description={t("inAppAiredDesc")}
            on={prefs.inAppEpisodeAired}
            onChange={(v) => setToggle("inAppEpisodeAired", v)}
          />
          <ToggleRow
            label={t("inAppRecos")}
            on={prefs.inAppRecommendation}
            onChange={(v) => setToggle("inAppRecommendation", v)}
          />
          <ToggleRow
            label={t("inAppMentions")}
            on={prefs.inAppMention}
            onChange={(v) => setToggle("inAppMention", v)}
          />
        </div>
        {error && (
          <p className="mt-2 font-body text-xs text-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </>
  );
}

function ToggleRow({
  label,
  description,
  on,
  onChange,
}: {
  label: string;
  description?: string;
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="m-0 font-body text-sm font-medium text-text-primary">{label}</p>
        {description && (
          <p className="m-0 mt-0.5 font-body text-xs text-text-tertiary">{description}</p>
        )}
      </div>
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span
        aria-hidden
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-md transition-colors duration-150"
        style={{
          backgroundColor: on ? "var(--color-accent)" : "var(--color-bg-elevated)",
        }}
      >
        <span
          className="inline-block h-3.5 w-3.5 transform rounded-sm bg-white transition-transform duration-200"
          style={{ transform: on ? "translateX(20px)" : "translateX(3px)" }}
        />
      </span>
    </label>
  );
}
