"use client";

import { useState, useTransition } from "react";
import { EpisodeRow, cn } from "@miru/ui";
import type { AnimeDetail } from "@miru/types";
import { episodesApi } from "@/lib/episodes-api";
import { watchlistApi } from "@/lib/watchlist-api";
import { EpisodeHeatmap } from "@/components/episode-heatmap";

interface EpisodesTrackerProps {
  /** Anime id — required to bulk-mark via the watchlist API. */
  animeId: string;
  episodes: AnimeDetail["episodes"];
  animeTitle: string;
  /** Initial set of episode ids the user has marked as watched. */
  initialWatchedIds: string[];
  /** Anonymous visitors get the read-only EpisodeRow stack. */
  isAuthenticated: boolean;
}

/**
 * Wraps the episode list with per-row "watched" checkboxes for logged-in
 * users. The optimistic update flips local state immediately; on network
 * error we revert. The server upsert is idempotent so duplicate toggles
 * are safe.
 */
export function EpisodesTracker({
  animeId,
  episodes,
  animeTitle,
  initialWatchedIds,
  isAuthenticated,
}: EpisodesTrackerProps) {
  const [watched, setWatched] = useState<Set<string>>(() => new Set(initialWatchedIds));
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bulkPending, setBulkPending] = useState<string | null>(null);

  function bulkMarkUpTo(episodeId: string, episodeNumber: number) {
    setBulkPending(episodeId);
    const targetIds = episodes
      .filter((e) => e.number <= episodeNumber)
      .map((e) => e.id);
    const previous = new Set(watched);
    setWatched((prev) => {
      const next = new Set(prev);
      for (const id of targetIds) next.add(id);
      return next;
    });
    startTransition(async () => {
      try {
        await watchlistApi.bulkMarkUpTo(animeId, episodeNumber);
      } catch {
        setWatched(previous);
      } finally {
        setBulkPending(null);
      }
    });
  }

  function toggle(episodeId: string) {
    const wasWatched = watched.has(episodeId);
    // Optimistic toggle.
    setWatched((prev) => {
      const next = new Set(prev);
      if (wasWatched) next.delete(episodeId);
      else next.add(episodeId);
      return next;
    });
    startTransition(async () => {
      try {
        if (wasWatched) await episodesApi.unmarkWatched(episodeId);
        else await episodesApi.markWatched(episodeId);
      } catch {
        // Revert on failure.
        setWatched((prev) => {
          const next = new Set(prev);
          if (wasWatched) next.add(episodeId);
          else next.delete(episodeId);
          return next;
        });
      }
    });
  }

  if (episodes.length === 0) {
    return (
      <div className="mx-5 rounded-lg border border-border-subtle bg-bg-surface p-6 text-center font-body text-sm text-text-tertiary">
        Aucun épisode enregistré pour cet anime.
      </div>
    );
  }

  return (
    <div className="px-5">
      <div className="flex max-h-[70vh] flex-col gap-px overflow-y-auto rounded-2xl border border-border bg-bg-surface px-1 py-2">
        {episodes.map((ep) => {
          const isWatched = watched.has(ep.id);
          const isExpanded = expanded === ep.id;
          return (
            <div key={ep.id} className="flex flex-col">
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => toggle(ep.id)}
                  disabled={pending}
                  aria-pressed={isWatched}
                  aria-label={
                    isWatched
                      ? `Marquer ép. ${ep.number} comme non vu`
                      : `Marquer ép. ${ep.number} comme vu`
                  }
                  className={cn(
                    "ml-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    isWatched
                      ? "border-accent"
                      : "border-border bg-bg-base hover:border-border",
                  )}
                  style={isWatched ? { backgroundColor: "var(--color-accent)" } : undefined}
                >
                  {isWatched && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#08080c"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              )}
              <div className="min-w-0 flex-1">
                <EpisodeRow
                  number={ep.number}
                  title={ep.title}
                  duration={ep.duration}
                  url={ep.url}
                  searchQuery={`${animeTitle} episode ${ep.number}`}
                />
              </div>
              {isAuthenticated && !isWatched && (
                <button
                  type="button"
                  onClick={() => bulkMarkUpTo(ep.id, ep.number)}
                  disabled={pending || bulkPending !== null}
                  aria-label={`Marquer jusqu'à l'épisode ${ep.number} comme vu`}
                  title={`Marquer jusqu'à l'ép. ${ep.number}`}
                  className="shrink-0 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {bulkPending === ep.id ? "…" : "↡"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : ep.id)}
                aria-expanded={isExpanded}
                aria-label={`Réactions ép. ${ep.number}`}
                className="mr-1.5 shrink-0 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-secondary"
              >
                {isExpanded ? "×" : "❤"}
              </button>
            </div>
            {isExpanded && (
              <div className="px-1.5 pb-3 pt-1">
                <EpisodeHeatmap
                  episodeId={ep.id}
                  durationSeconds={ep.duration != null ? ep.duration * 60 : null}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            )}
            </div>
          );
        })}
      </div>
      {isAuthenticated && watched.size > 0 && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          {watched.size} / {episodes.length} épisode{episodes.length > 1 ? "s" : ""} vu
          {watched.size > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
