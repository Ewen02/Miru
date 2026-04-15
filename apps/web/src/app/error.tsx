"use client";

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
        Quelque chose s&apos;est mal passé
      </h1>
      <p className="font-body text-sm text-text-secondary">
        Le catalogue n&apos;a pas pu se charger.
      </p>
      <Button variant="primary" onClick={reset}>
        Réessayer
      </Button>
    </main>
  );
}
