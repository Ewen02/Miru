import { cn } from "../../../utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  makeHref: (page: number) => string;
  className?: string;
}

export function Pagination({ currentPage, totalPages, makeHref, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prev = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex items-center justify-between gap-3 font-mono text-xs text-text-secondary",
        className,
      )}
    >
      <PageLink href={prev != null ? makeHref(prev) : undefined} label="← Précédent" />
      <span className="uppercase tracking-wide text-text-tertiary">
        Page {currentPage} / {totalPages}
      </span>
      <PageLink href={next != null ? makeHref(next) : undefined} label="Suivant →" />
    </nav>
  );
}

function PageLink({ href, label }: { href?: string; label: string }) {
  const baseClass = cn(
    "inline-flex items-center rounded-md border px-3 py-1.5 uppercase tracking-wide",
    "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
  );

  if (!href) {
    return (
      <a
        aria-disabled="true"
        tabIndex={-1}
        className={cn(
          baseClass,
          "cursor-not-allowed border-border-subtle bg-bg-surface text-text-tertiary",
        )}
      >
        {label}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={cn(
        baseClass,
        "border-border bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
      )}
    >
      {label}
    </a>
  );
}
