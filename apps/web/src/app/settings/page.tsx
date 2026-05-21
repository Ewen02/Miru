import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PushToggle } from "./push-toggle";
import { BillingSection } from "./billing-section";
import { fetchBillingStatus } from "@/lib/server-billing";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function SettingsPage() {
  const [billing, t] = await Promise.all([fetchBillingStatus(), getTranslations("settings")]);

  const TABS: Array<{ key: string; label: string }> = [
    { key: "account", label: t("tabAccount") },
    { key: "notifications", label: t("tabNotifications") },
    { key: "privacy", label: t("tabPrivacy") },
    { key: "appearance", label: t("tabAppearance") },
    { key: "advanced", label: t("tabAdvanced") },
  ];

  return (
    <main className="mx-auto max-w-300 px-7 pb-20 pt-12">
      <header className="mb-10">
        <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          {t("eyebrowPreferences")}
        </p>
        <h1 className="m-0 font-display text-4xl font-semibold tracking-[-0.025em] text-text-primary sm:text-5xl">
          {t("metaTitle")}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-col gap-1" aria-label={t("sectionsAria")}>
          {TABS.map((tab) => {
            const active = tab.key === "notifications";
            return (
              <Link
                key={tab.key}
                href="/settings"
                className="inline-flex items-center rounded-md px-3 py-2 font-body text-sm transition-colors duration-150"
                style={{
                  backgroundColor: active ? "var(--color-bg-elevated)" : "transparent",
                  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-10">
          <BillingSection isPro={billing.isPro} proSince={billing.proSince} />

          <section>
            <header className="mb-5">
              <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
                {t("language")}
              </h2>
              <p className="m-0 mt-1 font-body text-sm text-text-tertiary">
                {t("languageDescription")}
              </p>
            </header>
            <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
              <LocaleSwitcher />
            </div>
          </section>

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
                defaultOn
              />
              <ToggleRow
                label={t("emailWeeklyRecap")}
                description={t("emailWeeklyRecapDesc")}
                defaultOn
              />
              <ToggleRow label={t("emailComments")} description={t("emailCommentsDesc")} />
              <ToggleRow label={t("emailFollowers")} description={t("emailFollowersDesc")} />
            </div>
          </section>

          <section>
            <header className="mb-5">
              <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
                {t("inAppTitle")}
              </h2>
            </header>
            <div className="rounded-2xl border border-border-subtle bg-bg-surface divide-y divide-border-subtle">
              <PushToggle />
              <ToggleRow
                label={t("inAppAired")}
                description={t("inAppAiredDesc")}
                defaultOn
              />
              <ToggleRow label={t("inAppRecos")} defaultOn />
              <ToggleRow label={t("inAppMentions")} defaultOn />
            </div>
          </section>

          <section>
            <header className="mb-5">
              <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
                {t("quietTitle")}
              </h2>
              <p className="m-0 mt-1 font-body text-sm text-text-tertiary">
                {t("quietSubtitle")}
              </p>
            </header>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border-subtle bg-bg-surface p-5">
              <TimeField label={t("quietFrom")} defaultValue="22:00" />
              <TimeField label={t("quietTo")} defaultValue="08:00" />
              <span className="font-mono text-[10px] text-text-tertiary">
                {t("quietTimezone")}
              </span>
            </div>
          </section>

          <section>
            <header className="mb-5">
              <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-error">
                {t("dangerTitle")}
              </h2>
            </header>
            <div className="rounded-2xl border border-error/30 bg-error-muted p-5">
              <p className="m-0 mb-3 font-body text-sm text-text-secondary">
                {t("dangerDescription")}
              </p>
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-md border border-error/40 bg-bg-base px-4 font-body text-sm font-medium text-error transition-colors duration-200 hover:bg-error-muted"
              >
                {t("dangerCta")}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ToggleRow({
  label,
  description,
  defaultOn,
}: {
  label: string;
  description?: string;
  defaultOn?: boolean;
}) {
  return (
    <label className="flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="m-0 font-body text-sm font-medium text-text-primary">{label}</p>
        {description && (
          <p className="m-0 mt-0.5 font-body text-xs text-text-tertiary">{description}</p>
        )}
      </div>
      <span
        aria-hidden
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-md"
        style={{
          backgroundColor: defaultOn
            ? "var(--color-accent)"
            : "var(--color-bg-elevated)",
        }}
      >
        <span
          className="inline-block h-3.5 w-3.5 transform rounded-sm bg-white transition-transform duration-200"
          style={{ transform: defaultOn ? "translateX(20px)" : "translateX(3px)" }}
        />
      </span>
    </label>
  );
}

function TimeField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
        {label}
      </span>
      <input
        type="time"
        defaultValue={defaultValue}
        className="h-9 rounded-md border border-border bg-bg-base px-2 font-mono text-sm text-text-primary"
      />
    </label>
  );
}
