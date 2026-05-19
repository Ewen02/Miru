"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { sessionsApi } from "@/lib/sessions-api";

export function RevokeSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Révoquer cette session ? L'appareil sera déconnecté immédiatement.")) return;
    startTransition(async () => {
      try {
        await sessionsApi.revoke(sessionId);
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
      className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
    >
      Révoquer
    </button>
  );
}
