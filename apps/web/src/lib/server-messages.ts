import "server-only";
import { cookies } from "next/headers";
import type { ConversationDetailDto, ConversationSummaryDto } from "@miru/types";
import { API_URL } from "./env";

async function cookieHeader(): Promise<string | null> {
  const store = await cookies();
  const header = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return header || null;
}

/** The viewer's conversations. Null when unauthenticated. */
export async function fetchConversations(): Promise<ConversationSummaryDto[] | null> {
  const header = await cookieHeader();
  if (!header) return null;
  const res = await fetch(new URL("/messages", API_URL), {
    headers: { cookie: header },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<ConversationSummaryDto[]>;
}

/** One conversation with its messages. Null when unauthenticated or not found. */
export async function fetchConversation(id: string): Promise<ConversationDetailDto | null> {
  const header = await cookieHeader();
  if (!header) return null;
  const res = await fetch(new URL(`/messages/${id}`, API_URL), {
    headers: { cookie: header },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) throw new Error(`Miru API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<ConversationDetailDto>;
}
