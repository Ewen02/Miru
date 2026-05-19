"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@miru/ui";
import { listsApi, type MyListSummary } from "@/lib/lists-api";

interface AddToListButtonProps {
  animeId: string;
  isAuthenticated: boolean;
}

/**
 * Opens a popover listing the user's lists with a click-to-add affordance.
 * Lists are fetched lazily on first open to keep the anime detail page light.
 */
export function AddToListButton({ animeId, isAuthenticated }: AddToListButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<MyListSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || lists != null) return;
    listsApi
      .listMine()
      .then(setLists)
      .catch(() => setError("Impossible de charger tes listes."));
  }, [open, lists]);

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?next=/anime/${animeId}`}
        className="inline-flex h-10 items-center rounded-md border border-border bg-bg-surface px-3 font-body text-sm text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
      >
        + Liste
      </Link>
    );
  }

  function handleAdd(listId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await listsApi.addItem(listId, animeId);
        setOpen(false);
        router.refresh();
      } catch (err) {
        const msg = (err as Error).message;
        // 409 happens when the anime is already in the list — common case.
        setError(msg.includes("409") ? "Déjà dans cette liste." : "Erreur lors de l'ajout.");
      }
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-md border border-border bg-bg-surface px-3 font-body text-sm text-text-secondary",
          "transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        )}
      >
        + Liste
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-72 overflow-hidden rounded-xl border border-border bg-bg-surface"
        >
          <header className="border-b border-border-subtle px-4 py-3">
            <p className="m-0 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
              Ajouter à une liste
            </p>
          </header>

          {lists == null ? (
            <p className="m-0 p-4 font-body text-sm text-text-tertiary">Chargement…</p>
          ) : lists.length === 0 ? (
            <p className="m-0 p-4 font-body text-sm text-text-tertiary">
              Tu n'as pas encore de liste.
            </p>
          ) : (
            <ul className="m-0 flex max-h-64 flex-col overflow-y-auto p-0">
              {lists.map((list) => (
                <li key={list.id}>
                  <button
                    type="button"
                    onClick={() => handleAdd(list.id)}
                    disabled={pending}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left font-body text-sm text-text-secondary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="truncate">{list.title}</span>
                    <span className="ml-3 shrink-0 font-mono text-[10px] text-text-tertiary">
                      {list.itemCount}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <footer className="border-t border-border-subtle p-2">
            <Link
              href="/lists"
              className="block rounded-md px-3 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-text-secondary transition-colors duration-150 hover:bg-bg-elevated hover:text-text-primary"
            >
              + Créer une nouvelle liste
            </Link>
          </footer>

          {error && (
            <p className="m-0 border-t border-border-subtle px-4 py-2 font-body text-xs text-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
