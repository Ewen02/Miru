"use client";

import type { EpisodeHeatmapDto, EpisodeReactionKind } from "@miru/types";
import { API_URL } from "./env";

export async function fetchEpisodeHeatmap(
  episodeId: string,
  bucketSeconds = 30,
): Promise<EpisodeHeatmapDto | null> {
  const url = new URL(`/episodes/${episodeId}/heatmap`, API_URL);
  url.searchParams.set("bucketSeconds", String(bucketSeconds));
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json() as Promise<EpisodeHeatmapDto>;
}

export async function addEpisodeReaction(
  episodeId: string,
  secondMark: number,
  kind: EpisodeReactionKind,
): Promise<EpisodeHeatmapDto | { error: string }> {
  const res = await fetch(new URL(`/episodes/${episodeId}/reactions`, API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secondMark, kind }),
  });
  if (res.status === 401) return { error: "Connecte-toi pour réagir." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<EpisodeHeatmapDto>;
}
