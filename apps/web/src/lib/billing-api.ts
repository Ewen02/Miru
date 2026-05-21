"use client";

import { API_URL } from "./env";

export async function startCheckout(): Promise<{ url: string } | { error: string }> {
  const res = await fetch(new URL("/billing/checkout", API_URL), {
    method: "POST",
    credentials: "include",
  });
  if (res.status === 401) return { error: "Connecte-toi pour t'abonner." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<{ url: string }>;
}

export async function openBillingPortal(): Promise<{ url: string } | { error: string }> {
  const res = await fetch(new URL("/billing/portal", API_URL), {
    method: "POST",
    credentials: "include",
  });
  if (res.status === 401) return { error: "Connecte-toi." };
  if (res.status === 404) return { error: "Aucun abonnement actif." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<{ url: string }>;
}
