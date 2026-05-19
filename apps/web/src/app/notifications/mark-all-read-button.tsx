"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { notificationsApi } from "@/lib/notifications-api";

export function MarkAllReadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await notificationsApi.markAllRead();
        router.refresh();
      } catch {
        // best-effort
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex h-9 items-center rounded-md border border-border bg-bg-surface px-3 font-body text-xs text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      Tout marquer comme lu
    </button>
  );
}
