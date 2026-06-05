"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@miru/ui";

interface HomeBannersProps {
  /**
   * Snapshot from GET /users/me/onboarding/snapshot fetched by the page.
   * Null for anonymous visitors (banners stay hidden).
   */
  snapshot: {
    onboardedAt: string | null;
    watchlistCount: number;
    daysSinceJoined: number;
    shouldNudgeImport: boolean;
  } | null;
  /** Logged-in flag: skip the email banner if the session reports verified. */
  emailVerified: boolean;
}

const DISMISS_PREFIX = "miru:banner-dismissed:";
const DISMISS_TTL_DAYS = 14;
const SUCCESS_TTL_MS = 8000;

type DismissibleKey = "import" | "verify";

/**
 * Two new-user banners + one post-onboarding success toast. All client-side
 * so the home page itself stays a Server Component; dismissals live in
 * localStorage so they survive navigation without touching the DB.
 *
 * Visibility rules:
 *  - Success toast: shows once when ?onboarded=true is on the URL, then
 *    the query param is stripped so a refresh doesn't re-fire it.
 *  - Import banner: snapshot.shouldNudgeImport === true && not dismissed.
 *  - Verify banner: emailVerified === false && not dismissed.
 *
 * The two persistent banners are sticky-bottom on mobile, top of content on
 * desktop — least intrusive given the design system's dark layout.
 */
export function HomeBanners({ snapshot, emailVerified }: HomeBannersProps) {
  const router = useRouter();
  const search = useSearchParams();
  const onboardedFlag = search?.get("onboarded") === "true";

  const [successOpen, setSuccessOpen] = useState(onboardedFlag);
  const [dismissed, setDismissed] = useState<Record<DismissibleKey, boolean>>({
    import: false,
    verify: false,
  });

  // Read dismiss state once on mount — guarded so SSR matches CSR.
  useEffect(() => {
    setDismissed({
      import: isDismissed("import"),
      verify: isDismissed("verify"),
    });
  }, []);

  // Strip ?onboarded=true after first render so refresh doesn't replay the toast.
  useEffect(() => {
    if (!onboardedFlag) return;
    const params = new URLSearchParams(search ?? undefined);
    params.delete("onboarded");
    router.replace(params.size > 0 ? `/?${params.toString()}` : "/", { scroll: false });
  }, [onboardedFlag, router, search]);

  // Auto-dismiss the success toast after a few seconds.
  useEffect(() => {
    if (!successOpen) return;
    const t = window.setTimeout(() => setSuccessOpen(false), SUCCESS_TTL_MS);
    return () => window.clearTimeout(t);
  }, [successOpen]);

  function dismiss(key: DismissibleKey) {
    persistDismiss(key);
    setDismissed((prev) => ({ ...prev, [key]: true }));
  }

  const showImport = snapshot?.shouldNudgeImport === true && !dismissed.import;
  const showVerify = snapshot !== null && !emailVerified && !dismissed.verify;

  if (!successOpen && !showImport && !showVerify) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-3 px-4 sm:bottom-6">
      {successOpen && (
        <Toast variant="success" onClose={() => setSuccessOpen(false)}>
          <strong className="font-semibold">Bienvenue dans Miru.</strong>{" "}
          <span className="text-text-secondary">
            Tes choix sont enregistrés.{" "}
            <Link
              href="/for-you"
              className="underline decoration-text-tertiary/60 underline-offset-2 hover:text-text-primary"
            >
              Voir tes recommandations
            </Link>
          </span>
        </Toast>
      )}

      {showImport && (
        <Toast variant="info" onClose={() => dismiss("import")}>
          <span>
            <strong className="font-semibold">Tu as déjà une liste ailleurs ?</strong>{" "}
            <span className="text-text-secondary">
              Importe-la depuis ton compte AniList en 30 secondes.
            </span>
          </span>
          <Link
            href="/onboard"
            className="ml-3 inline-flex h-8 shrink-0 items-center rounded-md px-3 font-mono text-[11px] uppercase tracking-wider"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-on-accent)" }}
          >
            Importer
          </Link>
        </Toast>
      )}

      {showVerify && (
        <Toast variant="warn" onClose={() => dismiss("verify")}>
          <span>
            <strong className="font-semibold">Vérifie ton email.</strong>{" "}
            <span className="text-text-secondary">
              Confirme l'adresse pour sécuriser ton compte — le lien est dans ta boîte.
            </span>
          </span>
        </Toast>
      )}
    </div>
  );
}

interface ToastProps {
  variant: "success" | "info" | "warn";
  onClose: () => void;
  children: React.ReactNode;
}

function Toast({ variant, onClose, children }: ToastProps) {
  const accent = {
    success: "var(--color-success)",
    info: "var(--color-accent)",
    warn: "var(--color-warning)",
  }[variant];

  return (
    <div
      role={variant === "warn" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-xl border border-border bg-bg-surface px-4 py-3",
        "font-body text-sm text-text-primary shadow-lg shadow-bg-base/40 backdrop-blur",
      )}
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <div className="flex-1">{children}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-tertiary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        ✕
      </button>
    </div>
  );
}

function dismissKey(k: DismissibleKey): string {
  return `${DISMISS_PREFIX}${k}`;
}

function isDismissed(key: DismissibleKey): boolean {
  try {
    const raw = window.localStorage.getItem(dismissKey(key));
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_TTL_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

function persistDismiss(key: DismissibleKey): void {
  try {
    window.localStorage.setItem(dismissKey(key), String(Date.now()));
  } catch {
    // Ignore (private mode, blocked, etc.) — the banner just shows again
    // on next render, no functional harm.
  }
}
