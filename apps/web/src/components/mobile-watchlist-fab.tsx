"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { WatchStatus, type WatchlistEntry } from "@miru/types";
import { cn } from "@miru/ui";
import { watchlistApi } from "@/lib/watchlist-api";

interface MobileWatchlistFabProps {
  animeId: string;
  initialEntry: WatchlistEntry | null;
  isAuthenticated: boolean;
}

/**
 * S1-05 — sticky floating action button at the bottom-right of the anime
 * detail page on mobile only (md:hidden). When the user has no entry yet,
 * tapping it adds to watchlist as PLANNED and the button disappears.
 *
 * Two reasons it exists alongside WatchlistButton:
 *  - On mobile, WatchlistButton scrolls out of view past the hero, and
 *    users abandon. A persistent thumb-reach affordance lifts add rate.
 *  - Once the user has an entry, the FAB hides — episode tracking +
 *    rating live in the full WatchlistButton stepper.
 *
 * The mobile bottom nav is 56px tall, so we offset bottom-20 to clear it.
 */
export function MobileWatchlistFab({
  animeId,
  initialEntry,
  isAuthenticated,
}: MobileWatchlistFabProps) {
  const router = useRouter();
  const t = useTranslations("components.watchlist");
  const [entry, setEntry] = useState<WatchlistEntry | null>(initialEntry);
  const [pending, startTransition] = useTransition();

  // Already tracked or anonymous → nothing to add quickly, hide.
  if (entry || !isAuthenticated) return null;

  function handleAdd() {
    startTransition(async () => {
      try {
        const updated = await watchlistApi.add(animeId, WatchStatus.PLANNED);
        setEntry(updated);
        router.refresh();
      } catch {
        // Silent — the full WatchlistButton above will surface the error
        // through its own UI on retry.
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={pending}
      aria-label={t("addLong")}
      className={cn(
        "fixed right-4 bottom-20 z-30 inline-flex h-12 items-center gap-2 rounded-full",
        "px-5 font-body text-sm font-semibold shadow-lg shadow-bg-base/40 backdrop-blur",
        "transition-transform duration-150 active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-60 md:hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
      )}
      style={{ backgroundColor: "var(--color-accent)", color: "var(--color-on-accent)" }}
    >
      <PlusIcon />
      {pending ? t("adding") : t("addShort")}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
