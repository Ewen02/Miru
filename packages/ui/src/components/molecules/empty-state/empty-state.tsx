import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "../../../utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional decorative visual rendered above the title — kept abstract. */
  icon?: ReactNode;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

/**
 * Friendly fallback shown when a list is empty. Centers a soft block
 * with an optional abstract icon, a Display title, a subtitle, and up to
 * two actions — primary in accent, secondary as a quiet link.
 */
export function EmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-border-subtle bg-bg-surface px-6 py-16",
        "text-center",
        className,
      )}
    >
      {icon ?? <DefaultIcon />}
      <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-text-primary">
        {title}
      </h2>
      {description && (
        <p className="m-0 max-w-md font-body text-sm text-text-secondary">{description}</p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className={cn(
                "inline-flex h-10 items-center rounded-md px-4 font-body text-sm font-medium",
                "transition-opacity duration-200 hover:opacity-90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              )}
              style={{ backgroundColor: "var(--color-accent)", color: "#08080c" }}
            >
              {primaryAction.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className={cn(
                "inline-flex h-10 items-center font-mono text-xs tracking-wider text-text-secondary uppercase",
                "transition-colors duration-200 hover:text-text-primary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded-sm",
              )}
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function DefaultIcon() {
  return (
    <div
      aria-hidden
      className="grid h-14 w-14 place-items-center rounded-xl border border-border bg-bg-elevated text-text-tertiary"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16M4 12h10M4 17h7" />
      </svg>
    </div>
  );
}
