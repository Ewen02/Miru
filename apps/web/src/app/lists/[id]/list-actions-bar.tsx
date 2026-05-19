"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@miru/ui";
import { listsApi } from "@/lib/lists-api";

interface ListActionsBarProps {
  listId: string;
  initialLiked: boolean;
  ownedByViewer: boolean;
}

export function ListActionsBar({ listId, initialLiked, ownedByViewer }: ListActionsBarProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [pending, startTransition] = useTransition();

  function handleLikeToggle() {
    const action = liked ? "unlike" : "like";
    setLiked(!liked);
    startTransition(async () => {
      try {
        await listsApi.toggleLike(listId, action);
        router.refresh();
      } catch {
        // revert on failure
        setLiked(liked);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Supprimer cette liste ? Cette action est irréversible.")) return;
    startTransition(async () => {
      try {
        await listsApi.remove(listId);
        router.push("/lists");
        router.refresh();
      } catch {
        // best-effort
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleLikeToggle}
        disabled={pending}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-md px-4 font-body text-sm font-semibold",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        style={
          liked
            ? { backgroundColor: "var(--color-accent)", color: "#08080c" }
            : {
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-surface)",
                color: "var(--color-text-secondary)",
              }
        }
      >
        {liked ? "❤ Liké" : "❤ J'aime"}
      </button>

      {ownedByViewer && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="inline-flex h-10 items-center rounded-md border border-error/30 bg-error-muted px-4 font-body text-sm font-medium text-error transition-colors duration-200 hover:bg-error/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Supprimer la liste
        </button>
      )}
    </div>
  );
}
