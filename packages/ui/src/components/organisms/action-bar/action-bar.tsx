"use client";

import { cn } from "../../../utils/cn";

export type WatchStatusVariant = "watching" | "planned" | "completed" | "none";

interface ActionBarProps {
  status?: WatchStatusVariant;
  currentEpisode?: { num: number; title: string } | null;
  progress?: { watched: number; total: number } | null;
  inWatchlist?: boolean;
  onResume?: () => void;
  onToggleWatchlist?: () => void;
  onRate?: () => void;
  /** Désactive toutes les actions (mode pré-auth). */
  disabled?: boolean;
  className?: string;
}

const STATUS_LABEL: Record<WatchStatusVariant, string> = {
  watching: "En cours",
  planned: "À regarder",
  completed: "Terminé",
  none: "Découvrir",
};

function PlayIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PlusIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function CheckIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ActionBar({
  status = "none",
  currentEpisode = null,
  progress = null,
  inWatchlist = false,
  onResume,
  onToggleWatchlist,
  onRate,
  disabled = false,
  className,
}: ActionBarProps) {
  const percent = progress ? Math.round((progress.watched / progress.total) * 100) : 0;
  const primaryLabel = status === "watching" ? "Reprendre" : "Commencer";
  const primaryDisabled = disabled || status === "none";

  return (
    <div className={cn("mt-7 px-5", className)}>
      <div
        className="flex flex-col gap-3.5 rounded-xl border border-border bg-bg-surface p-4"
        style={{ borderLeft: "3px solid var(--color-accent)" }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div
              className="mb-1 font-body text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--color-accent)" }}
            >
              {STATUS_LABEL[status]}
            </div>
            {currentEpisode ? (
              <div className="font-display text-sm font-semibold text-text-primary">
                Épisode {currentEpisode.num} — {currentEpisode.title}
              </div>
            ) : (
              <div className="font-display text-sm font-semibold text-text-primary">
                {status === "completed"
                  ? "Terminé"
                  : status === "planned"
                    ? "Dans ta liste"
                    : "Pas encore commencé"}
              </div>
            )}
            {progress && (
              <div className="mt-0.5 font-mono text-[11px] text-text-tertiary">
                {progress.watched}/{progress.total} épisodes vus · {percent}%
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onResume}
            disabled={primaryDisabled}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2.5 font-body text-[13px] font-semibold text-white transition-opacity",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              "disabled:cursor-not-allowed",
            )}
            style={{
              backgroundColor: "var(--color-accent)",
              boxShadow: "0 4px 16px var(--color-accent-muted)",
            }}
          >
            <PlayIcon size={12} />
            {primaryLabel}
          </button>
        </div>

        {progress && (
          <div className="h-[3px] overflow-hidden rounded-sm bg-bg-elevated">
            <div
              className="h-full rounded-sm transition-all"
              style={{
                width: `${percent}%`,
                backgroundColor: "var(--color-accent)",
              }}
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggleWatchlist}
            disabled={disabled}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 font-body text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
              inWatchlist
                ? "border bg-accent-muted text-accent"
                : "border border-border bg-transparent text-text-secondary",
            )}
            style={
              inWatchlist
                ? { borderColor: "color-mix(in srgb, var(--color-accent) 33%, transparent)" }
                : undefined
            }
          >
            {inWatchlist ? <CheckIcon size={11} /> : <PlusIcon size={11} />}
            {inWatchlist ? "Dans ma liste" : "Ajouter à ma liste"}
          </button>
          <button
            type="button"
            onClick={onRate}
            disabled={disabled}
            className="rounded-md border border-border bg-transparent px-4 py-2 font-body text-xs font-medium text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Noter
          </button>
        </div>
      </div>
    </div>
  );
}
