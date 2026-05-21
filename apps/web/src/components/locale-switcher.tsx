import { getLocale, getTranslations } from "next-intl/server";
import { setLocaleAction } from "@/i18n/actions";
import { LOCALES } from "@/i18n/config";

/**
 * Server-rendered switcher. Two compact buttons, each is its own form so
 * clicking switches without JS. Active locale is shown with the accent.
 */
export async function LocaleSwitcher() {
  const [current, t] = await Promise.all([getLocale(), getTranslations("locales")]);
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-surface p-0.5">
      {LOCALES.map((loc) => {
        const isActive = loc === current;
        return (
          <form key={loc} action={setLocaleAction}>
            <input type="hidden" name="locale" value={loc} />
            <button
              type="submit"
              aria-pressed={isActive}
              className="h-7 rounded-sm px-2 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200"
              style={{
                backgroundColor: isActive ? "var(--color-accent)" : "transparent",
                color: isActive ? "var(--color-bg-base)" : "var(--color-text-secondary)",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {t(loc)}
            </button>
          </form>
        );
      })}
    </div>
  );
}
