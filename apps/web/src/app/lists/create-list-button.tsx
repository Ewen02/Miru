"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ModalShell, cn } from "@miru/ui";
import { listsApi } from "@/lib/lists-api";

export function CreateListButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (trimmed.length < 2) {
      setError("Le titre doit faire au moins 2 caractères.");
      return;
    }
    startTransition(async () => {
      try {
        const { id } = await listsApi.create({
          title: trimmed,
          description: description.trim() || undefined,
          isPublic,
        });
        setOpen(false);
        setTitle("");
        setDescription("");
        router.push(`/lists/${id}` as never);
      } catch (err) {
        const msg = (err as Error).message;
        setError(
          msg.includes("409")
            ? "Tu as déjà une liste avec ce nom."
            : "Erreur lors de la création.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-semibold"
        style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
      >
        + Créer une liste
      </button>

      <ModalShell open={open} onClose={() => setOpen(false)} ariaLabel="Créer une liste">
        <form onSubmit={handleSubmit}>
          <header className="border-b border-border-subtle px-5 py-4">
            <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
              Nouvelle liste
            </p>
            <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
              Créer une liste
            </h2>
          </header>

          <div className="flex flex-col gap-4 px-5 py-4">
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
                Titre
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                placeholder="Ma watchlist 2026, Comfort watch, …"
                className="h-10 rounded-md border border-border bg-bg-base px-3 font-body text-sm text-text-primary placeholder:text-text-quaternary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                autoFocus
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
                Description (optionnel)
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Un mot sur la sélection…"
                className="rounded-md border border-border bg-bg-base px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-quaternary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              />
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="accent-(--color-accent)"
              />
              <span className="font-body text-sm text-text-secondary">
                Liste publique (visible par tous)
              </span>
            </label>

            {error && (
              <p className="m-0 font-body text-xs text-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 items-center rounded-md px-3 font-body text-sm text-text-secondary transition-colors duration-200 hover:text-text-primary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className={cn(
                "inline-flex h-9 items-center rounded-md px-4 font-body text-sm font-semibold",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
            >
              {pending ? "Création…" : "Créer"}
            </button>
          </footer>
        </form>
      </ModalShell>
    </>
  );
}
