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
      <PageLink
        href={prev != null ? makeHref(prev) : undefined}
        label="← Précédent"
        ariaLabel="Page précédente"
      />
      <span className="uppercase tracking-wide text-text-tertiary">
        Page {currentPage} / {totalPages}
      </span>
      <PageLink
        href={next != null ? makeHref(next) : undefined}
        label="Suivant →"
        ariaLabel="Page suivante"
      />
    </nav>
  );
}

function PageLink({
  href,
  label,
  ariaLabel,
}: {
  href?: string;
  label: string;
  ariaLabel: string;
}) {
  // QW-08: mobile-first tap target ≥44×44 (WCAG 2.5.5). Desktop collapses to
  // the design system's denser pill via the md:h-9 md:min-h-0 override.
  const baseClass = cn(
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 py-1.5",
    "uppercase tracking-wide md:min-h-0 md:h-9",
    "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
  );

  if (!href) {
    // No target page → render a non-interactive span, not a hrefless anchor.
    return (
      <span
        aria-disabled="true"
        aria-label={ariaLabel}
        className={cn(
          baseClass,
          "cursor-not-allowed border-border-subtle bg-bg-surface text-text-tertiary",
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={cn(
        baseClass,
        "border-border bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
      )}
    >
      {label}
    </a>
  );
}
