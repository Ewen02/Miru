"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateBio } from "@/lib/bio-api";

interface Props {
  /** Pre-fetched value so the textarea shows the current bio on mount. */
  initial: string | null;
  /** User handle for the i18n hint copy ("/u/{handle}"). */
  handle: string;
}

const MAX_LENGTH = 250;

export function BioSection({ initial, handle }: Props) {
  const t = useTranslations("settingsBio");
  const [value, setValue] = useState(initial ?? "");
  const [savedValue, setSavedValue] = useState(initial ?? "");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = value.trim() !== (savedValue ?? "");
  const tooLong = value.length > MAX_LENGTH;

  function handleSave() {
    if (!dirty || tooLong) return;
    setStatus("idle");
    setError(null);
    startTransition(async () => {
      const res = await updateBio(value);
      if ("error" in res) {
        setStatus("error");
        setError(res.error);
        return;
      }
      const next = res.bio ?? "";
      setSavedValue(next);
      setValue(next);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    });
  }

  return (
    <section>
      <header className="mb-5">
        <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
          {t("title")}
        </h2>
        <p className="m-0 mt-1 font-body text-sm text-text-tertiary">
          {t("description", { handle })}
        </p>
      </header>
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-bg-surface p-5">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("placeholder")}
          rows={3}
          maxLength={MAX_LENGTH + 30 /* visual slack; we cap on submit */}
          className="w-full resize-none rounded-md border border-border bg-bg-base px-3 py-2 font-body text-sm leading-relaxed text-text-primary placeholder:text-text-quaternary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />
        <div className="flex items-center justify-between gap-3">
          <span
            className="font-mono text-[10px]"
            style={{
              color: tooLong ? "var(--color-error)" : "var(--color-text-tertiary)",
            }}
          >
            {value.length}/{MAX_LENGTH}
          </span>
          <div className="flex items-center gap-3">
            {status === "saved" && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-success">
                {t("saved")}
              </span>
            )}
            {status === "error" && error && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-error">
                {t("error")}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={pending || !dirty || tooLong}
              className="inline-flex h-9 items-center rounded-md bg-accent px-4 font-body text-sm font-medium text-bg-base transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
