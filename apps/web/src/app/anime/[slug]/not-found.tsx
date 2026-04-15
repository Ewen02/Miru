import Link from "next/link";

export default function AnimeNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[720px] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">404</p>
      <h1 className="font-display text-3xl font-semibold text-text-primary">Anime introuvable</h1>
      <p className="font-body text-sm text-text-secondary">
        Cet anime n&apos;existe pas ou n&apos;a pas encore été importé.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-surface px-4 py-2 font-mono text-xs uppercase tracking-wide text-text-secondary transition-colors duration-200 hover:bg-bg-elevated hover:text-text-primary"
      >
        ← Retour au catalogue
      </Link>
    </main>
  );
}
