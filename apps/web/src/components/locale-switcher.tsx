"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/config";

/**
 * Locale switcher. Re-navigates to the current pathname under the chosen
 * locale via next-intl's locale-aware router, so the URL prefix updates and
 * the choice is persisted in the NEXT_LOCALE cookie. Active locale shows accent.
 */
export function LocaleSwitcher() {
  const current = useLocale();
  const t = useTranslations("locales");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-surface p-0.5">
      {LOCALES.map((loc) => {
        const isActive = loc === current;
        return (
          <button
            key={loc}
            type="button"
            aria-pressed={isActive}
            onClick={() => router.replace(pathname, { locale: loc })}
            className="h-7 rounded-sm px-2 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200"
            style={{
              backgroundColor: isActive ? "var(--color-accent)" : "transparent",
              color: isActive ? "var(--color-bg-base)" : "var(--color-text-secondary)",
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {t(loc)}
          </button>
        );
      })}
    </div>
  );
}
