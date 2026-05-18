"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { WatchStatus, WatchlistEntry } from "@miru/types";
import { Button } from "@miru/ui";
import { watchlistApi } from "@/lib/watchlist-api";

interface WatchlistButtonProps {
  animeId: string;
  initialEntry: WatchlistEntry | null;
  isAuthenticated: boolean;
}

const STATUS_LABELS: Record<WatchStatus, string> = {
  WATCHING: "En cours",
  COMPLETED: "Terminé",
  PLANNED: "À voir",
  ON_HOLD: "En pause",
  DROPPED: "Abandonné",
};

export function WatchlistButton({ animeId, initialEntry, isAuthenticated }: WatchlistButtonProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<WatchlistEntry | null>(initialEntry);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Button
        type="button"
        onClick={() => router.push(`/login?next=/anime/${animeId}`)}
        variant="outline"
      >
        Se connecter pour suivre
      </Button>
    );
  }

  function setStatus(status: WatchStatus) {
    setError(null);
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

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {entry ? (
          <>
            <span className="rounded-md bg-accent-muted px-3 py-1.5 font-body text-xs font-medium text-accent">
              {STATUS_LABELS[entry.status]}
            </span>
            <select
              aria-label="Modifier le statut"
              value={entry.status}
              onChange={(e) => setStatus(e.target.value as WatchStatus)}
              disabled={pending}
              className="rounded-md border border-border bg-bg-surface px-2.5 py-1.5 font-body text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              {(Object.keys(STATUS_LABELS) as WatchStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              type="button"
              onClick={remove}
              disabled={pending}
              className="text-text-tertiary hover:text-error"
            >
              Retirer
            </Button>
          </>
        ) : (
          <Button type="button" onClick={() => setStatus("PLANNED" as WatchStatus)} disabled={pending}>
            + Ajouter à ma watchlist
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="font-body text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
