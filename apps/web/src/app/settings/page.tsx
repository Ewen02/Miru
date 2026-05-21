import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PushToggle } from "./push-toggle";
import { BillingSection } from "./billing-section";
import { NotificationsSection } from "./notifications-section";
import { QuietHoursSection } from "./quiet-hours-section";
import { DeleteAccountSection } from "./delete-account-section";
import { SignOutButton } from "./sign-out-button";
import { fetchBillingStatus } from "@/lib/server-billing";
import { fetchUserPreferences } from "@/lib/server-preferences";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const TAB_KEYS = ["account", "notifications", "privacy", "appearance", "advanced"] as const;

export default async function SettingsPage() {
  const [billing, prefs, t] = await Promise.all([
    fetchBillingStatus(),
    fetchUserPreferences(),
    getTranslations("settings"),
  ]);

  const tabs = TAB_KEYS.map((key) => ({
    key,
    label: t(`tab${key.charAt(0).toUpperCase() + key.slice(1)}` as Parameters<typeof t>[0]),
    href: `#${key}`,
  }));

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
        <nav
          className="flex flex-col gap-1 md:sticky md:top-20 md:self-start"
          aria-label={t("sectionsAria")}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className="inline-flex items-center rounded-md px-3 py-2 font-body text-sm text-text-secondary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary"
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-10">
          <section id="account" className="flex flex-col gap-6">
            <BillingSection isPro={billing.isPro} proSince={billing.proSince} />
            <div className="flex justify-end">
              <SignOutButton />
            </div>
          </section>

          <section id="appearance">
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

          <section id="notifications" className="scroll-mt-20 flex flex-col gap-10">
            <NotificationsSection initial={prefs} />

            <div>
              <header className="mb-5">
                <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
                  {t("inAppTitle")}
                </h2>
              </header>
              <div className="rounded-2xl border border-border-subtle bg-bg-surface p-1">
                <PushToggle />
              </div>
            </div>

            <QuietHoursSection initial={prefs} />
          </section>

          <section id="privacy" className="scroll-mt-20">
            {/* Placeholder — data export endpoint shipping next release. */}
            <header className="mb-5">
              <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
                {t("tabPrivacy")}
              </h2>
              <p className="m-0 mt-1 font-body text-sm text-text-tertiary">
                {t("privacyHint")}
              </p>
            </header>
          </section>

          <section id="advanced" className="scroll-mt-20">
            <DeleteAccountSection />
          </section>
        </div>
      </div>
    </main>
  );
}
