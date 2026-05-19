import { cn } from "../../../utils/cn";

interface EditorialSectionHeaderProps {
  /** Short mono uppercase label rendered above the title (e.g. "Communauté"). */
  eyebrow?: string;
  /** Display-font section title (e.g. "Avis publiés"). */
  title: string;
  /** Optional numeric count rendered right-aligned, mono. */
  count?: number | string | null;
  /** Optional action link, right-aligned next to (or replacing) the count. */
  action?: { label: string; href: string };
  className?: string;
}

/**
 * Larger editorial-style section header used on /genre, /u, /studios, etc.
 * Distinct from the compact `SectionHeader` (which lives inside the anime
 * detail template) — that one has an accent dash + small uppercase label.
 *
 * Use this when the section is a top-level page block. Use SectionHeader
 * when the section sits inside a denser content frame.
 */
export function EditorialSectionHeader({
  eyebrow,
  title,
  count,
  action,
  className,
}: EditorialSectionHeaderProps) {
  return (
    <header className={cn("mb-6 flex items-baseline justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="m-0 mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            {eyebrow}
          </p>
        )}
        <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
          {title}
        </h2>
      </div>
      {(count != null || action) && (
        <div className="flex items-baseline gap-3">
          {count != null && (
            <span className="font-mono text-[11px] text-text-tertiary">{count}</span>
          )}
          {action && (
            <a
              href={action.href}
              className="font-mono text-[10px] uppercase tracking-wider text-text-secondary transition-colors duration-200 hover:text-text-primary"
            >
              {action.label} →
            </a>
          )}
        </div>
      )}
    </header>
  );
}
