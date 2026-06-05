"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { deleteAccount, restoreAccount } from "@/lib/preferences-api";
import { authClient } from "@/lib/auth-client";

interface DeleteAccountSectionProps {
  /**
   * ISO string when the account is already soft-deleted (i.e. fetchMe()
   * reported a deletedAt). Drives the alternate "your account is scheduled
   * for deletion" UI with the Restore CTA. Null means active account, render
   * the standard delete flow.
   */
  initialDeletedAt: string | null;
}

const GRACE_DAYS = 30;

/**
 * S4-03 — soft delete with a 30-day grace window:
 *  - Active account: "Supprimer" → confirm modal → POST DELETE /users/me →
 *    page flips to the scheduled state.
 *  - Scheduled account: shows the projected hard-delete date + "Annuler la
 *    suppression" → POST /users/me/restore → back to active state.
 *
 * Sign-out is deliberately NOT triggered on delete: the owner stays logged
 * in during the grace window so the Restore CTA is one click away if they
 * change their mind.
 */
export function DeleteAccountSection({ initialDeletedAt }: DeleteAccountSectionProps) {
  const router = useRouter();
  const t = useTranslations("settings");
  const [deletedAt, setDeletedAt] = useState<string | null>(initialDeletedAt);
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirmDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteAccount();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setDeletedAt(res.deletedAt);
      setOpen(false);
      setConfirmation("");
      router.refresh();
    });
  }

  function handleRestore() {
    setError(null);
    startTransition(async () => {
      const res = await restoreAccount();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setDeletedAt(null);
      router.refresh();
    });
  }

  async function handleSignOut() {
    await authClient.signOut().catch(() => {});
    router.push("/");
    router.refresh();
  }

  // --- Scheduled-for-deletion state ----------------------------------------
  if (deletedAt) {
    const dt = new Date(deletedAt);
    const hardDeleteDate = new Date(dt.getTime() + GRACE_DAYS * 86_400_000);
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
    return (
      <section>
        <header className="mb-5">
          <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-warning">
            {t("scheduledTitle")}
          </h2>
        </header>
        <div className="rounded-2xl border border-warning/30 bg-warning/8 p-5">
          <p className="m-0 mb-3 font-body text-sm text-text-secondary">
            {t("scheduledBody", { date: fmt(hardDeleteDate) })}
          </p>
          {error && (
            <p className="m-0 mb-3 font-body text-xs text-error" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRestore}
              disabled={pending}
              className="inline-flex h-9 items-center rounded-md border border-warning/40 bg-bg-base px-4 font-body text-sm font-medium text-warning transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? t("scheduledRestoring") : t("scheduledRestoreCta")}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={pending}
              className="font-mono text-xs uppercase tracking-wider text-text-tertiary transition-colors duration-150 hover:text-text-secondary disabled:opacity-50"
            >
              {t("scheduledSignOut")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // --- Active state — original delete flow --------------------------------
  return (
    <section>
      <header className="mb-5">
        <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-error">
          {t("dangerTitle")}
        </h2>
      </header>
      <div className="rounded-2xl border border-error/30 bg-error-muted p-5">
        <p className="m-0 mb-3 font-body text-sm text-text-secondary">{t("dangerDescription")}</p>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 items-center rounded-md border border-error/40 bg-bg-base px-4 font-body text-sm font-medium text-error transition-colors duration-200 hover:bg-error-muted"
          >
            {t("dangerCta")}
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (confirmation === "DELETE") handleConfirmDelete();
            }}
            className="flex flex-col gap-3"
          >
            <p className="m-0 font-body text-xs text-text-secondary">{t("dangerConfirm")}</p>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoFocus
              placeholder="DELETE"
              className="h-10 w-full rounded-md border border-error/40 bg-bg-base px-3 font-mono text-sm text-text-primary"
            />
            {error && (
              <p className="m-0 font-body text-xs text-error" role="alert">
                {error}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={pending || confirmation !== "DELETE"}
                className="inline-flex h-9 items-center rounded-md bg-error px-4 font-body text-sm font-semibold text-bg-base transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? t("dangerPending") : t("dangerConfirmCta")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirmation("");
                  setError(null);
                }}
                disabled={pending}
                className="font-mono text-xs uppercase tracking-wider text-text-tertiary hover:text-text-secondary disabled:opacity-50"
              >
                {t("dangerCancel")}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
