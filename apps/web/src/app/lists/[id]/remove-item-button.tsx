"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { listsApi } from "@/lib/lists-api";

export function RemoveItemButton({
  listId,
  animeId,
}: {
  listId: string;
  animeId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      try {
        await listsApi.removeItem(listId, animeId);
        router.refresh();
      } catch {
        // best-effort
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={pending}
      aria-label="Retirer de la liste"
      className="shrink-0 rounded-md border border-border bg-bg-base px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors duration-200 hover:border-error/40 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
    >
      Retirer
    </button>
  );
}
