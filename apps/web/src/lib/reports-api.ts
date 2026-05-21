"use client";

import { API_URL } from "./env";
import type { ReportReason, ReportTargetKind } from "@miru/types";

export async function fileReport(input: {
  targetKind: ReportTargetKind;
  targetId: string;
  reason: ReportReason;
  details?: string;
}): Promise<{ id: string } | { error: string }> {
  const res = await fetch(new URL("/reports", API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (res.status === 401) return { error: "Connecte-toi pour signaler." };
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return res.json() as Promise<{ id: string }>;
}

export async function dismissReport(id: string): Promise<{ ok: true } | { error: string }> {
  const res = await fetch(new URL(`/admin/reports/${id}/dismiss`, API_URL), {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return { ok: true };
}

export async function deleteReportTarget(
  id: string,
  targetKind: ReportTargetKind,
  targetId: string,
): Promise<{ ok: true } | { error: string }> {
  const res = await fetch(new URL(`/admin/reports/${id}/delete-target`, API_URL), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ targetKind, targetId }),
  });
  if (!res.ok) return { error: `Erreur ${res.status}` };
  return { ok: true };
}
