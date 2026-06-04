"use client";

import type { ConversationDetailDto, DirectMessageDto } from "@miru/types";
import { API_URL } from "./env";

export async function openConversation(
  peerId: string,
): Promise<ConversationDetailDto | { error: string }> {
  const res = await fetch(new URL("/messages/open", API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ peerId }),
  });
  if (res.status === 401) return { error: "Connecte-toi pour envoyer un message." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<ConversationDetailDto>;
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<DirectMessageDto | { error: string }> {
  const res = await fetch(new URL(`/messages/${conversationId}`, API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (res.status === 401) return { error: "Connecte-toi pour envoyer un message." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<DirectMessageDto>;
}
