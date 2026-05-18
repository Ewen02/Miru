"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@miru/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-300 items-center justify-center px-7 py-14">
      <div className="flex w-full max-w-xl flex-col items-center gap-5 rounded-2xl border border-border-subtle bg-bg-surface px-6 py-14 text-center">
        <div
          aria-hidden
          className="grid h-14 w-14 place-items-center rounded-2xl border border-error/30 text-error"
          style={{ backgroundColor: "var(--color-error-muted)" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="m10.29 3.86-8.18 14a2 2 0 0 0 1.71 3h16.36a2 2 0 0 0 1.71-3l-8.18-14a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
        <p className="m-0 font-mono text-[10px] tracking-[0.22em] text-text-tertiary uppercase">
          Erreur
        </p>
        <h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-text-primary">
          Quelque chose s&apos;est mal passé.
        </h1>
        <p className="m-0 max-w-md font-body text-sm text-text-secondary">
          Ce n&apos;est pas toi, c&apos;est nous. Réessaie dans un instant ou retourne au catalogue
          le temps que ça revienne.
        </p>
        {error.digest && (
          <p className="m-0 font-mono text-[10px] text-text-quaternary">
            ref · {error.digest}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            onClick={reset}
            style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
          >
            Réessayer
          </Button>
          <Link
            href="/"
            className="inline-flex h-10 items-center font-mono text-xs tracking-wider text-text-secondary uppercase transition-colors duration-200 hover:text-text-primary"
          >
            ← Catalogue
          </Link>
        </div>
      </div>
    </main>
  );
}
