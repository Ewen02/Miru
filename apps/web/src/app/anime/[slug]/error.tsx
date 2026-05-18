"use client";

import Link from "next/link";
import { Button } from "@miru/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[720px] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Erreur</p>
      <h1 className="font-display text-3xl font-semibold text-text-primary">
        Impossible de charger cette fiche
      </h1>
      <p className="font-body text-sm text-text-secondary">
        Une erreur est survenue pendant la récupération des données.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset}>
          Réessayer
        </Button>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wide text-text-tertiary transition-colors duration-200 hover:text-text-secondary"
        >
          ← Retour au catalogue
        </Link>
      </div>
    </main>
  );
}
