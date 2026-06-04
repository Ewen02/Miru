"use client";

import type { PollDto } from "@miru/types";
import { API_URL } from "./env";

export async function voteOnPoll(
  pollId: string,
  optionId: string,
): Promise<PollDto | { error: string }> {
  const res = await fetch(new URL(`/polls/${pollId}/vote`, API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ optionId }),
  });
  if (res.status === 401) return { error: "Connecte-toi pour voter." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<PollDto>;
}
