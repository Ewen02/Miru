"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteAccount } from "@/lib/preferences-api";
import { authClient } from "@/lib/auth-client";

/**
 * Hard delete the account. Two-step UX:
 *  1. Click red button → reveal a confirm input. Mirrors what the API
 *     enforces (the server-side DTO requires the literal string "DELETE").
 *  2. Type DELETE + submit → call API, sign out, redirect to landing.
 */
export function DeleteAccountSection() {
  const router = useRouter();
  const t = useTranslations("settings");
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    const res = await deleteAccount();
    if ("error" in res) {
      setError(res.error);
      setPending(false);
      return;
    }
    // Account is gone — clear session client-side and redirect.
    await authClient.signOut().catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
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
              if (confirmation === "DELETE") void handleConfirm();
            }}
            className="flex flex-col gap-3"
          >
            <p className="m-0 font-body text-xs text-text-secondary">
              {t("dangerConfirm")}
            </p>
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
