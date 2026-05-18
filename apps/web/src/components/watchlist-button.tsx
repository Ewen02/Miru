"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { WatchStatus, WatchlistEntry } from "@miru/types";
import { Button, cn } from "@miru/ui";
import { watchlistApi } from "@/lib/watchlist-api";

interface WatchlistButtonProps {
  animeId: string;
  /** Total number of episodes — drives the stepper bounds + label. */
  episodeCount: number | null;
  initialEntry: WatchlistEntry | null;
  isAuthenticated: boolean;
}

const STATUS_LABELS: Record<WatchStatus, string> = {
  WATCHING: "En cours",
  PLANNED: "À voir",
  ON_HOLD: "En pause",
  COMPLETED: "Terminé",
  DROPPED: "Abandonné",
};

const STATUS_ORDER: WatchStatus[] = [
  "WATCHING" as WatchStatus,
  "PLANNED" as WatchStatus,
  "ON_HOLD" as WatchStatus,
  "COMPLETED" as WatchStatus,
  "DROPPED" as WatchStatus,
];

export function WatchlistButton({
  animeId,
  episodeCount,
  initialEntry,
  isAuthenticated,
}: WatchlistButtonProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<WatchlistEntry | null>(initialEntry);
  const [error, setError] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!statusRef.current?.contains(e.target as Node)) setStatusOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStatusOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [statusOpen]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/login?next=/anime/${animeId}` as never)}
          >
            Se connecter pour suivre
          </Button>
          <span className="font-body text-xs text-text-tertiary">
            Suis ton avancement, note et reçois les nouveaux épisodes.
          </span>
        </div>
      </div>
    );
  }

  function setStatus(status: WatchStatus) {
    setError(null);
    setStatusOpen(false);
    startTransition(async () => {
      try {
        const updated = entry
          ? await watchlistApi.update(animeId, { status })
          : await watchlistApi.add(animeId, status);
        setEntry(updated);
        router.refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  function bumpEpisode(delta: number) {
    if (!entry) return;
    const next = Math.max(0, entry.currentEpisode + delta);
    if (episodeCount != null && next > episodeCount) return;
    setError(null);
    startTransition(async () => {
      try {
        const updated = await watchlistApi.update(animeId, { currentEpisode: next });
        setEntry(updated);
        router.refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        await watchlistApi.remove(animeId);
        setEntry(null);
        router.refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  // First-time add — single primary CTA.
  if (!entry) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => setStatus("PLANNED" as WatchStatus)}
            disabled={pending}
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            + Ajouter à ma watchlist
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStatus("COMPLETED" as WatchStatus)}
            disabled={pending}
            className="text-text-secondary"
          >
            Marquer comme vu
          </Button>
        </div>
        {error && (
          <p role="alert" className="mt-2 font-body text-xs text-error">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Status badge + dropdown */}
        <div ref={statusRef} className="relative">
          <button
            type="button"
            onClick={() => setStatusOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={statusOpen}
            disabled={pending}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-md px-3.5 font-body text-sm font-medium",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            style={{
              backgroundColor: "var(--color-accent-muted)",
              color: "var(--color-accent)",
            }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-accent)" }}
            />
            {STATUS_LABELS[entry.status]}
            <ChevronDownIcon />
          </button>

          {statusOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-bg-surface"
            >
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  role="menuitem"
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left font-body text-sm",
                    "transition-colors duration-150",
                    s === entry.status
                      ? "bg-bg-elevated text-text-primary"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                  )}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Episode stepper — only meaningful when status === WATCHING and episodeCount available */}
        {entry.status === ("WATCHING" as WatchStatus) && (
          <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-border bg-bg-base">
            <button
              type="button"
              onClick={() => bumpEpisode(-1)}
              disabled={pending || entry.currentEpisode <= 0}
              aria-label="Épisode précédent"
              className="flex h-full w-9 items-center justify-center text-text-secondary transition-colors duration-150 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MinusIcon />
            </button>
            <span className="flex h-full items-center gap-1 border-x border-border-subtle px-3.5 font-mono text-xs text-text-primary">
              ÉP. {entry.currentEpisode}
              {episodeCount != null && (
                <span className="text-text-tertiary">/{episodeCount}</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => bumpEpisode(+1)}
              disabled={
                pending || (episodeCount != null && entry.currentEpisode >= episodeCount)
              }
              aria-label="Épisode suivant"
              className="flex h-full w-9 items-center justify-center text-text-secondary transition-colors duration-150 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlusIcon />
            </button>
          </div>
        )}

        {/* Rating display (read-only here — the form below the page handles the edit). */}
        <div className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-bg-surface px-3 font-body text-xs">
          <span className="text-text-tertiary">Ma note</span>
          <span
            className="font-mono text-sm"
            style={{ color: entry.rating != null ? "var(--color-accent)" : "var(--color-text-tertiary)" }}
          >
            {entry.rating != null ? `${entry.rating.toFixed(1)}/10` : "—"}
          </span>
        </div>

        <div className="flex-1" />

        <Button
          variant="ghost"
          type="button"
          onClick={remove}
          disabled={pending}
          className="text-text-tertiary hover:text-error"
        >
          Retirer
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-2 font-body text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
