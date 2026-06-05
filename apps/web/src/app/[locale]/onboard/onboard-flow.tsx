"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Logo, cn } from "@miru/ui";
import { API_URL } from "@/lib/env";

interface StarterPick {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
}

interface GenreOption {
  slug: string;
  name: string;
}

interface OnboardFlowProps {
  starters: StarterPick[];
  genres: GenreOption[];
}

const STEP_KEYS = ["stepImport", "stepFavorites", "stepGenres"] as const;
const TOTAL_STEPS = STEP_KEYS.length;
const PICKS_REQUIRED = 3;

interface ImportResult {
  totalFetched: number;
  imported: number;
  skipped: number;
}

const DEFAULT_PRESELECTED_GENRES = new Set([
  "slice-of-life",
  "drama",
  "romance",
  "sci-fi",
  "mystery",
  "fantasy",
]);

export function OnboardFlow({ starters, genres }: OnboardFlowProps) {
  const ta11y = useTranslations("a11y");
  const t = useTranslations("onboardPage");
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [anilistUsername, setAnilistUsername] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, startImport] = useTransition();
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(() => {
    // Preselect the curated default set, intersected with what the API
    // actually returned — avoids ticking a genre that no longer exists.
    const initial = new Set<string>();
    for (const g of genres) {
      if (DEFAULT_PRESELECTED_GENRES.has(g.slug)) initial.add(g.slug);
    }
    return initial;
  });

  const togglePick = (id: string) => {
    setPicks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGenre = (slug: string) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const canAdvance =
    step === 0 || (step === 1 && picks.size >= PICKS_REQUIRED) || step === 2;
  const isFinal = step === TOTAL_STEPS - 1;

  function handleAniListImport(e: React.FormEvent) {
    e.preventDefault();
    setImportError(null);
    setImportResult(null);
    startImport(async () => {
      try {
        const res = await fetch(`${API_URL}/watchlist/import/anilist`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: anilistUsername.trim() }),
        });
        if (res.status === 401) {
          setImportError(t("importErrorAuth"));
          return;
        }
        if (!res.ok) {
          const body = await res.text();
          setImportError(
            body.includes("not found") || body.includes("introuvable")
              ? t("importErrorNotFound")
              : t("importErrorFailed"),
          );
          return;
        }
        const data = (await res.json()) as ImportResult;
        setImportResult(data);
      } catch {
        setImportError(t("importErrorNetwork"));
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" aria-label={ta11y("homeMiru")} className="text-text-primary">
          <Logo size={20} />
        </Link>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        >
          {t("skip")}
        </Link>
      </header>

      <div className="mb-10 h-1 overflow-hidden rounded-sm bg-bg-elevated">
        <div
          className="h-full transition-[width] duration-300 ease-out"
          style={{
            width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
            backgroundColor: "var(--color-accent)",
          }}
        />
      </div>

      <p className="m-0 mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
        {t("stepLabel", { current: step + 1, total: TOTAL_STEPS, name: t(STEP_KEYS[step]) })}
      </p>

      {step === 0 && (
        <section className="mb-12">
          <h1 className="m-0 mb-3 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
            {t("importTitle")}
          </h1>
          <p className="m-0 mb-8 font-body text-base text-text-secondary">
            {t("importSubtitle")}
          </p>

          <form
            onSubmit={handleAniListImport}
            className="flex flex-col gap-3 rounded-xl border border-border bg-bg-surface p-5"
          >
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
                {t("anilistUsername")}
              </span>
              <input
                type="text"
                value={anilistUsername}
                onChange={(e) => setAnilistUsername(e.target.value)}
                placeholder={t("anilistPlaceholder")}
                maxLength={50}
                className="h-11 rounded-md border border-border bg-bg-base px-3 font-body text-base text-text-primary placeholder:text-text-quaternary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              />
            </label>
            <button
              type="submit"
              disabled={importing || anilistUsername.trim().length < 2}
              className="inline-flex h-11 items-center justify-center rounded-md font-body text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-on-accent)" }}
            >
              {importing ? t("importing") : t("importCta")}
            </button>
            <p className="m-0 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              {t("importHint")}
            </p>

            {importError && (
              <p
                className="m-0 rounded-md border border-error/30 bg-error-muted px-3 py-2 font-body text-xs text-error"
                role="alert"
              >
                {importError}
              </p>
            )}

            {importResult && (
              <p
                className="m-0 rounded-md border px-3 py-2 font-body text-xs"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-success) 30%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--color-success) 8%, var(--color-bg-base))",
                  color: "var(--color-success)",
                }}
              >
                ✓ {t("importSuccess", { count: importResult.imported })}
                {importResult.skipped > 0 && (
                  <> · {t("importSkipped", { count: importResult.skipped })}</>
                )}
              </p>
            )}
          </form>
        </section>
      )}

      {step === 1 && (
        <section className="mb-12">
          <h1 className="m-0 mb-3 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
            {t("favoritesTitle", { count: PICKS_REQUIRED })}
          </h1>
          <p className="m-0 mb-8 font-body text-base text-text-secondary">
            {t("favoritesSubtitle")}
          </p>
          {starters.length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
              <p className="m-0 font-body text-sm text-text-tertiary">
                {t("favoritesUnavailable")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {starters.map((p, idx) => {
                const selected = picks.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePick(p.id)}
                    aria-pressed={selected}
                    title={p.title}
                    className={cn(
                      "group relative aspect-3/4 overflow-hidden rounded-xl border-2 text-left",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                      selected ? "border-accent" : "border-border-subtle",
                    )}
                    style={
                      p.coverUrl
                        ? undefined
                        : {
                            background: `linear-gradient(${140 + idx * 12}deg, color-mix(in srgb, var(--color-accent) ${15 + (idx * 4) % 30}%, transparent), var(--color-bg-elevated))`,
                          }
                    }
                  >
                    {p.coverUrl && (
                      <Image
                        src={p.coverUrl}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 160px, 100px"
                        className="object-cover"
                      />
                    )}
                    {selected && (
                      <span
                        aria-hidden
                        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-sm"
                        style={{ backgroundColor: "var(--color-accent)", color: "var(--color-on-accent)" }}
                      >
                        ✓
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-bg-base/90 to-transparent p-2 text-xs font-medium text-text-primary">
                      {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-4 font-mono text-xs text-text-tertiary">
            {t(picks.size > 1 ? "favoritesCountPlural" : "favoritesCount", {
              count: picks.size,
              required: PICKS_REQUIRED,
            })}
          </p>
        </section>
      )}

      {step === 2 && (
        <section className="mb-12">
          <h1 className="m-0 mb-3 font-display text-3xl font-semibold tracking-[-0.025em] text-text-primary sm:text-4xl">
            {t("genresTitle")}
          </h1>
          <p className="m-0 mb-8 font-body text-base text-text-secondary">
            {t("genresSubtitle")}
          </p>
          {genres.length === 0 ? (
            <p className="m-0 font-body text-sm text-text-tertiary">
              {t("genresUnavailable")}
            </p>
          ) : (
            <div className="mb-8 flex flex-wrap gap-2">
              {genres.map((g) => {
                const active = selectedGenres.has(g.slug);
                return (
                  <button
                    key={g.slug}
                    type="button"
                    onClick={() => toggleGenre(g.slug)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex h-9 items-center rounded-md border px-3 font-body text-sm transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                      active
                        ? "border-accent/40 bg-accent/15"
                        : "border-border bg-bg-surface text-text-secondary hover:text-text-primary",
                    )}
                    style={active ? { color: "var(--color-accent)" } : undefined}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      <footer className="mt-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="font-mono text-xs uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-text-secondary disabled:opacity-40"
        >
          {t("previous")}
        </button>
        {isFinal ? (
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-md px-5 font-body text-sm font-semibold"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-on-accent)" }}
          >
            {t("finish")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => canAdvance && setStep((s) => s + 1)}
            disabled={!canAdvance}
            className="inline-flex h-10 items-center rounded-md px-5 font-body text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-on-accent)" }}
          >
            {t("next")}
          </button>
        )}
      </footer>
    </main>
  );
}
