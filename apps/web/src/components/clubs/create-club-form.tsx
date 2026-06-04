"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClub } from "@/lib/clubs-api";

/** Collapsible create-club form. Navigates to the new club on success. */
export function CreateClubForm({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useTranslations("clubsPage");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="rounded-md border border-border-subtle bg-bg-surface px-4 py-2 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated"
      >
        {t("loginToCreate")}
      </button>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base"
      >
        + {t("newClub")}
      </button>
    );
  }

  const submit = () => {
    if (pending || name.trim().length < 2) return;
    setError(null);
    startTransition(async () => {
      const result = await createClub({ name: name.trim(), description: description.trim() || undefined });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/clubs/${result.slug}`);
    });
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={120}
        placeholder={t("name")}
        className="mb-3 w-full rounded-lg border border-border bg-bg-base px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder={t("description")}
        className="w-full resize-y rounded-lg border border-border bg-bg-base px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />
      <div className="mt-2 flex items-center justify-end gap-3">
        {error && <span className="font-body text-xs text-error">{error}</span>}
        <button
          type="button"
          onClick={submit}
          disabled={pending || name.trim().length < 2}
          className="inline-flex h-9 items-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base disabled:opacity-50"
        >
          {t("create")}
        </button>
      </div>
    </div>
  );
}
