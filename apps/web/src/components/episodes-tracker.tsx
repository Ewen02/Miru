"use client";

import { useState, useTransition } from "react";
import { EpisodeRow, cn } from "@miru/ui";
import type { AnimeDetail } from "@miru/types";
import { episodesApi } from "@/lib/episodes-api";

interface EpisodesTrackerProps {
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
  episodes,
  animeTitle,
  initialWatchedIds,
  isAuthenticated,
}: EpisodesTrackerProps) {
  const [watched, setWatched] = useState<Set<string>>(() => new Set(initialWatchedIds));
  const [pending, startTransition] = useTransition();

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
          return (
            <div key={ep.id} className="flex items-center gap-2">
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
