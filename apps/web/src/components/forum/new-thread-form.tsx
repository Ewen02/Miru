"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { ForumCategory } from "@miru/types";
import { createThread } from "@/lib/forum-api";

const CATEGORIES: ForumCategory[] = [
  "GENERAL",
  "RECOMMENDATIONS",
  "NEWS",
  "HELP",
  "OFFTOPIC",
];

/** Collapsible "new thread" form. On success, navigates to the created thread. */
export function NewThreadForm({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useTranslations("forumPage");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ForumCategory>("GENERAL");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="rounded-md border border-border-subtle bg-bg-surface px-4 py-2 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated"
      >
        {t("loginToPost")}
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
        + {t("newThread")}
      </button>
    );
  }

  const submit = () => {
    if (pending || title.trim().length === 0 || body.trim().length === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await createThread({ title: title.trim(), category, body: body.trim() });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/forum/${result.id}`);
    });
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder={t("threadTitle")}
          className="flex-1 rounded-lg border border-border bg-bg-base px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ForumCategory)}
          aria-label={t("category")}
          className="rounded-lg border border-border bg-bg-base px-3 py-2.5 font-body text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`cat${c}`)}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={5000}
        rows={4}
        placeholder={t("body")}
        className="w-full resize-y rounded-lg border border-border bg-bg-base px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />
      <div className="mt-2 flex items-center justify-end gap-3">
        {error && <span className="font-body text-xs text-error">{error}</span>}
        <button
          type="button"
          onClick={submit}
          disabled={pending || !title.trim() || !body.trim()}
          className="inline-flex h-9 items-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base disabled:opacity-50"
        >
          {t("publish")}
        </button>
      </div>
    </div>
  );
}
