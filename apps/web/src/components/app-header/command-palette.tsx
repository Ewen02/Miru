"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { AnimeCard } from "@miru/types";
import { cn } from "@miru/ui";
import { API_URL } from "@/lib/env";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}


interface CatalogPage {
  data: AnimeCard[];
  total: number;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  // Reset and focus on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setHighlighted(0);
      // next tick so the dialog is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL("/animes", API_URL);
        url.searchParams.set("search", query.trim());
        url.searchParams.set("pageSize", "8");
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as CatalogPage;
        if (!cancelled) {
          setResults(data.data);
          setHighlighted(0);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const pick = results[highlighted];
        if (pick) {
          e.preventDefault();
          router.push(`/anime/${pick.slug}`);
          onClose();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, results, highlighted, onClose, router]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg-base/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mt-30 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-bg-surface">
        <div className="flex items-center gap-3.5 border-b border-border-subtle px-5 py-4">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un anime, un studio, une personne…"
            className="flex-1 bg-transparent font-body text-base text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-text-tertiary">
            ESC
          </kbd>
        </div>

        <div className="max-h-100 overflow-y-auto">
          {query.trim().length < 2 ? (
            <p className="px-5 py-6 font-body text-sm text-text-tertiary">
              Tape au moins 2 caractères pour rechercher.
            </p>
          ) : loading && results.length === 0 ? (
            <p className="px-5 py-6 font-body text-sm text-text-tertiary">Recherche…</p>
          ) : results.length === 0 ? (
            <p className="px-5 py-6 font-body text-sm text-text-tertiary">
              Aucun résultat pour « {query.trim()} ».
            </p>
          ) : (
            <ul className="py-2">
              {results.map((anime, i) => (
                <li key={anime.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => {
                      router.push(`/anime/${anime.slug}`);
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors duration-150",
                      highlighted === i ? "bg-bg-elevated" : "hover:bg-bg-elevated/60",
                    )}
                  >
                    <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-sm bg-bg-elevated">
                      {anime.coverUrl && (
                        <Image
                          src={anime.coverUrl}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold text-text-primary">
                        {anime.title}
                      </p>
                      <p className="truncate font-mono text-[10px] tracking-wider text-text-tertiary uppercase">
                        {[anime.format, anime.year, anime.studioName].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {anime.averageRating != null && (
                      <span className="shrink-0 font-mono text-xs text-text-secondary">
                        <span className="text-accent">★</span> {anime.averageRating.toFixed(1)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border-subtle px-5 py-2.5 font-mono text-[10px] tracking-wider text-text-tertiary uppercase">
          <span className="flex gap-3">
            <Hint k="↑↓">Naviguer</Hint>
            <Hint k="↵">Ouvrir</Hint>
          </span>
          <Hint k="ESC">Fermer</Hint>
        </div>
      </div>
    </div>
  );
}

function Hint({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="rounded-sm border border-border px-1 py-px text-text-secondary">{k}</kbd>
      {children}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
      className="text-text-tertiary"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
